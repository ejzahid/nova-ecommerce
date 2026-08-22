import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        {
          name: "asc",
        },
      ],
      include: {
        children: {
          where: {
            isActive: true,
          },
          orderBy: {
            name: "asc",
          },
          include: {
            children: {
              where: {
                isActive: true,
              },
              orderBy: {
                name: "asc",
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Categories GET error:", error);

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
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const subtitle =
      body.subtitle === undefined ||
      body.subtitle === null ||
      String(body.subtitle).trim() === ""
        ? null
        : String(body.subtitle).trim();

    const icon =
      body.icon === undefined ||
      body.icon === null ||
      String(body.icon).trim() === ""
        ? null
        : String(body.icon).trim();

    const parentId =
      body.parentId === undefined ||
      body.parentId === null ||
      String(body.parentId).trim() === ""
        ? null
        : Number(body.parentId);

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

    if (
      parentId !== null &&
      (!Number.isInteger(parentId) || parentId <= 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid parent category",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Check parent category
     */
    if (parentId !== null) {
      const parent = await prisma.category.findUnique({
        where: {
          id: parentId,
        },
      });

      if (!parent) {
        return NextResponse.json(
          {
            success: false,
            error: "Parent category not found",
          },
          {
            status: 404,
          }
        );
      }
    }

    /*
     * Prevent duplicate category name
     * under the same parent.
     */
    const existingCategory =
      await prisma.category.findFirst({
        where: {
          name: {
            equals: name,
            mode: "insensitive",
          },
          parentId,
        },
      });

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A category with this name already exists under the selected parent.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * Generate unique slug
     */
    const baseSlug = slugify(name);

    if (!baseSlug) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid category name",
        },
        {
          status: 400,
        }
      );
    }

    let slug = baseSlug;
    let counter = 1;

    while (
      await prisma.category.findUnique({
        where: {
          slug,
        },
      })
    ) {
      counter += 1;
      slug = `${baseSlug}-${counter}`;
    }

    /*
     * Create category.
     *
     * sortOrder is intentionally not used for
     * A-Z display. Frontend/API ordering uses name.
     */
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        subtitle,
        icon,
        parentId,
        isActive: true,
      },
      include: {
        children: true,
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
    console.error("Categories POST error:", error);

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