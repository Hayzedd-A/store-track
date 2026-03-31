import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import StockHistory from "@/models/StockHistory";
import { uploadImage, deleteImage } from "@/lib/cloudinary"; // Import Cloudinary functions
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  categoryId: z.string().nullable().optional(),
  sku: z.string().min(1).max(20).optional(),
  barcode: z.string().nullable().optional(),
  price: z.number().min(0).optional(),
  cost: z.number().min(0).optional(),
  quantity: z.number().min(0).optional(),
  image: z.string().nullable().optional(),
  publicId: z.string().nullable().optional(),
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
  imageRemoved: z.boolean().optional().default(false), // Added imageRemoved to schema
});

// Helper function to parse multipart form data for product update
async function parseProductUpdateFormData(req: NextRequest) {
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
  const imageRemoved = formData.get("imageRemoved")?.toString() === "true"; // Check for string 'true'
  const currentPublicId = formData.get("currentPublicId")?.toString() || null;
  const file = formData.get("image") as File | null; // The new image file

  return {
    name,
    categoryId,
    sku,
    barcode,
    price: price ? parseFloat(price) : undefined,
    cost: cost ? parseFloat(cost) : undefined,
    quantity: quantity ? parseInt(quantity) : undefined,
    minStock: minStock ? parseInt(minStock) : undefined,
    shelfNo,
    saleUnit,
    restockUnit,
    unitsPerRestock: unitsPerRestock ? parseInt(unitsPerRestock) : undefined,
    imageRemoved,
    currentPublicId,
    file,
  };
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectToDatabase();

    const { id } = await params;
    const contentType = req.headers.get("content-type") || "";

    let updateData: Record<string, any> = {};
    let validated: any;
    let newImageFile: File | null = null;
    let imageRemovedFlag: boolean = false;
    // let oldPublicId: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await parseProductUpdateFormData(req);
      validated = updateSchema.parse({
        name: formData.name,
        categoryId: formData.categoryId,
        sku: formData.sku,
        barcode: formData.barcode,
        price: formData.price,
        cost: formData.cost,
        quantity: formData.quantity,
        minStock: formData.minStock,
        shelfNo: formData.shelfNo,
        unitConfig: {
          saleUnit: formData.saleUnit || "piece",
          restockUnit: formData.restockUnit || "box",
          unitsPerRestock: formData.unitsPerRestock || 12,
        },
        imageRemoved: formData.imageRemoved,
      });
      newImageFile = formData.file;
      imageRemovedFlag = formData.imageRemoved;
      // oldPublicId = formData.currentPublicId; // This is the old publicId passed from frontend
    } else {
      const body = await req.json();
      validated = updateSchema.parse(body);
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    // If SKU provided, ensure uniqueness (case-insensitive)
    if (validated.sku) {
      const existing = await Product.findOne({
        sku: validated.sku.toUpperCase(),
        _id: { $ne: id },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, message: "Another product with this SKU exists" },
          { status: 400 },
        );
      }
      updateData.sku = validated.sku.toUpperCase();
    }

    // Initialize updateData with validated fields (excluding image specific ones handled separately)
    Object.assign(updateData, validated);
    delete updateData.imageRemoved; // Remove this flag from direct update

    // Image handling logic
    let finalImageUrl: string | null = product.image;
    let finalPublicId: string | null = product.publicId;

    if (imageRemovedFlag) {
      if (product.publicId) {
        await deleteImage(product.publicId);
      }
      finalImageUrl = null;
      finalPublicId = null;
    }

    if (newImageFile && newImageFile.size > 0) {
      // If there was an old image and it wasn't marked for removal, delete it first
      // This covers cases where an image is replaced without explicit removal
      if (product.publicId && !imageRemovedFlag) {
        await deleteImage(product.publicId);
      }
      const buffer = Buffer.from(await newImageFile.arrayBuffer());
      const result: any = await uploadImage(buffer, "store-track/products");
      finalImageUrl = result.secure_url;
      finalPublicId = result.public_id;
    }

    // Apply final image data to updateData
    updateData.image = finalImageUrl;
    updateData.publicId = finalPublicId;

    // Handle unitConfig normalization
    if (validated.unitConfig) {
      updateData.unitConfig = {
        saleUnit: validated.unitConfig.saleUnit,
        restockUnit: validated.unitConfig.restockUnit,
        unitsPerRestock: validated.unitConfig.unitsPerRestock,
      };
    }

    // Track quantity changes and create stock history
    if (
      typeof validated.quantity === "number" &&
      validated.quantity !== product.quantity
    ) {
      const previousQty = product.quantity;
      const newQty = validated.quantity;
      const change = newQty - previousQty;

      await StockHistory.create({
        productId: product._id,
        changeType: change > 0 ? "restock" : "adjust",
        quantityChange: Math.abs(change),
        previousQty,
        newQty,
        notes: validated.notes || "Updated via API",
      });
    }

    const updated = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("categoryId", "name color")
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        _id: (updated as any)?._id?.toString?.() || id,
        categoryId: (updated as any)?.categoryId
          ? {
              ...(updated as any).categoryId,
              _id: (updated as any).categoryId._id.toString(),
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Update product error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to update product" },
      { status: 500 },
    );
  }
}

// Optionally support GET for a single product
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const product = await Product.findById(id)
      .populate("categoryId", "name color")
      .lean();
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({
      success: true,
      data: {
        ...product,
        _id: (product as any)._id.toString(),
        categoryId: (product as any).categoryId
          ? {
              ...(product as any).categoryId,
              _id: (product as any).categoryId._id.toString(),
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Get single product error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch product" },
      { status: 500 },
    );
  }
}
