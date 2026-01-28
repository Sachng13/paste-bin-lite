import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface Paste {
  id: string;
  content: string;
  createdAt: number;
  ttlSeconds?: number;
  maxViews?: number;
  viewCount: number;
}

function getCurrentTime(): number {
  if (process.env.TEST_MODE === "1") {
    // In test mode, return a default time, will be overridden by request header
    return Date.now();
  }
  return Date.now();
}

export async function createPaste(
  content: string,
  ttlSeconds?: number,
  maxViews?: number,
): Promise<Paste> {
  const id = generateId();
  const now = getCurrentTime();

  const paste: Paste = {
    id,
    content,
    createdAt: now,
    ttlSeconds,
    maxViews,
    viewCount: 0,
  };

  // Store the paste in Redis
  await redis.set(`paste:${id}`, JSON.stringify(paste));

  // Set TTL expiry if specified (add buffer for view checks)
  if (ttlSeconds) {
    await redis.expire(`paste:${id}`, ttlSeconds + 60);
  }

  return paste;
}

export async function getPaste(
  id: string,
  currentTime?: number,
): Promise<Paste | null> {
  const data = await redis.get<string>(`paste:${id}`);

  if (!data) {
    return null;
  }

  const paste: any = data;
  const now = currentTime ?? getCurrentTime();

  // Check TTL expiry
  if (paste.ttlSeconds) {
    const expiresAt = paste.createdAt + paste.ttlSeconds * 1000;
    if (now >= expiresAt) {
      // Paste has expired
      await redis.del(`paste:${id}`);
      return null;
    }
  }

  // Check view count limit
  if (paste.maxViews !== undefined && paste.viewCount >= paste.maxViews) {
    // View limit exceeded
    await redis.del(`paste:${id}`);
    return null;
  }

  return paste;
}

export async function incrementViewCount(
  id: string,
  currentTime?: number,
): Promise<Paste | null> {
  const paste = await getPaste(id, currentTime);

  if (!paste) {
    return null;
  }

  // Increment view count
  paste.viewCount += 1;

  // Check if we've hit the limit
  if (paste.maxViews !== undefined && paste.viewCount >= paste.maxViews) {
    // This was the last allowed view, delete after returning
    await redis.del(`paste:${id}`);
    return paste;
  }

  // Update the paste with new view count
  await redis.set(`paste:${id}`, JSON.stringify(paste));

  return paste;
}

function generateId(): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

export async function healthCheck(): Promise<boolean> {
  try {
    // Try to perform a simple operation to check Redis connectivity
    await redis.set("health-check", Date.now());
    await redis.get("health-check");
    return true;
  } catch (error) {
    console.error("Health check failed:", error);
    return false;
  }
}
