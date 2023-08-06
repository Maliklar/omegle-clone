import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const prisma = new PrismaClient();
  await prisma.$connect();
  const call = await prisma.callRequests.findFirst({
    where: {
      answer: null,
    },
  });

  await prisma.$disconnect();

  if (call) {
    return NextResponse.json(call, {
      status: 200,
    });
  }
  return NextResponse.json(
    {
      message: "No Available Calls",
    },
    {
      status: 404,
    }
  );
}
