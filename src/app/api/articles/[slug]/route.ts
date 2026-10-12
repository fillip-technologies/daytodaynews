import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        topic: true,
        author: { select: { id: true, name: true, bio: true, avatar: true } },
      },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: "Article not found" },
        { status: 404 }
      );
    }

    // Increment view count
    prisma.article
      .update({
        where: { slug },
        data: { viewsCount: { increment: 1 } },
      })
      .catch(() => {});

    return NextResponse.json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error("GET /api/articles/[slug] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve article" },
      { status: 500 }
    );
  }
}
