import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

const ALLOWED_PAYMENT_METHODS = [
  "COD",
  "CASH",
  "BKASH",
  "NAGAD",
  "CARD",
] as const;

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      sales,
    });
  } catch (error) {
    console.error("Sales GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load sales",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const customerName = String(
      body.customerName || ""
    ).trim();

    const customerPhone = String(
      body.customerPhone || ""
    ).trim();

    const customerAddress =
      body.customerAddress === undefined ||
      body.customerAddress === null ||
      String(body.customerAddress).trim() === ""
        ? null
        : String(body.customerAddress).trim();

    const paymentMethod = String(
      body.paymentMethod || "COD"
    )
      .trim()
      .toUpperCase();

    const note =
      body.note === undefined ||
      body.note === null ||
      String(body.note).trim() === ""
        ? null
        : String(body.note).trim();

    const discount = Number(body.discount ?? 0);
    const deliveryFee = Number(
      body.deliveryFee ?? 0
    );

    /*
     * BASIC CUSTOMER VALIDATION
     */
    if (!customerName) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer name is required",
        },
        { status: 400 }
      );
    }

    if (!customerPhone) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer phone is required",
        },
        { status: 400 }
      );
    }

    /*
     * PAYMENT METHOD VALIDATION
     */
    if (
      !ALLOWED_PAYMENT_METHODS.includes(
        paymentMethod as
          (typeof ALLOWED_PAYMENT_METHODS)[number]
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payment method",
        },
        { status: 400 }
      );
    }

    /*
     * ITEMS VALIDATION
     */
    if (
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "At least one product is required",
        },
        { status: 400 }
      );
    }

    /*
     * DISCOUNT VALIDATION
     */
    if (
      !Number.isFinite(discount) ||
      discount < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid discount",
        },
        { status: 400 }
      );
    }

    /*
     * DELIVERY FEE VALIDATION
     */
    if (
      !Number.isFinite(deliveryFee) ||
      deliveryFee < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid delivery fee",
        },
        { status: 400 }
      );
    }

    /*
     * VALIDATE RAW SALE ITEMS
     */
    const rawItems = body.items.map(
      (item: {
        productId: number | string;
        quantity: number | string;
      }) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity),
      })
    );

    for (const item of rawItems) {
      if (
        !Number.isInteger(item.productId) ||
        item.productId <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid product ID",
          },
          { status: 400 }
        );
      }

      if (
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid product quantity",
          },
          { status: 400 }
        );
      }
    }

    /*
     * PREVENT DUPLICATE PRODUCTS
     *
     * Same product cannot appear more than once
     * in a single sale.
     */
    const productIdSet = new Set<number>();

    for (const item of rawItems) {
      if (productIdSet.has(item.productId)) {
        return NextResponse.json(
          {
            success: false,
            error:
              "The same product cannot be added more than once. Please change the quantity instead.",
          },
          { status: 400 }
        );
      }

      productIdSet.add(item.productId);
    }

    const productIds = Array.from(productIdSet);

    /*
     * CREATE SALE + CUSTOMER + STOCK UPDATE
     *
     * Everything happens inside one transaction.
     *
     * If anything fails, the complete transaction
     * is rolled back.
     */
    const sale = await prisma.$transaction(
      async (tx) => {
        /*
         * CUSTOMER
         *
         * Phone is used as the customer identifier.
         *
         * Name and address are saved using the values
         * entered for THIS sale.
         */
        let customer =
          await tx.customer.findUnique({
            where: {
              phone: customerPhone,
            },
          });

        if (customer) {
          customer =
            await tx.customer.update({
              where: {
                id: customer.id,
              },
              data: {
                name: customerName,
                address: customerAddress,
              },
            });
        } else {
          customer =
            await tx.customer.create({
              data: {
                name: customerName,
                phone: customerPhone,
                address: customerAddress,
              },
            });
        }

        /*
         * LOAD PRODUCTS
         */
        const products =
          await tx.product.findMany({
            where: {
              id: {
                in: productIds,
              },
            },
          });

        if (
          products.length !==
          productIds.length
        ) {
          throw new Error(
            "One or more products were not found"
          );
        }

        /*
         * CALCULATE SUBTOTAL
         */
        let subtotal = 0;

        const saleItems: Array<{
          productId: number;
          productName: string;
          sku: string | null;
          quantity: number;
          unitPrice: number;
          total: number;
        }> = [];

        for (const item of rawItems) {
          const product = products.find(
            (productItem) =>
              productItem.id ===
              item.productId
          );

          if (!product) {
            throw new Error(
              "One or more products were not found"
            );
          }

          /*
           * STOCK VALIDATION
           */
          if (
            item.quantity >
            product.stock
          ) {
            throw new Error(
              `${product.name} has only ${product.stock} item(s) in stock`
            );
          }

          /*
           * PRICE VALIDATION
           */
          const unitPrice = Number(
            product.price
          );

          if (
            !Number.isFinite(unitPrice) ||
            unitPrice < 0
          ) {
            throw new Error(
              `Invalid price for ${product.name}`
            );
          }

          const itemTotal =
            unitPrice * item.quantity;

          if (
            !Number.isFinite(itemTotal)
          ) {
            throw new Error(
              `Invalid total for ${product.name}`
            );
          }

          subtotal += itemTotal;

          saleItems.push({
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            quantity: item.quantity,
            unitPrice,
            total: itemTotal,
          });
        }

        /*
         * FINAL SUBTOTAL VALIDATION
         */
        if (
          !Number.isFinite(subtotal) ||
          subtotal < 0
        ) {
          throw new Error(
            "Invalid sale subtotal"
          );
        }

        /*
         * DISCOUNT VALIDATION
         */
        if (discount > subtotal) {
          throw new Error(
            "Discount cannot be greater than subtotal"
          );
        }

        /*
         * FINAL TOTAL
         */
        const total =
          subtotal -
          discount +
          deliveryFee;

        if (
          !Number.isFinite(total) ||
          total < 0
        ) {
          throw new Error(
            "Invalid sale total"
          );
        }

        /*
         * CREATE SALE
         *
         * New sales start with PENDING payment.
         * Admin can mark payment as PAID later.
         */
        const createdSale =
          await tx.sale.create({
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

              paymentStatus: "PENDING",

              orderStatus: "PENDING",

              note,

              items: {
                create: saleItems,
              },
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

        /*
         * DECREASE STOCK SAFELY
         *
         * updateMany + stock >= quantity prevents
         * stock from becoming negative if another
         * transaction changes the stock.
         */
        for (const item of saleItems) {
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

          if (
            updatedProduct.count !== 1
          ) {
            throw new Error(
              "Stock changed while creating the sale. Please try again."
            );
          }
        }

        return createdSale;
      }
    );

    return NextResponse.json(
      {
        success: true,
        sale,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Sale POST error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create sale";

    const validationErrors = [
      "Customer name is required",
      "Customer phone is required",
      "Invalid payment method",
      "At least one product is required",
      "Invalid discount",
      "Invalid delivery fee",
      "Invalid product ID",
      "Invalid product quantity",
      "The same product cannot be added more than once. Please change the quantity instead.",
      "One or more products were not found",
      "Discount cannot be greater than subtotal",
      "Invalid sale subtotal",
      "Invalid sale total",
    ];

    const isValidationError =
      validationErrors.includes(message) ||
      message.includes("has only") ||
      message.includes("Invalid price for");

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: isValidationError
          ? 400
          : 500,
      }
    );
  }
}