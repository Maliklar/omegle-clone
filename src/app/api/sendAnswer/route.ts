import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { body } = await request.json();
  const prisma = new PrismaClient();
  await prisma.$connect();

  const call = await prisma.callRequests.update({
    data: {
      answer: JSON.stringify(body.answer),
    },
    where: {
      id: body.id,
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
