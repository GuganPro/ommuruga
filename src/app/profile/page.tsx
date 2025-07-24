"use client";

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Loader2, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function ProfilePage() {
  const { isLoggedIn, logout, user, loading, userOrders } = useContext(AppContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, loading, router]);
  
  if (loading || !isLoggedIn || !user) {
    return (
        <div className="container mx-auto flex h-[70vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    ); 
  }

  const getInitials = (email: string | null) => {
    if (!email) return "U";
    return email.substring(0, 2).toUpperCase();
  }
  
  const getMemberSince = (creationTime: string | undefined) => {
    if (!creationTime) return "N/A";
    const date = new Date(creationTime);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 py-16">
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
            <div className="md:col-span-1">
                <Card>
                <CardHeader className="items-center text-center">
                    <Avatar className="h-24 w-24">
                    <AvatarImage src={user.photoURL || `https://avatar.vercel.sh/${user.email}.png`} />
                    <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="pt-4 font-headline text-2xl">User Profile</CardTitle>
                    <CardDescription>Your account details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Member Since:</span>
                        <span className="font-medium">{getMemberSince(user.metadata.creationTime)}</span>
                    </div>
                    <Button onClick={logout} className="w-full" variant="destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                    </Button>
                </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2">
                <h2 className="font-headline text-3xl font-bold mb-6">Your Order History</h2>
                {userOrders.length > 0 ? (
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {userOrders.map((order) => (
                    <AccordionItem value={order.id} key={order.id} className="bg-card border rounded-lg">
                        <AccordionTrigger className="p-4 hover:no-underline">
                            <div className="flex justify-between w-full">
                                <div>
                                    <p className="font-semibold">Order #{order.id.substring(0, 7)}</p>
                                    <p className="text-sm text-muted-foreground">{format(new Date(order.orderDate), "PP")}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-primary">₹{order.total.toFixed(2)}</p>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${order.shipped ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {order.shipped ? 'Shipped' : 'Processing'}
                                    </span>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 border-t">
                            <h4 className="font-semibold mb-2">Items:</h4>
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
                             <div className="border-t mt-4 pt-4">
                                <h4 className="font-semibold mb-2">Delivery Address:</h4>
                                <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    ))}
                </Accordion>
                ) : (
                <Card>
                    <CardContent className="p-6 text-center">
                        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">You haven't placed any orders yet.</p>
                        <Button onClick={() => router.push('/')} className="mt-4">Start Shopping</Button>
                    </CardContent>
                </Card>
                )}
            </div>
        </motion.div>
    </div>
  );
}
