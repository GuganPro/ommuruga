"use client";

import { useContext, useState } from 'react';
import { AppContext } from '@/context/AppContext';
import SellerForm from '@/components/SellerForm';
import ProductCard from '@/components/ProductCard';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import Image from 'next/image';

export default function SellerPage() {
  const { products, orders, toggleOrderShipped } = useContext(AppContext);
  const [sortBy, setSortBy] = useState<'latest' | 'category'>('latest');

  const sortedOrders = [...orders].sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
    }
    // Basic category sort (sorts by first item's category)
    if (sortBy === 'category') {
        const categoryA = a.items[0]?.category || '';
        const categoryB = b.items[0]?.category || '';
        return categoryA.localeCompare(categoryB);
    }
    return 0;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-8 text-center font-headline text-4xl font-bold">Seller Panel</h1>
      </motion.div>
      
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          <div className="mt-6 grid grid-cols-1 gap-12 lg:grid-cols-3">
            <motion.div
              className="lg:col-span-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Add a New Product</CardTitle>
                </CardHeader>
                <CardContent>
                  <SellerForm />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="mb-6 font-headline text-3xl font-bold">Your Products ({products.length})</h2>
              {products.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2">
                  <AnimatePresence>
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                  </AnimatePresence>
                </div>
              ) : (
                <p className="text-muted-foreground">You haven't added any products yet.</p>
              )}
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="orders">
           <Card className="mt-6">
            <CardHeader>
                <CardTitle className="font-headline">Customer Orders</CardTitle>
                <div className="flex items-center justify-between">
                    <CardDescription>View and manage incoming orders.</CardDescription>
                    <div className="flex items-center gap-4">
                        <Label>Sort By:</Label>
                        <Button variant={sortBy === 'latest' ? 'secondary' : 'ghost'} size="sm" onClick={() => setSortBy('latest')}>Latest</Button>
                        <Button variant={sortBy === 'category' ? 'secondary' : 'ghost'} size="sm" onClick={() => setSortBy('category')}>Category</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {sortedOrders.length > 0 ? (
                  <AnimatePresence>
                    {sortedOrders.map((order, index) => (
                         <motion.div
                            key={order.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                         >
                         <Card className="overflow-hidden">
                            <CardHeader className="flex flex-row items-start justify-between bg-muted/50 p-4">
                                <div>
                                    <h3 className="font-semibold">{order.customerName}</h3>
                                    <p className="text-sm text-muted-foreground">{order.customerEmail} | {order.customerPhone}</p>
                                    <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium">{format(new Date(order.orderDate), "PPpp")}</p>
                                    <p className="text-xs text-muted-foreground">{order.id}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                {order.items.map(item => (
                                    <div key={item.id} className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-4">
                                            <Image src={item.image} alt={item.name} width={40} height={40} className="rounded-md" data-ai-hint="product image"/>
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </CardContent>
                            <CardFooter className="flex items-center justify-between bg-muted/50 p-4">
                                <div className="font-semibold">
                                    Total: <span className="text-primary">₹{order.total.toFixed(2)}</span>
                                    <span className="ml-4 text-xs font-normal text-muted-foreground">({order.paymentMethod})</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch id={`shipped-${order.id}`} checked={order.shipped} onCheckedChange={() => toggleOrderShipped(order.id)} />
                                    <Label htmlFor={`shipped-${order.id}`}>Mark as Shipped</Label>
                                </div>
                            </CardFooter>
                         </Card>
                         </motion.div>
                    ))}
                  </AnimatePresence>
                ) : (
                    <p className="py-12 text-center text-muted-foreground">No orders have been placed yet.</p>
                )}
            </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
