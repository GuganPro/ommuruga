"use client";

import { useContext } from 'react';
import { AppContext } from '@/context/AppContext';
import SellerForm from '@/components/SellerForm';
import ProductCard from '@/components/ProductCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function SellerPage() {
  const { products } = useContext(AppContext);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-8 text-center font-headline text-4xl font-bold">Seller Panel</h1>
      </motion.div>
      
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
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
          <h2 className="mb-6 font-headline text-3xl font-bold">Your Products</h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product, index) => (
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
            <p className="text-muted-foreground">You haven't added any products yet.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
