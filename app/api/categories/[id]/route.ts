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
    const categoryId = Number(id);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid category ID",
        },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Category GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load category",
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
    const categoryId = Number(id);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid category ID",
        },
        { status: 400 }
      );
    }

    const existingCategory =
      await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found",
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const subtitle =
      typeof body.subtitle === "string"
        ? body.subtitle.trim()
        : null;

    const icon =
      typeof body.icon === "string"
        ? body.icon.trim()
        : null;

    const sortOrder =
      Number.isFinite(Number(body.sortOrder))
        ? Number(body.sortOrder)
        : existingCategory.sortOrder;

    const isActive =
      body.isActive === undefined
        ? existingCategory.isActive
        : Boolean(body.isActive);

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Category name is required",
        },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const duplicate =
      await prisma.category.findFirst({
        where: {
          OR: [
            { name },
            { slug },
          ],
          NOT: {
            id: categoryId,
          },
        },
      });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          error: "Category already exists",
        },
        { status: 409 }
      );
    }

    const category =
      await prisma.category.update({
        where: {
          id: categoryId,
        },
        data: {
          name,
          slug,
          subtitle,
          icon,
          sortOrder,
          isActive,
        },
      });

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Category PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update category",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const categoryId = Number(id);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid category ID",
        },
        { status: 400 }
      );
    }

    const category =
      await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found",
        },
        { status: 404 }
      );
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot delete a category that contains products. Move or delete the products first.",
        },
        { status: 409 }
      );
    }

    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Category DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete category",
      },
      { status: 500 }
    );
  }
}