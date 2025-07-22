"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Product } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from './ui/card';
import { AppContext } from '@/context/AppContext';
import { useContext } from 'react';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useContext(AppContext);
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="h-full"
    >
      <Card className="flex h-full flex-col overflow-hidden rounded-lg shadow-md transition-shadow duration-300 hover:shadow-xl">
        <Link href={`/product/${product.id}`} className="block">
          <CardHeader className="p-0">
            <div className="relative h-48 w-full">
              <Image
                src={product.image}
                alt={product.name}
                data-ai-hint="product image"
                layout="fill"
                objectFit="cover"
              />
            </div>
          </CardHeader>
        </Link>
        <CardContent className="flex-grow p-4">
          <Link href={`/product/${product.id}`} className="block">
            <CardTitle className="font-headline text-lg hover:text-primary">{product.name}</CardTitle>
            <CardDescription className="mt-2 text-sm text-muted-foreground">
              {product.description.substring(0, 70)}...
            </CardDescription>
          </Link>
          <p className="mt-4 font-bold text-primary">₹{product.price.toFixed(2)}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button className="w-full" onClick={() => addToCart(product)}>
            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
