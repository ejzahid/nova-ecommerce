import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

function productInclude() {
  return {
    category: {
      select: {
        id: true,
        name: true,
        slug: true,
      },
    },
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const idParam = searchParams.get("id");
    const slug = searchParams.get("slug");
    const all = searchParams.get("all") === "true";

    if (idParam) {
      const id = Number(idParam);

      if (!Number.isInteger(id) || id <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid product ID",
          },
          { status: 400 }
        );
      }

      const product = await prisma.product.findUnique({
        where: { id },
        include: productInclude(),
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
    }

    if (slug) {
      const product = await prisma.product.findUnique({
        where: { slug },
        include: productInclude(),
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
    }

    const products = await prisma.product.findMany({
      where: all
        ? undefined
        : {
            isActive: true,
          },
      include: productInclude(),
      orderBy: [
        {
          isFeatured: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Products GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load products",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const slug = String(body.slug || "").trim();
    const description =
      body.description !== undefined &&
      body.description !== null &&
      String(body.description).trim()
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
      String(body.sku).trim()
        ? String(body.sku).trim()
        : null;

    const stock = Number(body.stock ?? 0);

    const image =
      body.image !== undefined &&
      body.image !== null &&
      String(body.image).trim()
        ? String(body.image).trim()
        : null;

    const badge =
      body.badge !== undefined &&
      body.badge !== null &&
      String(body.badge).trim()
        ? String(body.badge).trim()
        : null;

    const isFeatured = Boolean(body.isFeatured);

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

    if (!Number.isInteger(stock) || stock < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Stock must be a valid number",
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

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
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

    const existingSlug = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        {
          success: false,
          error: "A product with this slug already exists",
        },
        { status: 409 }
      );
    }

    if (sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku },
      });

      if (existingSku) {
        return NextResponse.json(
          {
            success: false,
            error: "A product with this SKU already exists",
          },
          { status: 409 }
        );
      }
    }

    const product = await prisma.product.create({
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
        isActive: true,
        isFeatured,
      },
      include: productInclude(),
    });

    return NextResponse.json(
      {
        success: true,
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Products POST error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create product",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid product ID is required",
        },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
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

    const name = String(body.name || "").trim();
    const slug = String(body.slug || "").trim();
    const categoryId = Number(body.categoryId);
    const price = Number(body.price);

    const oldPrice =
      body.oldPrice !== undefined &&
      body.oldPrice !== null &&
      body.oldPrice !== ""
        ? Number(body.oldPrice)
        : null;

    const stock = Number(body.stock ?? 0);

    const sku =
      body.sku !== undefined &&
      body.sku !== null &&
      String(body.sku).trim()
        ? String(body.sku).trim()
        : null;

    const description =
      body.description !== undefined &&
      body.description !== null &&
      String(body.description).trim()
        ? String(body.description).trim()
        : null;

    const image =
      body.image !== undefined &&
      body.image !== null &&
      String(body.image).trim()
        ? String(body.image).trim()
        : null;

    const badge =
      body.badge !== undefined &&
      body.badge !== null &&
      String(body.badge).trim()
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

    if (!name || !slug) {
      return NextResponse.json(
        {
          success: false,
          error: "Product name and slug are required",
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

    if (!Number.isInteger(stock) || stock < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Stock must be a valid number",
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

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
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

    const slugOwner = await prisma.product.findUnique({
      where: { slug },
    });

    if (slugOwner && slugOwner.id !== id) {
      return NextResponse.json(
        {
          success: false,
          error: "A product with this slug already exists",
        },
        { status: 409 }
      );
    }

    if (sku) {
      const skuOwner = await prisma.product.findUnique({
        where: { sku },
      });

      if (skuOwner && skuOwner.id !== id) {
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
      where: { id },
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
      include: productInclude(),
    });

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Products PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update product",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid product ID is required",
        },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id },
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

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Products DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete product",
      },
      { status: 500 }
    );
  }
}