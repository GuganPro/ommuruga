"use client";
import { useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/types';


const categories = [
  { name: 'TVs and Home Theatres', emoji: '📺' },
  { name: 'Home Appliances', emoji: '🏠' },
  { name: 'Mobiles', emoji: '📱' },
  { name: 'Accessories', emoji: '🎧' },
  { name: 'Laptops', emoji: '💻' },
  { name: 'Cameras', emoji: '📷' },
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
          <Carousel
            opts={{
              align: "start",
              loop: true,
              dragFree: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {categories.map((category, index) => (
                <CarouselItem key={index} className="basis-1/2 md:basis-1/3 lg:basis-1/5">
                   <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="p-1"
                   >
                    <Link href={`/products/${encodeURIComponent(category.name)}`}>
                        <Card className="cursor-pointer overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow duration-300 hover:shadow-lg">
                          <CardContent className="flex aspect-square flex-col items-center justify-center gap-2 p-4 text-center">
                            <span className="text-4xl">{category.emoji}</span>
                            <p className="font-semibold text-sm">{category.name}</p>
                          </CardContent>
                        </Card>
                    </Link>
                   </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
                <CarouselPrevious />
                <CarouselNext />
            </div>
          </Carousel>
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
