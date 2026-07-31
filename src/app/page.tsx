export default function Home() {
  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>💡 Ideabank</h1>
      <p>Mindmap-powered idea management system.</p>
      <hr />
      <h2>Getting Started</h2>
      <ol>
        <li>Run <code>docker-compose up -d</code> to start PostgreSQL</li>
        <li>Run <code>cp .env.example .env.local</code></li>
        <li>Run <code>npm run db:push</code> to sync schema</li>
        <li>Run <code>npm run dev</code> to start</li>
      </ol>
      <h2>API Endpoints</h2>
      <ul>
        <li><code>GET /api/health</code> — Health check</li>
        <li><code>GET /api/ideas</code> — List ideas</li>
        <li><code>POST /api/ideas</code> — Create idea</li>
        <li><code>GET /api/mindmap</code> — Full mindmap graph</li>
      </ul>
    </main>
  )
}
