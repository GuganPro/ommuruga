"use client";

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import type { Product, CartItem, Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { auth, db, storage } from '@/lib/firebase';
import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, getDocs, addDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
}

export const AppContext = createContext<AppContextType>({} as AppContextType);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
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
    
    const fetchOrders = async () => {
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
    fetchOrders();

    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));

  }, []);

  useEffect(() => {
    if(cart.length > 0 || localStorage.getItem('cart')) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);


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
    setLoading(true);
    try {
      // 1. Upload image to Firebase Storage
      const storageRef = ref(storage, `products/${Date.now()}_${productData.image.name}`);
      const snapshot = await uploadBytes(storageRef, productData.image);
      const imageUrl = await getDownloadURL(snapshot.ref);

      // 2. Add product to Firestore
      const newProductData = {
        ...productData,
        image: imageUrl,
      };
      const docRef = await addDoc(collection(db, "products"), newProductData);
      
      setProducts(prev => [{...newProductData, id: docRef.id}, ...prev]);
      toast({ title: "Success!", description: `Product "${productData.name}" has been added.` });

    } catch (error) {
      console.error("Error adding product:", error);
      toast({ title: "Error", description: "Failed to add product.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };
  
  const addOrder = async (orderData: Omit<Order, 'id'>) => {
    setLoading(true);
    try {
        const docRef = await addDoc(collection(db, "orders"), orderData);
        setOrders(prev => [{...orderData, id: docRef.id}, ...prev]);
    } catch(error) {
        console.error("Error adding order:", error);
        throw error; // re-throw to be caught in checkout page
    } finally {
        setLoading(false);
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
        loading
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
