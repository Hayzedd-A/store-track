import mongoose, { Schema, Model } from 'mongoose';
import { IStockHistory } from '@/types';

export interface IStockHistoryDocument extends IStockHistory, Document {}

const StockHistorySchema = new Schema<IStockHistoryDocument>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    changeType: {
      type: String,
      enum: ['restock', 'sale', 'adjustment', 'return'],
      required: true,
    },
    quantityChange: {
      type: Number,
      required: true,
    },
    previousQty: {
      type: Number,
      required: true,
      min: 0,
    },
    newQty: {
      type: Number,
      required: true,
      min: 0,
    },
    currentPrice: {
      type: Number,
      min: 0,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for queries
StockHistorySchema.index({ productId: 1, createdAt: -1 });
StockHistorySchema.index({ changeType: 1 });
StockHistorySchema.index({ createdAt: -1 });

const StockHistory: Model<IStockHistoryDocument> = 
  mongoose.models.StockHistory || mongoose.model<IStockHistoryDocument>('StockHistory', StockHistorySchema);

export default StockHistory;

