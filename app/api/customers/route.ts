import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone")?.trim() || "";

    if (!phone) {
      return NextResponse.json({
        success: true,
        customer: null,
      });
    }

    const customer = await prisma.customer.findUnique({
      where: {
        phone,
      },
    });

    return NextResponse.json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("Customer lookup error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to lookup customer",
      },
      { status: 500 }
    );
  }
}