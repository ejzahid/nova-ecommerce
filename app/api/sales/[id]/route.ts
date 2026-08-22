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
            status: 404 as const,
          };
        }

        /*
         * CUSTOMER DATA
         *
         * If the edit request does not contain customer
         * fields, keep the existing values.
         */
        const customerName =
          typeof body.customerName === "string"
            ? body.customerName.trim()
            : existingSale.customerName;

        const customerPhone =
          typeof body.customerPhone === "string"
            ? body.customerPhone.trim()
            : existingSale.customerPhone;

        const customerAddress =
          body.customerAddress === undefined
            ? existingSale.customerAddress
            : body.customerAddress === null ||
                String(body.customerAddress).trim() === ""
              ? null
              : String(body.customerAddress).trim();

        if (!customerName) {
          return {
            error: "Customer name is required",
            status: 400 as const,
          };
        }

        if (!customerPhone) {
          return {
            error: "Customer phone is required",
            status: 400 as const,
          };
        }

        /*
         * STATUS
         */
        const orderStatus =
          typeof body.orderStatus === "string"
            ? body.orderStatus.trim().toUpperCase()
            : existingSale.orderStatus;

        const paymentStatus =
          typeof body.paymentStatus === "string"
            ? body.paymentStatus.trim().toUpperCase()
            : existingSale.paymentStatus;

        if (
          !ALLOWED_ORDER_STATUSES.includes(
            orderStatus
          )
        ) {
          return {
            error: "Invalid order status",
            status: 400 as const,
          };
        }

        if (
          !ALLOWED_PAYMENT_STATUSES.includes(
            paymentStatus
          )
        ) {
          return {
            error: "Invalid payment status",
            status: 400 as const,
          };
        }

        /*
         * PAYMENT METHOD
         */
        const paymentMethod =
          typeof body.paymentMethod === "string"
            ? body.paymentMethod.trim().toUpperCase()
            : existingSale.paymentMethod;

        if (!paymentMethod) {
          return {
            error: "Payment method is required",
            status: 400 as const,
          };
        }

        /*
         * NOTE
         */
        const note =
          body.note === undefined
            ? existingSale.note
            : body.note === null ||
                String(body.note).trim() === ""
              ? null
              : String(body.note).trim();

        /*
         * FINANCIAL VALUES
         */
        const discount =
          body.discount === undefined
            ? Number(existingSale.discount)
            : Number(body.discount);

        const deliveryFee =
          body.deliveryFee === undefined
            ? Number(existingSale.deliveryFee)
            : Number(body.deliveryFee);

        if (
          !Number.isFinite(discount) ||
          discount < 0
        ) {
          return {
            error: "Invalid discount",
            status: 400 as const,
          };
        }

        if (
          !Number.isFinite(deliveryFee) ||
          deliveryFee < 0
        ) {
          return {
            error: "Invalid delivery fee",
            status: 400 as const,
          };
        }

        /*
         * CUSTOMER
         *
         * Phone is the unique identifier.
         */
        let customer =
          await tx.customer.findUnique({
            where: {
              phone: customerPhone,
            },
          });

        if (customer) {
          customer = await tx.customer.update({
            where: {
              id: customer.id,
            },
            data: {
              name: customerName,
              address: customerAddress,
            },
          });
        } else {
          customer = await tx.customer.create({
            data: {
              name: customerName,
              phone: customerPhone,
              address: customerAddress,
            },
          });
        }

        /*
         * CHECK WHETHER PRODUCT DATA IS BEING EDITED
         */
        const productDataWasProvided =
          Array.isArray(body.items);

        let newItems = existingSale.items.map(
          (item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })
        );

        if (productDataWasProvided) {
          if (body.items.length === 0) {
            return {
              error:
                "At least one product is required",
              status: 400 as const,
            };
          }

          const rawItems = body.items.map(
            (item: {
              productId: number | string;
              quantity: number | string;
            }) => ({
              productId: Number(item.productId),
              quantity: Number(item.quantity),
            })
          );

          const productIdSet = new Set<number>();

          for (const item of rawItems) {
            if (
              !Number.isInteger(item.productId) ||
              item.productId <= 0
            ) {
              return {
                error: "Invalid product ID",
                status: 400 as const,
              };
            }

            if (
              !Number.isInteger(item.quantity) ||
              item.quantity <= 0
            ) {
              return {
                error: "Invalid product quantity",
                status: 400 as const,
              };
            }

            if (
              productIdSet.has(item.productId)
            ) {
              return {
                error:
                  "The same product cannot be added more than once. Please change the quantity instead.",
                status: 400 as const,
              };
            }

            productIdSet.add(item.productId);
          }

          newItems = rawItems;
        }

        /*
         * LOAD ALL PRODUCTS NEEDED BY THE NEW SALE
         */
        const productIds = Array.from(
          new Set(
            newItems.map(
              (item) => item.productId
            )
          )
        );

        const products =
          await tx.product.findMany({
            where: {
              id: {
                in: productIds,
              },
            },
          });

        if (
          products.length !== productIds.length
        ) {
          return {
            error:
              "One or more products were not found",
            status: 400 as const,
          };
        }

        /*
         * BUILD NEW SALE ITEMS
         */
        let subtotal = 0;

        const newSaleItems = [];

        for (const item of newItems) {
          const product = products.find(
            (productItem) =>
              productItem.id === item.productId
          );

          if (!product) {
            return {
              error:
                "One or more products were not found",
              status: 400 as const,
            };
          }

          const unitPrice = Number(
            product.price
          );

          if (
            !Number.isFinite(unitPrice) ||
            unitPrice < 0
          ) {
            return {
              error: `Invalid price for ${product.name}`,
              status: 400 as const,
            };
          }

          subtotal +=
            unitPrice * item.quantity;

          newSaleItems.push({
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            quantity: item.quantity,
            unitPrice,
            total:
              unitPrice * item.quantity,
          });
        }

        if (discount > subtotal) {
          return {
            error:
              "Discount cannot be greater than subtotal",
            status: 400 as const,
          };
        }

        const total =
          subtotal -
          discount +
          deliveryFee;

        /*
         * STOCK RECONCILIATION
         *
         * Active -> Active:
         * adjust only the quantity difference.
         *
         * Active -> Cancelled:
         * return old quantities.
         *
         * Cancelled -> Active:
         * deduct new quantities.
         *
         * Cancelled -> Cancelled:
         * stock remains unchanged.
         */
        const wasCancelled =
          existingSale.orderStatus ===
          "CANCELLED";

        const willBeCancelled =
          orderStatus === "CANCELLED";

        const oldQuantityMap =
          new Map<number, number>();

        for (const item of existingSale.items) {
          oldQuantityMap.set(
            item.productId,
            item.quantity
          );
        }

        const newQuantityMap =
          new Map<number, number>();

        for (const item of newSaleItems) {
          newQuantityMap.set(
            item.productId,
            item.quantity
          );
        }

        const allProductIds = Array.from(
          new Set([
            ...oldQuantityMap.keys(),
            ...newQuantityMap.keys(),
          ])
        );

        for (const productId of allProductIds) {
          const oldQuantity =
            oldQuantityMap.get(productId) || 0;

          const newQuantity =
            newQuantityMap.get(productId) || 0;

          if (!wasCancelled && !willBeCancelled) {
            /*
             * Active -> Active
             */
            const difference =
              newQuantity - oldQuantity;

            if (difference > 0) {
              const updatedProduct =
                await tx.product.updateMany({
                  where: {
                    id: productId,
                    stock: {
                      gte: difference,
                    },
                  },
                  data: {
                    stock: {
                      decrement: difference,
                    },
                  },
                });

              if (
                updatedProduct.count !== 1
              ) {
                const product =
                  await tx.product.findUnique({
                    where: {
                      id: productId,
                    },
                    select: {
                      name: true,
                      stock: true,
                    },
                  });

                throw new Error(
                  product
                    ? `${product.name} has only ${product.stock} item(s) in stock, but ${difference} additional item(s) are required.`
                    : `Product #${productId} was not found.`
                );
              }
            }

            if (difference < 0) {
              await tx.product.update({
                where: {
                  id: productId,
                },
                data: {
                  stock: {
                    increment:
                      Math.abs(difference),
                  },
                },
              });
            }
          } else if (
            !wasCancelled &&
            willBeCancelled
          ) {
            /*
             * Active -> Cancelled
             *
             * Return the OLD sold quantity.
             */
            if (oldQuantity > 0) {
              await tx.product.update({
                where: {
                  id: productId,
                },
                data: {
                  stock: {
                    increment: oldQuantity,
                  },
                },
              });
            }
          } else if (
            wasCancelled &&
            !willBeCancelled
          ) {
            /*
             * Cancelled -> Active
             *
             * Deduct the NEW quantity.
             */
            if (newQuantity > 0) {
              const updatedProduct =
                await tx.product.updateMany({
                  where: {
                    id: productId,
                    stock: {
                      gte: newQuantity,
                    },
                  },
                  data: {
                    stock: {
                      decrement: newQuantity,
                    },
                  },
                });

              if (
                updatedProduct.count !== 1
              ) {
                const product =
                  await tx.product.findUnique({
                    where: {
                      id: productId,
                    },
                    select: {
                      name: true,
                      stock: true,
                    },
                  });

                throw new Error(
                  product
                    ? `Cannot reactivate sale. ${product.name} has only ${product.stock} item(s) in stock, but ${newQuantity} required.`
                    : `Cannot reactivate sale. Product #${productId} was not found.`
                );
              }
            }
          }

          /*
           * Cancelled -> Cancelled
           *
           * No stock movement.
           */
        }

        /*
         * REPLACE SALE ITEMS
         *
         * This is done only after stock validation.
         */
        if (productDataWasProvided) {
          await tx.saleItem.deleteMany({
            where: {
              saleId,
            },
          });

          await tx.saleItem.createMany({
            data: newSaleItems.map((item) => ({
              saleId,
              productId: item.productId,
              productName: item.productName,
              sku: item.sku,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
            })),
          });
        }

        /*
         * UPDATE SALE
         */
        const sale = await tx.sale.update({
          where: {
            id: saleId,
          },
          data: {
            customerId: customer.id,
            customerName,
            customerPhone,
            customerAddress,
            subtotal,
            discount,
            deliveryFee,
            total,
            paymentMethod,
            paymentStatus,
            orderStatus,
            note,
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
          status: 200 as const,
        };
      }
    );

    if ("error" in result) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        {
          status: result.status,
        }
      );
    }

    return NextResponse.json({
      success: true,
      sale: result.sale,
    });
  } catch (error) {
    console.error(
      "Sale PUT error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update sale";

    const isClientError =
      message.includes("has only") ||
      message.includes(
        "Cannot reactivate sale"
      );

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: isClientError ? 400 : 500,
      }
    );
  }
}