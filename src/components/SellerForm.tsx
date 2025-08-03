"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useContext, useState, useEffect } from 'react';
import { AppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, CheckCircle } from 'lucide-react';
import { generateProductDescription } from '@/ai/flows/generate-product-description';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

const categories = [
  'TVs and Home Theatres',
  'Home Appliances',
  'Mobiles',
  'Accessories',
  'Laptops',
  'Cameras'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const formSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters.'),
  image: z
    .any()
    .refine((files) => files?.length === 1, 'Image is required.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    ),
  price: z.coerce.number().positive('Price must be a positive number.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  category: z.string().nonempty('Please select a category.'),
});

type SellerFormValues = z.infer<typeof formSchema>;

export default function SellerForm() {
  const { addProduct } = useContext(AppContext);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<SellerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      price: 0,
      description: '',
      category: '',
    },
  });
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSubmitting && uploadProgress < 90) {
      timer = setTimeout(() => {
        setUploadProgress(prev => prev + 10);
      }, 500);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [isSubmitting, uploadProgress]);
  
  const handleGenerateDescription = async () => {
    const productName = form.getValues('name');
    const category = form.getValues('category');

    if (!productName || !category) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a product name and select a category to generate a description.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsGenerating(true);
    try {
      const result = await generateProductDescription({ productName, category });
      if (result.description) {
        form.setValue('description', result.description, { shouldValidate: true });
        toast({
          title: 'Description Generated',
          description: 'The AI-powered description has been filled in for you.',
        });
      } else {
          throw new Error("AI did not return a description.")
      }
    } catch (error) {
      console.error("Error generating description:", error);
      toast({
        title: 'Generation Failed',
        description: 'Could not generate a description at this time.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };


  const onSubmit = async (data: SellerFormValues) => {
    setIsSubmitting(true);
    setUploadProgress(10);
    try {
        const productData = {
            name: data.name,
            price: data.price,
            description: data.description,
            category: data.category,
            image: data.image[0] as File,
        };

        await addProduct(productData);
        
        setUploadProgress(100);
        setShowSuccess(true);
        form.reset();
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if(fileInput) fileInput.value = '';

        setTimeout(() => {
          setShowSuccess(false);
          setIsSubmitting(false);
          setUploadProgress(0);
        }, 3000);


    } catch (error) {
        console.error("Error adding product:", error);
        toast({
            title: 'Error',
            description: 'Could not add the product. Please try again.',
            variant: 'destructive',
        });
        setIsSubmitting(false);
        setUploadProgress(0);
    }
  };
  
  const fileRef = form.register('image');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Smart LED TV" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Image</FormLabel>
              <FormControl>
                <Input type="file" {...fileRef} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} disabled={isSubmitting}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <FormLabel htmlFor="description">Description</FormLabel>
                <Button 
                    type="button" 
                    size="sm" 
                    variant="outline" 
                    onClick={handleGenerateDescription}
                    disabled={isGenerating || isSubmitting}
                >
                    {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate with AI
                </Button>
            </div>
            <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
                <FormItem className="space-y-0">
                <FormControl>
                    <Textarea id="description" placeholder="Describe the product..." {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        
        {isSubmitting ? (
          <div className="space-y-4 pt-2">
            {showSuccess ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 text-center font-medium text-green-600"
              >
                <CheckCircle className="h-5 w-5" />
                <p>Product added successfully!</p>
              </motion.div>
            ) : (
              <div className="w-full space-y-2">
                 <p className="text-sm font-medium text-muted-foreground">Adding your product...</p>
                 <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
          </div>
        ) : (
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                Add Product
            </Button>
        )}
      </form>
    </Form>
  );
}
