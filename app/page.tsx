"use client";

import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [ttlSeconds, setTtlSeconds] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [pasteUrl, setPasteUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPasteUrl("");
    setLoading(true);
    setCopied(false);

    try {
      const body: any = { content };

      if (!ttlSeconds && !maxViews) {
        setError("Either Time To Live or Max Views is required.");
        setLoading(false);
        return;
      }

      if (ttlSeconds) {
        const ttl = parseInt(ttlSeconds, 10);
        if (isNaN(ttl) || ttl < 1) {
          setError("TTL must be a positive integer");
          setLoading(false);
          return;
        }
        body.ttl_seconds = ttl;
      }

      if (maxViews) {
        const views = parseInt(maxViews, 10);
        if (isNaN(views) || views < 1) {
          setError("Max views must be a positive integer");
          setLoading(false);
          return;
        }
        body.max_views = views;
      }

      const response = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create paste");
        setLoading(false);
        return;
      }

      setPasteUrl(data.url);
    } catch {
      setError("An error occurred while creating the paste");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pasteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        {/* ✅ Sticky Success Bar */}
        {pasteUrl && (
          <div
            style={{
              position: "sticky",
              top: "16px",
              zIndex: 50,
              marginBottom: "28px",
              padding: "12px 16px",
              background: "linear-gradient(135deg, #84fab0, #8fd3f4)",
              borderRadius: "10px",
              display: "flex",
              flexDirection: window.innerWidth < 640 ? "column" : "row",
              alignItems: window.innerWidth < 640 ? "stretch" : "center",
              gap: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            }}
          >
            <strong style={{ whiteSpace: "nowrap", fontSize: "14px" }}>
              ✅ Paste Created
            </strong>

            <input
              value={pasteUrl}
              readOnly
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid #ddd",
                fontFamily: "monospace",
                background: "#fff",
                fontSize: "13px",
                minWidth: 0,
              }}
            />

            <button
              onClick={handleCopy}
              style={{
                padding: "10px 16px",
                borderRadius: "6px",
                border: "none",
                background: copied ? "#48bb78" : "#2d3748",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontSize: "14px",
              }}
            >
              {copied ? "✓ Copied" : "📋 Copy"}
            </button>
          </div>
        )}

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
            📋 Pastebin Lite
          </h1>
          <p style={{ color: "#666", fontSize: "clamp(13px, 2.5vw, 16px)" }}>
            Create temporary pastes with expiry or view limits
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>📝 Paste Content *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="Paste your content here..."
              style={textareaStyle}
            />
            <small style={{ color: "#718096", fontSize: "12px" }}>
              Characters: {content.length}
            </small>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: window.innerWidth < 640 ? "1fr" : "1fr 1fr",
              gap: "20px",
              marginBottom: "28px",
            }}
          >
            <div>
              <label style={labelStyle}>⏱️ Time To Live (seconds)</label>
              <input
                type="number"
                min="1"
                value={ttlSeconds}
                onChange={(e) => setTtlSeconds(e.target.value)}
                placeholder="e.g. 3600"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>👁️ Max Views</label>
              <input
                type="number"
                min="1"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                placeholder="e.g. 10"
                style={inputStyle}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !content.trim()}
            style={{
              width: "100%",
              padding: "16px",
              fontSize: "clamp(14px, 2.5vw, 16px)",
              fontWeight: "600",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: loading || !content.trim() ? "not-allowed" : "pointer",
              background:
                loading || !content.trim()
                  ? "#cbd5e0"
                  : "linear-gradient(135deg, #667eea, #764ba2)",
              boxShadow:
                loading || !content.trim()
                  ? "none"
                  : "0 6px 20px rgba(102,126,234,0.4)",
            }}
          >
            {loading ? "⏳ Creating Paste..." : "🚀 Create Paste"}
          </button>
        </form>

        {error && (
          <div
            style={{
              marginTop: "24px",
              padding: "16px",
              background: "#fff5f5",
              border: "2px solid #fc8181",
              borderRadius: "8px",
              color: "#c53030",
              display: "flex",
              gap: "10px",
              alignItems: "center",
              fontSize: "14px",
              flexWrap: "wrap",
            }}
          >
            ⚠️ {error}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- shared styles ---------- */

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "600",
  color: "#333",
  fontSize: "14px",
};

const textareaStyle = {
  width: "100%",
  minHeight: "220px",
  padding: "16px",
  fontSize: "clamp(13px, 2.5vw, 15px)",
  borderRadius: "8px",
  border: "2px solid #e2e8f0",
  fontFamily: '"Courier New", monospace',
  boxSizing: "border-box" as const,
};

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  fontSize: "14px",
  borderRadius: "8px",
  border: "2px solid #e2e8f0",
  boxSizing: "border-box" as const,
};
