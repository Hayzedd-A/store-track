import mongoose, { Schema, Model } from 'mongoose';
import { IProduct } from '@/types';

// Unit Configuration Sub-schema
const UnitConfigSchema = new Schema({
  saleUnit: {
    type: String,
    required: true,
    default: 'piece',
  },
  restockUnit: {
    type: String,
    required: true,
    default: 'box',
  },
  unitsPerRestock: {
    type: Number,
    required: true,
    default: 12,
    min: 1,
  },
}, { _id: false });

export interface IProductDocument extends IProduct, Document {}

const ProductSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    barcode: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    image: {
      type: String,
      default: null,
    },
    publicId: {
      type: String,
      default: null,
    },
    minStock: {
      type: Number,
      required: true,
      default: 5,
      min: 0,
    },
    shelfNo: {
      type: String,
      default: null,
      trim: true,
    },
    unitConfig: {
      type: UnitConfigSchema,
      required: true,
      default: () => ({
        saleUnit: 'piece',
        restockUnit: 'box',
        unitsPerRestock: 12,
      }),
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search and filtering
ProductSchema.index({ name: 'text', sku: 'text' });
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ quantity: 1 });
ProductSchema.index({ price: 1 });

// Virtual for profit
ProductSchema.virtual('profit').get(function () {
  return this.price - this.cost;
});

// Virtual for profit percentage
ProductSchema.virtual('profitPercentage').get(function () {
  if (this.cost === 0) return 0;
  return ((this.price - this.cost) / this.cost) * 100;
});

// Virtual for stock status
ProductSchema.virtual('stockStatus').get(function () {
  if (this.quantity === 0) return 'out-of-stock';
  if (this.quantity <= this.minStock) return 'low-stock';
  return 'in-stock';
});

// Ensure virtuals are included in JSON
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

const Product: Model<IProductDocument> = 
  mongoose.models.Product || mongoose.model<IProductDocument>('Product', ProductSchema);

export default Product;

