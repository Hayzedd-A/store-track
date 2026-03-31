import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import StockHistory from '@/models/StockHistory';
import mongoose from 'mongoose';
import { z } from 'zod';

// Validation schema
const restockSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  cost: z.number().min(0).nullable().optional().default(null),
  notes: z.string().nullable().optional().default(null),
});

// GET stock history for a product
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    const query: Record<string, unknown> = {};

    if (productId) {
      query.productId = productId;
    }

    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      StockHistory.find(query)
        .populate('productId', 'name sku')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      StockHistory.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: history.map(item => ({
        ...item,
        _id: item._id.toString(),
        productId: item.productId ? {
          ...(item.productId as { _id: { toString(): string }; name: string; sku: string }),
          _id: (item.productId as { _id: { toString(): string } })._id.toString(),
        } : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get stock history error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch stock history' },
      { status: 500 }
    );
  }
}

// POST restock product
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const validatedData = restockSchema.parse(body);

    // Validate productId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(validatedData.productId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Find product
    const product = await Product.findById(validatedData.productId);

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    const previousQty = product.quantity;
    const newQty = previousQty + validatedData.quantity;
    const previousCost = product.cost;
    const newCost = validatedData.cost !== null ? validatedData.cost : previousCost;

    // Build update object
    const updateData: Record<string, unknown> = {
      quantity: newQty,
    };
    
    // Update cost if provided (not null)
    if (validatedData.cost !== null) {
      updateData.cost = newCost;
    }

    // Update product quantity (and cost if provided)
    await Product.findByIdAndUpdate(validatedData.productId, updateData);

    // Create stock history entry
    await StockHistory.create({
      productId: validatedData.productId,
      changeType: 'restock',
      quantityChange: validatedData.quantity,
      previousQty,
      newQty,
      currentPrice: newCost,
      notes: validatedData.notes || `Restocked ${validatedData.quantity} ${product.unitConfig.restockUnit}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Product restocked successfully',
      data: {
        previousQty,
        newQty,
        addedQty: validatedData.quantity,
        previousCost,
        newCost,
      },
    });
  } catch (error) {
    console.error('Restock error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to restock product' },
      { status: 500 }
    );
  }
}

