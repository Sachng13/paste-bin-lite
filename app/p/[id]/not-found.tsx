export default function NotFound() {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>404</h1>
      <p style={{ fontSize: '18px', color: '#666' }}>
        Paste not found or no longer available
      </p>
    </div>
  );
}
