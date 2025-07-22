"use client";

import { useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { AppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductDetailPage() {
  const { products, addToCart } = useContext(AppContext);
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const product = products.find((p) => p.id === productId);

  if (!product) {
    return <div className="container mx-auto px-4 py-8 text-center">Product not found.</div>;
  }

  const handleBuyNow = () => {
    addToCart(product);
    router.push('/checkout');
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
       <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to products
      </Button>
      <motion.div 
        className="grid grid-cols-1 gap-8 md:grid-cols-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="overflow-hidden rounded-lg shadow-lg"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src={product.image}
            alt={product.name}
            data-ai-hint="product image"
            width={600}
            height={600}
            className="h-full w-full object-cover"
          />
        </motion.div>
        <motion.div 
          className="flex flex-col"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="font-semibold text-primary">{product.category}</p>
          <h1 className="mt-2 font-headline text-4xl font-bold">{product.name}</h1>
          <p className="mt-4 text-3xl font-bold text-primary">${product.price.toFixed(2)}</p>
          <Separator className="my-6" />
          <p className="text-muted-foreground">{product.description}</p>
          <div className="mt-auto flex space-x-4 pt-6">
            <Button size="lg" className="flex-1" onClick={() => addToCart(product)}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Button size="lg" variant="outline" className="flex-1" onClick={handleBuyNow}>
              Buy Now
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
