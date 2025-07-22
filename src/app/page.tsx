"use client";
import { useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tv, Smartphone, Headphones, Home as HomeIcon } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/types';

const categoryIcons: { [key: string]: React.ReactElement } = {
  'TVs and Home Theatres': <Tv className="h-12 w-12 text-primary" />,
  'Home Appliances': <HomeIcon className="h-12 w-12 text-primary" />,
  Mobiles: <Smartphone className="h-12 w-12 text-primary" />,
  Accessories: <Headphones className="h-12 w-12 text-primary" />,
};

const categories = [
  'TVs and Home Theatres',
  'Home Appliances',
  'Mobiles',
  'Accessories',
];

export default function Home() {
  const { products } = useContext(AppContext);
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="flex flex-col">
      <motion.section
        className="relative h-[60vh] w-full bg-primary/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Image
          src="https://placehold.co/1600x900"
          alt="Promotional Banner"
          layout="fill"
          objectFit="cover"
          className="z-0"
          data-ai-hint="electronics store sale"
        />
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50 p-4 text-center">
          <motion.h1 
            className="font-headline text-4xl font-bold text-white md:text-6xl"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Welcome to Om Muruga Enterprises
          </motion.h1>
          <motion.p 
            className="mt-4 max-w-2xl text-lg text-gray-200"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Your one-stop shop for the latest electronics and home appliances.
          </motion.p>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button asChild className="mt-8" size="lg">
              <Link href="#featured">Shop Now</Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center font-headline text-3xl font-bold">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {categories.map((category, index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Link href={`/products/${encodeURIComponent(category)}`}>
                  <Card className="h-full cursor-pointer text-center transition-shadow duration-300 hover:shadow-lg">
                    <CardHeader>
                      <div className="mx-auto flex items-center justify-center">
                        {categoryIcons[category]}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="font-headline text-lg">{category}</CardTitle>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="featured" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center font-headline text-3xl font-bold">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product: Product, index: number) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
