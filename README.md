# Pastebin Lite Live on -- https://paste-bin-lite-chi.vercel.app/

A simple pastebin application that allows users to create text pastes and share them via URLs. Pastes can optionally expire after a certain time or number of views.

## Features

- Create text pastes with optional constraints
- Time-based expiry (TTL)
- View-count limits
- Shareable URLs
- Clean, simple UI

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Persistence**: Upstash Redis
- **Deployment**: Vercel

## Persistence Layer

This application uses **Upstash Redis** as its persistence layer. Upstash Redis is a serverless Redis database that provides:

- Durable storage across serverless function invocations
- Fast read/write operations
- Automatic scaling
- Built-in TTL support for automatic expiration
- REST API for easy integration

The choice of Upstash Redis was made because:

1. It works with any deployment platform (Vercel, Netlify, Railway, etc.)
2. It provides persistent storage that survives across function invocations
3. It has native TTL support which aligns with our paste expiry requirements
4. It's simple to set up and requires no manual database migrations
5. Free tier available with generous limits

## Running Locally

### Prerequisites

- Node.js 18+ installed
- An Upstash account (free tier available at https://console.upstash.com)

### Setup

1. Clone the repository:

   ```bash
   git clone <your-repo-url>
   cd pastebin-lite
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up Upstash Redis:
   - Go to https://console.upstash.com
   - Create a new Redis database (choose the region closest to you)
   - Click on your database
   - Scroll down to "REST API" section
   - Copy the `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

   Create a `.env.local` file in the project root:

   ```
   UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Deploy to Vercel (or any platform)

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Import your repository in Vercel (or your preferred platform)

3. Add environment variables in your deployment platform:
   - `UPSTASH_REDIS_REST_URL` (from your Upstash dashboard)
   - `UPSTASH_REDIS_REST_TOKEN` (from your Upstash dashboard)

4. Deploy!

**Using Vercel CLI:**

```bash
vercel
# Add environment variables when prompted
```

**Works with any platform:** This app can be deployed to Vercel, Netlify, Railway, Render, or any Node.js hosting platform.

## API Documentation

### Health Check

```
GET /api/healthz
```

Returns `200` with `{ "ok": true }` if the service is healthy.

### Create Paste

```
POST /api/pastes
Content-Type: application/json

{
  "content": "Your paste content",
  "ttl_seconds": 3600,    // optional
  "max_views": 10         // optional
}
```

Returns:

```json
{
  "id": "abc123",
  "url": "https://your-app.vercel.app/p/abc123"
}
```

### Get Paste (API)

```
GET /api/pastes/:id
```

Returns:

```json
{
  "content": "Your paste content",
  "remaining_views": 9,
  "expires_at": "2026-01-29T00:00:00.000Z"
}
```

### View Paste (HTML)

```
GET /p/:id
```

Returns HTML page with the paste content, or 404 if unavailable.

## Design Decisions

1. **Next.js App Router**: Used the modern App Router for better performance and simpler routing.

2. **Vercel KV for Persistence**: Chosen for its serverless-friendly design and built-in TTL support.

3. **View Count Tracking**: View counts are incremented on API access to ensure accurate tracking. The HTML view page does a read-only check.

4. **ID Generation**: Simple 8-character alphanumeric IDs provide good uniqueness without external dependencies.

5. **Test Mode**: Implemented support for deterministic time testing via `TEST_MODE` environment variable and `x-test-now-ms` header.

6. **Error Handling**: All errors return appropriate HTTP status codes with JSON error messages.

7. **XSS Prevention**: Paste content is rendered in a `<pre>` tag with proper escaping to prevent script execution.

## Testing

The application supports automated testing through:

- `TEST_MODE=1` environment variable enables deterministic time testing
- `x-test-now-ms` header allows setting a specific timestamp for expiry tests

## License

MIT
