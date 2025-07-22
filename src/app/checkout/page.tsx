"use client";

import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { notifySellerOfOrder } from '@/ai/flows/notify-seller-of-order';
import Image from 'next/image';
import { X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formSchema = z.object({
  customerName: z.string().min(2, 'Name is required.'),
  customerEmail: z.string().email('Invalid email address.'),
  customerPhone: z.string().min(10, 'A valid phone number is required.'),
  deliveryAddress: z.string().min(10, 'A valid address is required.'),
  paymentMethod: z.literal('COD', {
    errorMap: () => ({ message: 'Please select a payment method.' }),
  }),
});

type CheckoutFormValues = z.infer<typeof formSchema>;

export default function CheckoutPage() {
  const { isLoggedIn, cart, getCartTotal, clearCart, removeFromCart } = useContext(AppContext);
  const router = useRouter();
  const { toast } = useToast();
  const [isOrderSuccessful, setIsOrderSuccessful] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login?redirect=/checkout');
    }
    if (cart.length === 0 && !isOrderSuccessful) {
        toast({
            title: "Your cart is empty",
            description: "Please add items to your cart before checking out.",
            variant: "destructive"
        })
        router.push('/');
    }
  }, [isLoggedIn, router, cart, toast, isOrderSuccessful]);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      deliveryAddress: '',
      paymentMethod: 'COD',
    },
  });

  const onSubmit = async (data: CheckoutFormValues) => {
    const orderSummary = cart
      .map((item) => `${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`)
      .join('\n');
    const total = getCartTotal();
    const orderDetails = {
      ...data,
      orderId: `ORD-${new Date().getTime()}`,
      orderSummary: `${orderSummary}\n\nTotal: $${total.toFixed(2)}`,
    };

    try {
      const notificationResult = await notifySellerOfOrder(orderDetails);
      if (notificationResult.emailSent || notificationResult.whatsAppSent) {
        setIsOrderSuccessful(true);
        clearCart();
      } else {
        throw new Error('Notification failed');
      }
    } catch (error) {
      console.error("Failed to process order:", error);
      toast({
        title: "Order Failed",
        description: "There was a problem placing your order. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (isOrderSuccessful) {
    return (
        <div className="container mx-auto flex h-[70vh] flex-col items-center justify-center p-4 text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
                <CheckCircle className="mx-auto h-24 w-24 text-green-500" />
                <h1 className="mt-6 font-headline text-4xl font-bold">Order Placed Successfully!</h1>
                <p className="mt-4 max-w-md text-muted-foreground">Thank you for your purchase. A notification has been sent to the seller. You will be contacted shortly for delivery confirmation.</p>
                <Button onClick={() => router.push('/')} className="mt-8">Continue Shopping</Button>
            </motion.div>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center font-headline text-4xl font-bold">Checkout</h1>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Contact & Delivery Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField name="customerName" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Your Name" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField name="customerEmail" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField name="customerPhone" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="Your Phone" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField name="deliveryAddress" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Delivery Address</FormLabel><FormControl><Input placeholder="Your Address" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField name="paymentMethod" control={form.control} render={({ field }) => (
                    <FormItem className="space-y-3"><FormLabel>Payment Method</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="COD" /></FormControl>
                            <FormLabel className="font-normal">Cash on Delivery (COD)</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full" size="lg">Place Order</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Order Summary</CardTitle>
              <CardDescription>{cart.length} item(s) in your cart</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AnimatePresence>
                {cart.map((item) => (
                  <motion.div 
                    key={item.id} 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <Image src={item.image} alt={item.name} data-ai-hint="product image" width={64} height={64} className="rounded-md" />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                  </motion.div>
                ))}
                </AnimatePresence>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <p>Total</p>
                  <p>${getCartTotal().toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
