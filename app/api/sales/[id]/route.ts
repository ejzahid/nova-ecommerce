import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const saleId = Number(id);

    if (!Number.isInteger(saleId) || saleId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid sale ID",
        },
        { status: 400 }
      );
    }

    const sale = await prisma.sale.findUnique({
      where: {
        id: saleId,
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!sale) {
      return NextResponse.json(
        {
          success: false,
          error: "Sale not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      sale,
    });
  } catch (error) {
    console.error("Sale GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load sale",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const saleId = Number(id);

    if (!Number.isInteger(saleId) || saleId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid sale ID",
        },
        { status: 400 }
      );
    }

    const existingSale = await prisma.sale.findUnique({
      where: {
        id: saleId,
      },
    });

    if (!existingSale) {
      return NextResponse.json(
        {
          success: false,
          error: "Sale not found",
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    const orderStatus =
      typeof body.orderStatus === "string"
        ? body.orderStatus.trim().toUpperCase()
        : existingSale.orderStatus;

    const paymentStatus =
      typeof body.paymentStatus === "string"
        ? body.paymentStatus.trim().toUpperCase()
        : existingSale.paymentStatus;

    const allowedOrderStatuses = [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    const allowedPaymentStatuses = [
      "PENDING",
      "PAID",
      "FAILED",
      "REFUNDED",
    ];

    if (!allowedOrderStatuses.includes(orderStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid order status",
        },
        { status: 400 }
      );
    }

    if (!allowedPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payment status",
        },
        { status: 400 }
      );
    }

    const sale = await prisma.sale.update({
      where: {
        id: saleId,
      },
      data: {
        orderStatus,
        paymentStatus,
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      sale,
    });
  } catch (error) {
    console.error("Sale PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update sale",
      },
      { status: 500 }
    );
  }
}