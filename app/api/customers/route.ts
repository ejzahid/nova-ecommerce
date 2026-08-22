import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone")?.trim() || "";
    const search = searchParams.get("search")?.trim() || "";

    // Existing customer phone lookup
    if (phone) {
      const customer = await prisma.customer.findUnique({
        where: {
          phone,
        },
      });

      return NextResponse.json({
        success: true,
        customer,
      });
    }

    // Customer management list
    const customers = await prisma.customer.findMany({
      where: search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                phone: {
                  contains: search,
                },
              },
              {
                address: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : undefined,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            sales: true,
          },
        },
        sales: {
          select: {
            total: true,
          },
        },
      },
    });

    const result = customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      email: customer.email,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      totalSales: customer._count.sales,
      totalSpent: customer.sales.reduce(
        (sum, sale) => sum + Number(sale.total),
        0
      ),
    }));

    return NextResponse.json({
      success: true,
      customers: result,
    });
  } catch (error) {
    console.error("Customer API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load customers",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const id = Number(body.id);
    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const address = String(body.address ?? "").trim();
    const email = String(body.email ?? "").trim();

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid customer ID",
        },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer name is required",
        },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer phone is required",
        },
        { status: 400 }
      );
    }

    const existingCustomer = await prisma.customer.findUnique({
      where: {
        id,
      },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer not found",
        },
        { status: 404 }
      );
    }

    const phoneOwner = await prisma.customer.findUnique({
      where: {
        phone,
      },
    });

    if (phoneOwner && phoneOwner.id !== id) {
      return NextResponse.json(
        {
          success: false,
          error: "This phone number is already used by another customer",
        },
        { status: 409 }
      );
    }

    const customer = await prisma.customer.update({
      where: {
        id,
      },
      data: {
        name,
        phone,
        address: address || null,
        email: email || null,
      },
    });

    return NextResponse.json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("Customer update error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update customer",
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
          error: "Invalid customer ID",
        },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            sales: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer not found",
        },
        { status: 404 }
      );
    }

    if (customer._count.sales > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This customer cannot be deleted because they have existing sales.",
        },
        { status: 409 }
      );
    }

    await prisma.customer.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Customer delete error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete customer",
      },
      { status: 500 }
    );
  }
}