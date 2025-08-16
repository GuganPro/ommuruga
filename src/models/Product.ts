import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  image: string; // Firebase Storage URL
  price: number;
  description: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  image: {
    type: String,
    required: [true, 'Product image URL is required'],
    validate: {
      validator: function(v: string) {
        return /^https:\/\/firebasestorage\.googleapis\.com/.test(v);
      },
      message: 'Image must be a valid Firebase Storage URL'
    }
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: [
      'TVs and Home Theatres',
      'Home Appliances',
      'Mobiles',
      'Accessories',
      'Laptops',
      'Cameras'
    ]
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
ProductSchema.index({ category: 1 });
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ price: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);