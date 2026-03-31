import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Sale from '@/models/Sale';
import Product from '@/models/Product';
import StockHistory from '@/models/StockHistory';
import mongoose from 'mongoose';
import { z } from 'zod';

// Validation schema for sale items
const saleItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

// Validation schema for creating a sale
const saleSchema = z.object({
  items: z.array(saleItemSchema).min(1, 'Sale must have at least one item'),
  paymentMethod: z.literal('cash').default('cash'),
});

// GET sales history
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: Record<string, unknown> = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        (query.createdAt as Record<string, Date>).$gte = new Date(startDate);
      }
      if (endDate) {
        (query.createdAt as Record<string, Date>).$lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;

    const [sales, total] = await Promise.all([
      Sale.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Sale.countDocuments(query),
    ]);

    // Calculate summary
    const summary = await Sale.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: sales.map(sale => ({
        ...sale,
        _id: sale._id.toString(),
      })),
      summary: summary[0] || { totalSales: 0, totalRevenue: 0 },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get sales error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch sales' },
      { status: 500 }
    );
  }
}

// POST make sale
export async function POST(req: NextRequest) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectToDatabase();
    const body = await req.json();
    const { items, paymentMethod } = saleSchema.parse(body);

    const productIds = items.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } }).session(session);
    
    // 1. Validation Logic (Keep this fast in-memory)
    const productMap = new Map(products.map(p => [p._id.toString(), p]));
    const stockUpdates = [];
    const historyEntries = [];
    const saleItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product || product.quantity < item.quantity) {
        throw new Error(`Insufficient stock or invalid product: ${product?.name || item.productId}`);
      }

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;
      console.log(`Processing item: ${product.name}, Qty: ${item.quantity}, Subtotal: ${subtotal}, cost: ${product.cost}`);
      // Prepare for Sale document
      saleItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: Number(product.price || 0),
        cost: Number(product.cost || 0),
        subtotal: Number(subtotal),
      });

      // 2. Queue the Bulk Update for Product Stock
      stockUpdates.push({
        updateOne: {
          filter: { _id: product._id },
          update: { $inc: { quantity: -item.quantity } }
        }
      });

      // 3. Queue the History entry
      historyEntries.push({
        productId: product._id,
        changeType: 'sale',
        quantityChange: -item.quantity,
        previousQty: product.quantity,
        newQty: product.quantity - item.quantity,
        currentPrice: product.cost,
        notes: `Sold ${item.quantity}`,
      });
    }

    // --- DATABASE EXECUTION (All at once) ---

    // A. Perform all stock updates in ONE round trip
    await Product.bulkWrite(stockUpdates, { session });

    // B. Perform all history inserts in ONE round trip
    await StockHistory.insertMany(historyEntries, { session });

    // C. Create the sale
    const sale = new Sale({
      totalAmount,
      paymentMethod,
      status: 'completed',
      items: saleItems,
    });

    await sale.save({ session })

    await session.commitTransaction();
    return NextResponse.json({ success: true, data: sale }, { status: 201 });

  } catch (error: any) {
    await session.abortTransaction();
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  } finally {
    session.endSession();
  }
}

