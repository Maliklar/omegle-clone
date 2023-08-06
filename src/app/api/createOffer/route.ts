import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { body } = await request.json();
  const prisma = new PrismaClient();
  await prisma.$connect();
  const offer = body.offer;
  if (!offer) throw Error("ERRORORORRO");

  const createdOffer = await prisma.callRequests.create({
    data: { offer },
  });
  async function sendOfferWaitForAnswer() {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        const answer = await prisma.callRequests.findUnique({
          where: {
            id: createdOffer.id,
          },
        });
        if (answer?.answer) {
          resolve(answer);
        } else {
          reject(-1);
        }
      }, 5000);
    });
  }

  try {
    const answer = await sendOfferWaitForAnswer();
    return NextResponse.json(answer);
  } catch {
    return NextResponse.json(
      {
        message: "NO ANSWERS FOR YOUR CALL",
      },
      {
        status: 404,
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
