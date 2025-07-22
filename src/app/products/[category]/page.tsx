"use client";

import { useContext } from 'react';
import { useParams } from 'next/navigation';
import { AppContext } from '@/context/AppContext';
import ProductCard from '@/components/ProductCard';
import { motion } from 'framer-motion';

export default function CategoryPage() {
  const { products } = useContext(AppContext);
  const params = useParams();
  const category = decodeURIComponent(params.category as string);

  const categoryProducts = products.filter(
    (product) => product.category === category
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-8 text-center font-headline text-4xl font-bold">{category}</h1>
      </motion.div>
      {categoryProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categoryProducts.map((product, index) => (
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
      ) : (
        <p className="text-center text-muted-foreground">No products found in this category.</p>
      )}
    </div>
  );
}
