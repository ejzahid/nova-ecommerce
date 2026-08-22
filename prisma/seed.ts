import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const categories = [
  {
    name: "Camera",
    children: [
      "Action Camera",
      "Camera Accessories",
      "IP Camera",
      "Webcam",
    ],
  },
  {
    name: "Computer & Office",
    children: [
      "Attendance Machine",
      "Batteries",
      "Calculator",
      "Card Readers",
      "Cleaners",
      "Desk Lamp",
      "Hub",
      "Keyboard",
      "Laptop",
      "Laptop Charger",
      "Monitor",
      "Mouse",
      "OTG Converter",
      "Pen Drive & Flash Drive",
      "Projector",
      "Router",
      "Mini UPS",
      "WiFi Router",
      "WiFi Repeater",
      "ONU",
      "Staplers & Punchers",
      "Telephone Set",
      "Thermal Printer",
      "Webcam",
      "Gaming Chair",
      "Scanner",
      "Laptop Stands",
    ],
  },
  {
    name: "Consumer Electronics",
    children: [
      "Electric Heaters",
      "Humidifiers",
      "Plugs & Sockets",
      "Power Source",
      "Remote Controls",
      "Televisions & TV",
      "TV Boxes",
    ],
  },
  {
    name: "Kitchen & Home Appliances",
    children: [
      "Blender, Mixer & Grinder",
      "Coffee Machine",
      "Electric Kettle",
      "Electric Kettles & Thermo Pots",
      "Fryer",
      "Induction Cookers",
      "Irons & Garment Steamers",
      "Juicers",
      "Pressure Cookers",
      "Rechargeable Fan",
      "Handheld Air Cooler",
      "Rechargeable Rice Cooker",
      "Sandwich Makers",
      "Sewing Machines",
      "Toasters",
    ],
  },
  {
    name: "Lifestyle",
    children: [
      "Eye Mask",
      "Hair Dryer",
      "Hair Straightener",
      "Luggage & Bags",
      "Mosquito Killers",
      "Thermometers",
      "Toothbrush",
      "Trimmers",
    ],
  },
  {
    name: "Mobile Accessories",
    children: [
      "Bluetooth Speaker",
      "Cables & Converters",
      "Camera Lens",
      "Chargers & Adapters",
      "Cover & Glass",
      "Earphone Cases",
      "Phone Glass",
      "iPad Cases",
      "Earphones & Headphones",
      "Earphones",
      "Headphones",
      "Neckband",
      "TWS Earbuds",
      "Memory Card",
      "Mobile Holder & Mounts",
      "Phone Bag",
      "Phone Cover",
      "Power Bank",
      "Screen Protector",
      "Selfie Stick & Monopods",
      "Speaker",
      "Bluetooth & Wireless Speaker",
      "Wired Speaker",
      "Smart Speaker",
      "Stylus Pen",
      "Tablet Cases",
      "Headphone Stand",
    ],
  },
  {
    name: "Phones & Tablets",
    children: [
      "Smartphone",
      "Used Phone",
      "Tablets",
    ],
  },
  {
    name: "Watches Collection",
    children: [
      "Clock",
      "Digital Watch",
      "Smart Band",
      "Smartwatch",
      "Watch Strap",
    ],
  },
  {
    name: "YouTube Accessories",
    children: [
      "Gimbal Collection",
      "LED Video Light",
      "Microphone",
      "Ring Light",
      "Soft Box",
      "Tripod & Stand",
    ],
  },
  {
    name: "Others",
    children: [
      "Backpack & Luggages",
      "Car Accessories",
      "Car Camera",
      "Car Charger",
      "Car Mounts",
      "Screwdrivers",
      "Light & Lighting",
    ],
  },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("Starting category seed...\n");

  for (const parentData of categories) {
    const parentSlug = slugify(parentData.name);

    const parentCategory = await prisma.category.upsert({
      where: {
        slug: parentSlug,
      },
      update: {
        name: parentData.name,
        isActive: true,
      },
      create: {
        name: parentData.name,
        slug: parentSlug,
        isActive: true,
        sortOrder: 0,
      },
    });

    console.log(`✓ ${parentCategory.name}`);

    for (const childName of parentData.children) {
      const childSlug = slugify(
        `${parentData.name}-${childName}`
      );

      await prisma.category.upsert({
        where: {
          slug: childSlug,
        },
        update: {
          name: childName,
          parentId: parentCategory.id,
          isActive: true,
        },
        create: {
          name: childName,
          slug: childSlug,
          parentId: parentCategory.id,
          isActive: true,
          sortOrder: 0,
        },
      });
    }
  }

  /*
   * Parent categories A → Z
   */
  const parents = await prisma.category.findMany({
    where: {
      parentId: null,
    },
    orderBy: {
      name: "asc",
    },
  });

  for (let index = 0; index < parents.length; index++) {
    await prisma.category.update({
      where: {
        id: parents[index].id,
      },
      data: {
        sortOrder: index + 1,
      },
    });
  }

  /*
   * Child categories A → Z
   * Their sort order starts again inside each parent.
   */
  for (const parent of parents) {
    const children = await prisma.category.findMany({
      where: {
        parentId: parent.id,
      },
      orderBy: {
        name: "asc",
      },
    });

    for (let index = 0; index < children.length; index++) {
      await prisma.category.update({
        where: {
          id: children[index].id,
        },
        data: {
          sortOrder: index + 1,
        },
      });
    }
  }

  const totalCategories = await prisma.category.count();

  console.log(
    `\nCreated/updated ${totalCategories} categories successfully.`
  );

  console.log("\nCategory structure:");

  const categoryParents = await prisma.category.findMany({
    where: {
      parentId: null,
    },
    include: {
      children: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  for (const parent of categoryParents) {
    console.log(`\n${parent.name}`);

    const children = [...parent.children].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    for (const child of children) {
      console.log(`  └─ ${child.name}`);
    }
  }

  console.log("\nSeed completed successfully.");
}

main()
  .catch((error) => {
    console.error("\nSeed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });