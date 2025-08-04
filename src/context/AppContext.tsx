"use client";

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import type { Product, CartItem, Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { auth, db, storage } from '@/lib/firebase';
import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, getDocs, addDoc, doc, updateDoc, query, orderBy, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FirebaseError } from 'firebase/app';

interface AppContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  isLoggedIn: boolean;
  user: User | null;
  login: (email:string, password:string) => Promise<any>;
  signup: (email:string, password:string) => Promise<any>;
  logout: () => void;
  addProduct: (product: Omit<Product, 'id' | 'image'> & { image: File }) => Promise<void>;
  orders: Order[];
  addOrder: (order: Omit<Order, 'id'>) => Promise<void>;
  toggleOrderShipped: (orderId: string) => void;
  loading: boolean;
  userOrders: Order[];
}

export const AppContext = createContext<AppContextType>({} as AppContextType);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoggedIn(!!currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(db, 'products');
        const productSnapshot = await getDocs(query(productsCollection, orderBy("name")));
        const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(productList);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({ title: "Error", description: "Could not fetch products.", variant: "destructive" });
      }
    };
    
    const fetchAllOrders = async () => {
        try {
          const ordersCollection = collection(db, 'orders');
          const orderSnapshot = await getDocs(query(ordersCollection, orderBy("orderDate", "desc")));
          const orderList = orderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
          setOrders(orderList);
        } catch (error) {
          console.error("Error fetching orders:", error);
          toast({ title: "Error", description: "Could not fetch orders.", variant: "destructive" });
        }
      };

    fetchProducts();
    fetchAllOrders(); // For seller panel

    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));

  }, [toast]);

  useEffect(() => {
    if(cart.length > 0 || localStorage.getItem('cart')) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  useEffect(() => {
    const fetchUserOrders = async () => {
        if (user) {
            try {
                const ordersCollection = collection(db, 'orders');
                const q = query(ordersCollection, where("userId", "==", user.uid), orderBy("orderDate", "desc"));
                const orderSnapshot = await getDocs(q);
                const orderList = orderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
                setUserOrders(orderList);
            } catch (error) {
                console.error("Error fetching user orders:", error);
                toast({ title: "Error", description: "Could not fetch your orders.", variant: "destructive" });
            }
        } else {
            setUserOrders([]);
        }
    }
    fetchUserOrders();
  }, [user, toast]);


  const addToCart = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };
  
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  const login = (email:string, password:string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = (email:string, password:string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  const logout = async () => {
    await signOut(auth);
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
    });
    router.push('/');
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'image'> & { image: File }) => {
    if (!isLoggedIn) {
        throw new Error('You must be logged in to add a product.');
    }
    try {
      const storageRef = ref(storage, `products/${Date.now()}_${productData.image.name}`);
      const snapshot = await uploadBytes(storageRef, productData.image);
      const imageUrl = await getDownloadURL(snapshot.ref);

      const newProductData = {
        ...productData,
        image: imageUrl,
      };
      
      const docRef = await addDoc(collection(db, "products"), newProductData);
      
      setProducts(prev => [{...newProductData, id: docRef.id}, ...prev].sort((a,b) => a.name.localeCompare(b.name)));
      
      toast({ title: "Success!", description: `Product "${productData.name}" has been added.` });

    } catch (error) {
      console.error("Error adding product:", error);
      if (error instanceof FirebaseError) {
        toast({
          title: 'Upload Failed',
          description: `Error: ${error.code} - ${error.message}`,
          variant: 'destructive',
        });
      } else {
         toast({
            title: 'An Unknown Error Occurred',
            description: 'Could not add the product. Please try again.',
            variant: 'destructive',
        });
      }
      // Re-throw the error so the form can catch it
      throw error;
    }
  };
  
  const addOrder = async (orderData: Omit<Order, 'id'>) => {
    try {
        const docRef = await addDoc(collection(db, "orders"), orderData);
        const newOrder = {...orderData, id: docRef.id};
        setOrders(prev => [newOrder, ...prev]);
        setUserOrders(prev => [newOrder, ...prev]);
    } catch(error) {
        console.error("Error adding order:", error);
        throw error; // re-throw to be caught in checkout page
    }
  };

  const toggleOrderShipped = async (orderId: string) => {
    const orderRef = doc(db, 'orders', orderId);
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;
    
    const newShippedStatus = !orderToUpdate.shipped;

    try {
        await updateDoc(orderRef, { shipped: newShippedStatus });
        setOrders(prevOrders => prevOrders.map(order => 
            order.id === orderId ? { ...order, shipped: newShippedStatus } : order
        ));
        toast({title: "Order Updated", description: `Order ${orderId} marked as ${newShippedStatus ? 'shipped' : 'not shipped'}.`})
    } catch(error) {
        console.error("Error updating order:", error);
        toast({title: "Error", description: "Failed to update order status.", variant: "destructive"})
    }
  };

  return (
    <AppContext.Provider
      value={{
        products,
        setProducts,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        getCartTotal,
        isLoggedIn,
        user,
        login,
        signup,
        logout,
        addProduct,
        orders,
        addOrder,
        toggleOrderShipped,
        loading,
        userOrders,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
