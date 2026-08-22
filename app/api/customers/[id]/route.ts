import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const customerId = Number(id);

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid customer ID",
        },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
      include: {
        _count: {
          select: {
            sales: true,
          },
        },
        sales: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            items: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer not found",
        },
        { status: 404 }
      );
    }

    const totalSpent = customer.sales.reduce(
      (sum, sale) => sum + Number(sale.total),
      0
    );

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        email: customer.email,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        totalSales: customer._count.sales,
        totalSpent,
        sales: customer.sales.map((sale) => ({
          id: sale.id,
          customerName: sale.customerName,
          customerPhone: sale.customerPhone,
          customerAddress: sale.customerAddress,
          subtotal: Number(sale.subtotal),
          discount: Number(sale.discount),
          deliveryFee: Number(sale.deliveryFee),
          total: Number(sale.total),
          paymentMethod: sale.paymentMethod,
          paymentStatus: sale.paymentStatus,
          orderStatus: sale.orderStatus,
          note: sale.note,
          createdAt: sale.createdAt,
          updatedAt: sale.updatedAt,
          items: sale.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            sku: item.sku,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            total: Number(item.total),
          })),
        })),
      },
    });
  } catch (error) {
    console.error("Customer details API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load customer",
      },
      { status: 500 }
    );
  }
}