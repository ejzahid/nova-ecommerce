import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        customer: true,
        items: true,
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

    const discount = Number(body.discount || 0);
    const deliveryFee = Number(body.deliveryFee || 0);

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

    if (!Number.isFinite(discount) || discount < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid discount",
        },
        { status: 400 }
      );
    }

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

    const sale = await prisma.$transaction(async (tx) => {
      /*
       * CUSTOMER
       *
       * Phone is the unique identifier.
       * Name and address are intentionally updated with
       * the values entered for this sale.
       */
      let customer = await tx.customer.findUnique({
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
       * VALIDATE SALE ITEMS
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
          throw new Error(
            "Invalid product ID"
          );
        }

        if (
          !Number.isInteger(item.quantity) ||
          item.quantity <= 0
        ) {
          throw new Error(
            "Invalid product quantity"
          );
        }
      }

      /*
       * COMBINE DUPLICATE PRODUCTS
       *
       * If the same product is selected twice,
       * quantities are combined safely.
       */
      const quantityMap = new Map<
        number,
        number
      >();

      for (const item of rawItems) {
        quantityMap.set(
          item.productId,
          (quantityMap.get(item.productId) || 0) +
            item.quantity
        );
      }

      const productIds = Array.from(
        quantityMap.keys()
      );

      const products = await tx.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
      });

      if (products.length !== productIds.length) {
        throw new Error(
          "One or more products were not found"
        );
      }

      /*
       * CALCULATE SALE
       */
      let subtotal = 0;

      const saleItems = [];

      for (const productId of productIds) {
        const product = products.find(
          (itemProduct) =>
            itemProduct.id === productId
        );

        if (!product) {
          throw new Error(
            "Product not found"
          );
        }

        const quantity =
          quantityMap.get(productId) || 0;

        if (product.stock < quantity) {
          throw new Error(
            `${product.name} has only ${product.stock} item(s) in stock`
          );
        }

        const unitPrice = Number(
          product.price
        );

        const itemTotal =
          unitPrice * quantity;

        subtotal += itemTotal;

        saleItems.push({
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          quantity,
          unitPrice,
          total: itemTotal,
        });
      }

      const total = Math.max(
        0,
        subtotal - discount + deliveryFee
      );

      /*
       * CREATE SALE
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
            paymentStatus:
              paymentMethod === "COD"
                ? "PENDING"
                : "PAID",
            orderStatus: "PENDING",
            note,
            items: {
              create: saleItems,
            },
          },
          include: {
            customer: true,
            items: true,
          },
        });

      /*
       * DECREASE STOCK
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

        if (updatedProduct.count !== 1) {
          throw new Error(
            "Stock changed while creating the sale. Please try again."
          );
        }
      }

      return createdSale;
    });

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

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create sale",
      },
      { status: 500 }
    );
  }
}