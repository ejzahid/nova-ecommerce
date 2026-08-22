import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

type ProductRouteContext = RouteContext<"/api/products/[id]">;

export async function GET(
  _request: Request,
  { params }: ProductRouteContext
) {
  try {
    const { id } = await params;
    const productId = Number(id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid product ID",
        },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Product GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load product",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: ProductRouteContext
) {
  try {
    const { id } = await params;
    const productId = Number(id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid product ID",
        },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    const name = String(body.name || "").trim();
    const slug = String(body.slug || "").trim();

    const description =
      body.description !== undefined &&
      body.description !== null &&
      String(body.description).trim() !== ""
        ? String(body.description).trim()
        : null;

    const categoryId = Number(body.categoryId);
    const price = Number(body.price);

    const oldPrice =
      body.oldPrice !== undefined &&
      body.oldPrice !== null &&
      body.oldPrice !== ""
        ? Number(body.oldPrice)
        : null;

    const sku =
      body.sku !== undefined &&
      body.sku !== null &&
      String(body.sku).trim() !== ""
        ? String(body.sku).trim()
        : null;

    const stock = Number(body.stock ?? 0);

    const image =
      body.image !== undefined &&
      body.image !== null &&
      String(body.image).trim() !== ""
        ? String(body.image).trim()
        : null;

    const badge =
      body.badge !== undefined &&
      body.badge !== null &&
      String(body.badge).trim() !== ""
        ? String(body.badge).trim()
        : null;

    const isActive =
      body.isActive === undefined
        ? existingProduct.isActive
        : Boolean(body.isActive);

    const isFeatured =
      body.isFeatured === undefined
        ? existingProduct.isFeatured
        : Boolean(body.isFeatured);

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Product name is required",
        },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: "Product slug is required",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid category is required",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid price is required",
        },
        { status: 400 }
      );
    }

    if (
      oldPrice !== null &&
      (!Number.isFinite(oldPrice) || oldPrice < 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Old price is invalid",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Stock must be a valid number",
        },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "Selected category does not exist",
        },
        { status: 400 }
      );
    }

    const duplicateSlug = await prisma.product.findFirst({
      where: {
        slug,
        NOT: {
          id: productId,
        },
      },
    });

    if (duplicateSlug) {
      return NextResponse.json(
        {
          success: false,
          error: "A product with this slug already exists",
        },
        { status: 409 }
      );
    }

    if (sku) {
      const duplicateSku = await prisma.product.findFirst({
        where: {
          sku,
          NOT: {
            id: productId,
          },
        },
      });

      if (duplicateSku) {
        return NextResponse.json(
          {
            success: false,
            error: "A product with this SKU already exists",
          },
          { status: 409 }
        );
      }
    }

    const product = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        name,
        slug,
        description,
        categoryId,
        price,
        oldPrice,
        sku,
        stock,
        image,
        badge,
        isActive,
        isFeatured,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Product PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update product",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: ProductRouteContext
) {
  try {
    const { id } = await params;
    const productId = Number(id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid product ID",
        },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 }
      );
    }

    await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Product DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete product",
      },
      { status: 500 }
    );
  }
}