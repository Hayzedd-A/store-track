import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import StockHistory from '@/models/StockHistory';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  categoryId: z.string().nullable().optional(),
  sku: z.string().min(1).max(20).optional(),
  price: z.number().min(0).optional(),
  cost: z.number().min(0).optional(),
  quantity: z.number().min(0).optional(),
  image: z.string().nullable().optional(),
  minStock: z.number().min(0).optional(),
  shelfNo: z.string().nullable().optional(),
  unitConfig: z
    .object({
      saleUnit: z.string().min(1),
      restockUnit: z.string().min(1),
      unitsPerRestock: z.number().min(1),
    })
    .optional(),
  notes: z.string().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();

    const { id } = await params;
    const body = await req.json();
    const validated = updateSchema.parse(body);
    console.log('Updating product with data:', id);
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    // If SKU provided, ensure uniqueness (case-insensitive)
    if (validated.sku) {
      const existing = await Product.findOne({ sku: validated.sku.toUpperCase(), _id: { $ne: id } });
      if (existing) {
        return NextResponse.json({ success: false, message: 'Another product with this SKU exists' }, { status: 400 });
      }
      validated.sku = validated.sku.toUpperCase();
    }

    const updateData: Record<string, any> = { ...validated };

    // Handle unitConfig normalization
    if (validated.unitConfig) {
      updateData.unitConfig = {
        saleUnit: validated.unitConfig.saleUnit,
        restockUnit: validated.unitConfig.restockUnit,
        unitsPerRestock: validated.unitConfig.unitsPerRestock,
      };
    }

    // Track quantity changes and create stock history
    if (typeof validated.quantity === 'number' && validated.quantity !== product.quantity) {
      const previousQty = product.quantity;
      const newQty = validated.quantity;
      const change = newQty - previousQty;

      await StockHistory.create({
        productId: product._id,
        changeType: change > 0 ? 'restock' : 'adjust',
        quantityChange: Math.abs(change),
        previousQty,
        newQty,
        notes: validated.notes || 'Updated via API',
      });
    }

    const updated = await Product.findByIdAndUpdate(id, updateData, { new: true }).populate('categoryId', 'name color').lean();

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        _id: (updated as any)?._id?.toString?.() || id,
        categoryId: (updated as any)?.categoryId
          ? { ...((updated as any).categoryId), _id: (updated as any).categoryId._id.toString() }
          : null,
      },
    });
  } catch (error) {
    console.error('Update product error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.flatten().fieldErrors }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Failed to update product' }, { status: 500 });
  }
}


// Optionally support GET for a single product
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const product = await Product.findById(id).populate('categoryId', 'name color').lean();
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: {
        ...product,
        _id: (product as any)._id.toString(),
        categoryId: (product as any).categoryId
          ? { ...((product as any).categoryId), _id: (product as any).categoryId._id.toString() }
          : null,
      },
    });
  } catch (error) {
    console.error('Get single product error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch product' }, { status: 500 });
  }
}
