import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Category from '@/models/Category';
import { uploadImage, deleteImage } from '@/lib/cloudinary';
import { z } from 'zod';

// Validation schema
const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Name too long'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional().default('#6366F1'),
  image: z.string().nullable().optional().default(null),
});

// Helper function to parse multipart form data
async function parseFormData(req: NextRequest) {
  const formData = await req.formData();
  const name = formData.get('name')?.toString();
  const color = formData.get('color')?.toString();
  const file = formData.get('image') as File | null;

  return { name, color, file };
}

// GET all categories
export async function GET() {
  try {
    await connectToDatabase();
    
    const categories = await Category.find({})
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({ 
      success: true, 
      data: categories.map(cat => ({
        ...cat,
        _id: cat._id.toString(),
      }))
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST create new category
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const contentType = req.headers.get('content-type') || '';

    let name: string | undefined;
    let color: string | undefined;
    let imageUrl: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      // Handle multipart form data with file
      const { name: formName, color: formColor, file } = await parseFormData(req);
      name = formName;
      color = formColor;

      if (file && file.size > 0) {
        try {
          const buffer = Buffer.from(await file.arrayBuffer());
          const result: any = await uploadImage(buffer, 'store-track/categories');
          imageUrl = result.secure_url;
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          return NextResponse.json(
            { success: false, message: 'Failed to upload image' },
            { status: 400 }
          );
        }
      }
    } else {
      // Handle JSON request
      const body = await req.json();
      name = body.name;
      color = body.color;
      imageUrl = body.image || null;
    }

    // Validate the data
    const validatedData = categorySchema.parse({
      name,
      color,
      image: imageUrl,
    });

    // Check for duplicate name
    const existing = await Category.findOne({ 
      name: { $regex: new RegExp(`^${validatedData.name}$`, 'i') } 
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    const category = await Category.create(validatedData);

    return NextResponse.json(
      { 
        success: true, 
        data: {
          ...category.toObject(),
          _id: category._id.toString(),
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create category error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to create category' },
      { status: 500 }
    );
  }
}

// PUT update category
export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Category ID is required' },
        { status: 400 }
      );
    }

    const contentType = req.headers.get('content-type') || '';

    let name: string | undefined;
    let color: string | undefined;
    let imageUrl: string | null | undefined;

    if (contentType.includes('multipart/form-data')) {
      // Handle multipart form data with file
      const { name: formName, color: formColor, file } = await parseFormData(req);
      name = formName;
      color = formColor;

      if (file && file.size > 0) {
        try {
          const buffer = Buffer.from(await file.arrayBuffer());
          const result: any = await uploadImage(buffer, 'store-track/categories', `cat-${id}`);
          imageUrl = result.secure_url;
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          return NextResponse.json(
            { success: false, message: 'Failed to upload image' },
            { status: 400 }
          );
        }
      }
    } else {
      // Handle JSON request
      const body = await req.json();
      name = body.name;
      color = body.color;
      imageUrl = body.image;
    }

    // Get the current category
    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    // Check for duplicate name if changing
    if (name && name !== category.name) {
      const existing = await Category.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${name}$`, 'i') },
      });

      if (existing) {
        return NextResponse.json(
          { success: false, message: 'Category with this name already exists' },
          { status: 400 }
        );
      }
    }

    // Update the category
    if (name !== undefined) category.name = name;
    if (color !== undefined) category.color = color;
    if (imageUrl !== undefined) category.image = imageUrl;

    const updatedCategory = await category.save();

    return NextResponse.json({
      success: true,
      data: {
        ...updatedCategory.toObject(),
        _id: updatedCategory._id.toString(),
      },
    });
  } catch (error) {
    console.error('Update category error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE category
export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Category ID is required' },
        { status: 400 }
      );
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete category' },
      { status: 500 }
    );
  }
}



