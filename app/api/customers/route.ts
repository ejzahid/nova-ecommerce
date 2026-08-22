import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone")?.trim() || "";
    const search = searchParams.get("search")?.trim() || "";

    // Existing customer phone lookup
    if (phone) {
      const customer = await prisma.customer.findUnique({
        where: {
          phone,
        },
      });

      return NextResponse.json({
        success: true,
        customer,
      });
    }

    // Customer management list
    const customers = await prisma.customer.findMany({
      where: search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                phone: {
                  contains: search,
                },
              },
              {
                address: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : undefined,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            sales: true,
          },
        },
        sales: {
          select: {
            total: true,
          },
        },
      },
    });

    const result = customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      email: customer.email,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      totalSales: customer._count.sales,
      totalSpent: customer.sales.reduce(
        (sum, sale) => sum + Number(sale.total),
        0
      ),
    }));

    return NextResponse.json({
      success: true,
      customers: result,
    });
  } catch (error) {
    console.error("Customer API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load customers",
      },
      { status: 500 }
    );
  }
}