import { NextRequest, NextResponse } from "next/server";
import { incrementViewCount } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = params;

  // Get current time from header in test mode
  let currentTime: number | undefined;
  if (process.env.TEST_MODE === "1") {
    const testNowMs = request.headers.get("x-test-now-ms");
    if (testNowMs) {
      currentTime = parseInt(testNowMs, 10);
    }
  }

  const paste = await incrementViewCount(id, currentTime);

  if (!paste) {
    return NextResponse.json(
      { error: "Paste not found or no longer available" },
      { status: 404 },
    );
  }

  // Calculate remaining views
  let remainingViews: number | null = null;
  if (paste.maxViews !== undefined) {
    remainingViews = paste.maxViews - paste.viewCount;
    if (remainingViews < 0) remainingViews = 0;
  }

  // Calculate expires_at
  let expiresAt: string | null = null;
  if (paste.ttlSeconds) {
    const expiryTime = paste.createdAt + paste.ttlSeconds * 1000;
    expiresAt = new Date(expiryTime).toISOString();
  }

  return NextResponse.json(
    {
      content: paste.content,
      remaining_views: remainingViews,
      expires_at: expiresAt,
    },
    { status: 200 },
  );
}
