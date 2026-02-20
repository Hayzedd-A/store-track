import mongoose, { Schema, Model } from 'mongoose';
import { ICategory } from '@/types';

export interface ICategoryDocument extends ICategory, Document {}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      default: '#6366F1',
    },
    image: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
CategorySchema.index({ name: 'text' });

const Category: Model<ICategoryDocument> = 
  mongoose.models.Category || mongoose.model<ICategoryDocument>('Category', CategorySchema);

export default Category;

