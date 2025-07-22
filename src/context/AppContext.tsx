"use client";

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import type { Product, CartItem, Order } from '@/lib/types';
import { DUMMY_PRODUCTS } from '@/lib/dummy-data';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface AppContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  orders: Order[];
  addOrder: (order: Omit<Order, 'id'>) => void;
  toggleOrderShipped: (orderId: string) => void;
}

export const AppContext = createContext<AppContextType>({} as AppContextType);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Load initial products
    setProducts(DUMMY_PRODUCTS);

    // Load state from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));
    
    const loggedInStatus = localStorage.getItem('isLoggedIn');
    if (loggedInStatus === 'true') setIsLoggedIn(true);

    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));

  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    if(cart.length > 0 || localStorage.getItem('cart')) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  useEffect(() => {
    // Save orders to localStorage whenever it changes
    if(orders.length > 0 || localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify(orders));
    }
  }, [orders]);

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

  const login = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    toast({
        title: "Login Successful",
        description: "Welcome back!",
    });
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
    });
    router.push('/');
  };

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: new Date().getTime().toString(), // simple unique id
    };
    setProducts(prevProducts => [newProduct, ...prevProducts]);
  };
  
  const addOrder = (orderData: Omit<Order, 'id'>) => {
    const newOrder: Order = {
        ...orderData,
        id: `ORD-${new Date().getTime()}`,
    };
    setOrders(prevOrders => [newOrder, ...prevOrders]);
  };

  const toggleOrderShipped = (orderId: string) => {
    setOrders(prevOrders => prevOrders.map(order => 
        order.id === orderId ? { ...order, shipped: !order.shipped } : order
    ));
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
        login,
        logout,
        addProduct,
        orders,
        addOrder,
        toggleOrderShipped,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
