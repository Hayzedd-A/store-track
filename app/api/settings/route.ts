import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Setting from "@/models/Setting";
import { z } from "zod";

const settingSchema = z.object({
  storeName: z.string().min(1, "Store name is required").max(100),
  address: z.string().max(300).optional().default(""),
  phone: z.string().max(50).optional().default(""),
  email: z
    .string()
    .email("Invalid email format")
    .or(z.literal(""))
    .optional()
    .default(""),
  skuSettings: z
    .object({
      method: z
        .enum(["RANDOM", "SEQUENTIAL", "CATEGORY_PREFIX"])
        .default("RANDOM"),
      prefix: z.string().max(10).optional().default(""),
    })
    .optional()
    .default({ method: "RANDOM", prefix: "" }),
});

export async function GET() {
  try {
    await connectToDatabase();

    // We only expect one settings document for the app.
    let setting = await Setting.findOne();

    // If it doesn't exist, create a default one
    if (!setting) {
      setting = await Setting.create({
        storeName: "My Store",
        address: "",
        phone: "",
        email: "",
        skuSettings: {
          method: "RANDOM",
          prefix: "",
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...setting.toObject(),
        _id: setting._id.toString(),
      },
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const validatedData = settingSchema.parse(body);
    // console.log(validatedData);
    // let setting = await Setting.findOne();
    // if (!setting) {
    //   setting = await Setting.create(validatedData);
    // } else {
    //   await Setting.updateOne({ _id: setting._id }, { $set: validatedData });
    // }

    // Update the single settings document (or insert if none)
    const setting = await Setting.findOneAndUpdate(
      {}, // Empty filter matches the first document
      { $set: validatedData },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
    );

    return NextResponse.json({
      success: true,
      data: {
        ...setting.toObject(),
        _id: setting._id.toString(),
      },
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Update settings error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to update settings" },
      { status: 500 },
    );
  }
}
