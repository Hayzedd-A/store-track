import mongoose, { Schema, Model } from 'mongoose';
import { ISaleItem } from '@/types';

// Sale Item Sub-schema
const SaleItemSchema = new Schema<ISaleItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
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
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

export interface ISaleDocument extends Omit<mongoose.Document, '_id'>, ISale {
  createdAt: Date;
  updatedAt: Date;
}

const SaleSchema = new Schema<ISaleDocument>(
  {
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['cash'],
      default: 'cash',
    },
    status: {
      type: String,
      enum: ['completed', 'cancelled', 'refunded'],
      default: 'completed',
    },
    items: {
      type: [SaleItemSchema],
      required: true,
      validate: [function (val: ISaleItem[]) { return val.length > 0; }, 'Sale must have at least one item'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for date queries
SaleSchema.index({ createdAt: -1 });
SaleSchema.index({ status: 1 });

const Sale: Model<ISaleDocument> = 
  mongoose.models.Sale || mongoose.model<ISaleDocument>('Sale', SaleSchema);

export default Sale;

