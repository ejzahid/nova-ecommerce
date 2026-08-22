import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const ALLOWED_ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const ALLOWED_PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];

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

    const body = await request.json();

    const result = await prisma.$transaction(
      async (tx) => {
        const existingSale =
          await tx.sale.findUnique({
            where: {
              id: saleId,
            },
            include: {
              items: true,
            },
          });

        if (!existingSale) {
          return {
            error: "Sale not found",
            status: 404,
          };
        }

        const orderStatus =
          typeof body.orderStatus === "string"
            ? body.orderStatus
                .trim()
                .toUpperCase()
            : existingSale.orderStatus;

        const paymentStatus =
          typeof body.paymentStatus === "string"
            ? body.paymentStatus
                .trim()
                .toUpperCase()
            : existingSale.paymentStatus;

        if (
          !ALLOWED_ORDER_STATUSES.includes(
            orderStatus
          )
        ) {
          return {
            error: "Invalid order status",
            status: 400,
          };
        }

        if (
          !ALLOWED_PAYMENT_STATUSES.includes(
            paymentStatus
          )
        ) {
          return {
            error: "Invalid payment status",
            status: 400,
          };
        }

        const wasCancelled =
          existingSale.orderStatus ===
          "CANCELLED";

        const willBeCancelled =
          orderStatus === "CANCELLED";

        /*
         * CANCEL SALE
         *
         * When a normal sale becomes CANCELLED,
         * return all sold quantities to stock.
         */
        if (
          !wasCancelled &&
          willBeCancelled
        ) {
          for (const item of existingSale.items) {
            await tx.product.update({
              where: {
                id: item.productId,
              },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });
          }
        }

        /*
         * REACTIVATE CANCELLED SALE
         *
         * If a cancelled sale is changed back to an
         * active status, deduct its quantities again.
         *
         * updateMany + stock >= quantity makes this
         * safe if current stock is insufficient.
         */
        if (
          wasCancelled &&
          !willBeCancelled
        ) {
          for (const item of existingSale.items) {
            const updatedProduct =
              await tx.product.updateMany({
                where: {
                  id: item.productId,
                  stock: {
                    gte: item.quantity,
                  },
                },
                data: {
                  stock: {
                    decrement: item.quantity,
                  },
                },
              });

            if (updatedProduct.count !== 1) {
              const product =
                await tx.product.findUnique({
                  where: {
                    id: item.productId,
                  },
                  select: {
                    name: true,
                    stock: true,
                  },
                });

              throw new Error(
                product
                  ? `Cannot reactivate sale. ${product.name} has only ${product.stock} item(s) in stock, but ${item.quantity} required.`
                  : `Cannot reactivate sale. Product #${item.productId} was not found.`
              );
            }
          }
        }

        const sale = await tx.sale.update({
          where: {
            id: saleId,
          },
          data: {
            orderStatus,
            paymentStatus,
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

        return {
          sale,
          status: 200,
        };
      }
    );

    if ("error" in result) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      sale: result.sale,
    });
  } catch (error) {
    console.error("Sale PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update sale",
      },
      {
        status: 500,
      }
    );
  }
}