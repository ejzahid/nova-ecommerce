import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
        },
      ],
    });

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("GET /api/categories error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load categories",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

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
        : 0;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Category name is required",
        },
        {
          status: 400,
        }
      );
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [
          {
            name,
          },
          {
            slug,
          },
        ],
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: "Category already exists",
        },
        {
          status: 409,
        }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        subtitle,
        icon,
        sortOrder,
      },
    });

    return NextResponse.json(
      {
        success: true,
        category,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("POST /api/categories error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create category",
      },
      {
        status: 500,
      }
    );
  }
}