import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Setting from "@/models/Setting";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { z } from "zod";

const generateSchema = z.object({
  categoryId: z.string().optional().nullable(),
});

function generateRandomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { categoryId } = generateSchema.parse(body);

    const setting = await Setting.findOne();
    const skuMethod = setting?.skuSettings?.method || "RANDOM";
    let skuPrefix = setting?.skuSettings?.prefix || "";

    let newSku = "";
    let isUnique = false;
    let attempts = 0;

    // Retry loop for random method to ensure uniqueness
    while (!isUnique && attempts < 10) {
      if (skuMethod === "RANDOM") {
        newSku = skuPrefix + generateRandomString(8);
      } else if (skuMethod === "SEQUENTIAL") {
        // Find the product with the highest SKU matching the prefix
        const regex = new RegExp(`^${skuPrefix}(\\d+)$`, "i");
        const lastProduct = await Product.findOne({
          sku: { $regex: regex },
        }).sort({ sku: -1 });

        let nextNumber = 1;
        if (lastProduct && lastProduct.sku) {
          const match = lastProduct.sku.match(regex);
          if (match && match[1]) {
            nextNumber = parseInt(match[1], 10) + 1;
          }
        }
        newSku = `${skuPrefix}${nextNumber.toString().padStart(4, "0")}`; // e.g. PRE0001
      } else if (skuMethod === "CATEGORY_PREFIX") {
        let catPrefix = "GEN"; // default generic
        if (categoryId) {
          const cat = await Category.findById(categoryId);
          if (cat && cat.name) {
            // Take first 3-4 letters of category name, uppercase, no spaces
            catPrefix = cat.name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 4).toUpperCase();
          }
        }
        
        // Find sequential number for this category prefix
        const regex = new RegExp(`^${catPrefix}-(\\d+)$`, "i");
        const lastProduct = await Product.findOne({
          sku: { $regex: regex },
        }).sort({ sku: -1 });

        let nextNumber = 1;
        if (lastProduct && lastProduct.sku) {
          const match = lastProduct.sku.match(regex);
          if (match && match[1]) {
            nextNumber = parseInt(match[1], 10) + 1;
          }
        }
        newSku = `${catPrefix}-${nextNumber.toString().padStart(4, "0")}`;
      }

      // Check for uniqueness
      const existing = await Product.findOne({ sku: newSku.toUpperCase() });
      if (!existing) {
        isUnique = true;
      }
      
      attempts++;
      
      // If not RANDOM, sequential *should* be unique on first try if querying works properly,
      // but in a concurrent environment, sequential logic might collide. We add a random suffix if we fail multiple times.
      if (attempts >= 5 && skuMethod !== "RANDOM") {
        newSku += "-" + generateRandomString(3);
      }
    }

    if (!isUnique) {
      throw new Error("Could not generate a unique SKU after 10 attempts");
    }

    return NextResponse.json({
      success: true,
      sku: newSku.toUpperCase(),
    });
  } catch (error) {
    console.error("Generate SKU error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: "Failed to generate SKU" },
      { status: 500 }
    );
  }
}
