import { notFound } from "next/navigation";
import { incrementViewCount } from "@/lib/db";

export default async function PastePage({
  params,
}: {
  params: { id: string };
}) {
  const paste = await incrementViewCount(params.id);
  if (!paste) {
    notFound();
  }

  // Check if paste has expired or exceeded view limit
  const now = Date.now();
  if (paste.ttlSeconds) {
    const expiresAt = paste.createdAt + paste.ttlSeconds * 1000;
    if (now >= expiresAt) {
      notFound();
    }
  }

  if (paste.maxViews !== undefined && paste.viewCount >= paste.maxViews) {
    notFound();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        padding: "16px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "#fff",
          borderRadius: "14px",
          padding: "clamp(20px, 5vw, 40px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <h1
            style={{
              fontSize: "clamp(28px, 6vw, 40px)",
              fontWeight: "700",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "8px",
            }}
          >
            📋 Paste View
          </h1>
        </div>

        {/* Paste Content */}
        <div
          style={{
            background: "#f7fafc",
            padding: "clamp(16px, 4vw, 24px)",
            borderRadius: "10px",
            border: "2px solid #e2e8f0",
            marginBottom: "24px",
          }}
        >
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              margin: 0,
              fontFamily: '"Courier New", monospace',
              fontSize: "clamp(13px, 2.5vw, 15px)",
              lineHeight: "1.6",
              color: "#2d3748",
            }}
          >
            {paste.content}
          </pre>
        </div>

        {/* Metadata */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginBottom: "24px",
            color: "#666",
            fontSize: "14px",
          }}
        >
          {paste.maxViews !== undefined && (
            <div
              style={{
                padding: "12px 16px",
                background: "#f7fafc",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              👁️ Views remaining:{" "}
              <strong>{paste.maxViews - paste.viewCount}</strong>
            </div>
          )}

          {paste.ttlSeconds && (
            <div
              style={{
                padding: "12px 16px",
                background: "#f7fafc",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              ⏱️ Expires at:{" "}
              <strong>
                {new Date(
                  paste.createdAt + paste.ttlSeconds * 1000,
                ).toLocaleString()}
              </strong>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div style={{ textAlign: "center" }}>
          <a
            href="/"
            style={{
              display: "inline-block",
              padding: "12px 32px",
              fontSize: "15px",
              fontWeight: "600",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
            }}
          >
            ← Create New Paste
          </a>
        </div>
      </div>
    </div>
  );
}
