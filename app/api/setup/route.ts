import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { z } from 'zod';

// Validation schema
const setupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    // Check if admin user already exists
    const existingUser = await User.findOne({});
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Admin user already exists' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = setupSchema.parse(body);

    // Create admin user
    const user = await User.create({
      email: validatedData.email.toLowerCase(),
      password: validatedData.password,
      name: validatedData.name,
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Admin user created successfully',
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Setup error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to create admin user' },
      { status: 500 }
    );
  }
}

