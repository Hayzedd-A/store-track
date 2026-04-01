import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import "@/models/Category";
import StockHistory from "@/models/StockHistory";
import { uploadImage } from "@/lib/cloudinary";
import { z } from "zod";
import { generateBarcode } from "@/lib/utils";

// Validation schema
const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100, "Name too long"),
  categoryId: z.string().nullable().optional().default(null),
  sku: z.string().min(1, "SKU is required").max(20, "SKU too long"),
  barcode: z.string().nullable().optional().default(null),
  price: z.number().min(0, "Price must be positive"),
  cost: z.number().min(0, "Cost must be positive"),
  quantity: z.number().min(0, "Quantity must be positive").default(0),
  image: z.string().nullable().optional().default(null),
  publicId: z.string().nullable().optional().default(null), // Added publicId to schema
  minStock: z.number().min(0, "Min stock must be positive").default(5),
  shelfNo: z.string().nullable().optional().default(null),
  unitConfig: z
    .object({
      saleUnit: z.string().min(1, "Sale unit is required"),
      restockUnit: z.string().min(1, "Restock unit is required"),
      unitsPerRestock: z
        .number()
        .min(1, "Units per restock must be at least 1"),
    })
    .optional()
    .default({
      saleUnit: "piece",
      restockUnit: "box",
      unitsPerRestock: 12,
    }),
});

// Helper function to parse multipart form data
async function parseProductFormData(req: NextRequest) {
  const formData = await req.formData();
  const name = formData.get("name")?.toString();
  const categoryId = formData.get("categoryId")?.toString() || null;
  const sku = formData.get("sku")?.toString();
  const barcode = formData.get("barcode")?.toString() || null;
  const price = formData.get("price")?.toString();
  const cost = formData.get("cost")?.toString();
  const quantity = formData.get("quantity")?.toString();
  const minStock = formData.get("minStock")?.toString();
  const shelfNo = formData.get("shelfNo")?.toString() || null;
  const saleUnit = formData.get("saleUnit")?.toString();
  const restockUnit = formData.get("restockUnit")?.toString();
  const unitsPerRestock = formData.get("unitsPerRestock")?.toString();
  const file = formData.get("image") as File | null;

  return {
    name,
    categoryId,
    sku,
    barcode,
    price: price ? parseFloat(price) : undefined,
    cost: cost ? parseFloat(cost) : undefined,
    quantity: quantity ? parseInt(quantity) : 0,
    minStock: minStock ? parseInt(minStock) : 5,
    shelfNo,
    saleUnit,
    restockUnit,
    unitsPerRestock: unitsPerRestock ? parseInt(unitsPerRestock) : 12,
    file,
  };
}

// GET all products
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const lowStock = searchParams.get("lowStock");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const query: Record<string, unknown> = {};

    if (categoryId) {
      query.categoryId = categoryId;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { barcode: { $regex: search, $options: "i" } },
      ];
    }

    if (lowStock === "true") {
      query.$expr = { $lte: ["$quantity", "$minStock"] };
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("categoryId", "name color")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: products.map((product) => ({
        ...product,
        _id: product._id.toString(),
        categoryId: product.categoryId
          ? {
              ...(product.categoryId as {
                _id: { toString(): string };
                name: string;
                color: string;
              }),
              _id: (
                product.categoryId as { _id: { toString(): string } }
              )._id.toString(),
            }
          : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

// POST create new product
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const contentType = req.headers.get("content-type") || "";

    let validatedData: any;
    let imageUrl: string | null = null;
    let imagePublicId: string | null = null; // Declare imagePublicId

    if (contentType.includes("multipart/form-data")) {
      // Handle multipart form data with file
      const formData = await parseProductFormData(req);

      if (formData.file && formData.file.size > 0) {
        try {
          const buffer = Buffer.from(await formData.file.arrayBuffer());
          const result: any = await uploadImage(buffer, "store-track/products"); // Corrected call
          imageUrl = result.secure_url;
          imagePublicId = result.public_id; // Assign public_id
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          return NextResponse.json(
            { success: false, message: "Failed to upload image" },
            { status: 400 },
          );
        }
      }

      validatedData = productSchema.parse({
        name: formData.name,
        categoryId: formData.categoryId,
        sku: formData.sku,
        barcode: formData.barcode || generateBarcode(),
        price: formData.price,
        cost: formData.cost,
        quantity: formData.quantity,
        minStock: formData.minStock,
        shelfNo: formData.shelfNo,
        image: imageUrl,
        publicId: imagePublicId, // Store the publicId
        unitConfig: {
          saleUnit: formData.saleUnit || "piece",
          restockUnit: formData.restockUnit || "box",
          unitsPerRestock: formData.unitsPerRestock || 12,
        },
      });
    } else {
      // Handle JSON request
      const body = await req.json();
      validatedData = productSchema.parse(body);
    }

    // Check for duplicate SKU
    const existing = await Product.findOne({
      $or: [
        { sku: validatedData.sku.toUpperCase() },
        { barcode: validatedData.barcode },
      ],
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Product with this SKU or barcode already exists",
        },
        { status: 400 },
      );
    }

    const product = await Product.create({
      ...validatedData,
      sku: validatedData.sku.toUpperCase(),
    });

    // If initial quantity > 0, add to stock history
    if (validatedData.quantity > 0) {
      await StockHistory.create({
        productId: product._id,
        changeType: "restock",
        quantityChange: validatedData.quantity,
        previousQty: 0,
        newQty: validatedData.quantity,
        notes: "Initial stock",
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...product.toObject(),
          _id: product._id.toString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create product error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create product" },
      { status: 500 },
    );
  }
}
