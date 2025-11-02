import Link from 'next/link'

export default function Home() {
  return (
    <div className="container">
      <div className="card" style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Welcome to Next.js JWT Auth</h1>
        <p style={{ margin: '1rem 0', color: '#666', fontSize: '1.125rem' }}>
          A complete authentication system with JWT tokens
        </p>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/login" className="btn btn-primary">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="btn"
            style={{ background: '#fff', border: '2px solid #0070f3', color: '#0070f3' }}
          >
            Sign Up
          </Link>
        </div>

        <div
          style={{
            marginTop: '3rem',
            padding: '1.5rem',
            background: '#f9f9f9',
            borderRadius: '8px',
            textAlign: 'left',
          }}
        >
          <h3 style={{ marginBottom: '1rem' }}>Features:</h3>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.5rem' }}>
            <li>✅ User Registration & Login</li>
            <li>✅ JWT Access & Refresh Tokens</li>
            <li>✅ Automatic Token Refresh</li>
            <li>✅ Protected Routes</li>
            <li>✅ Clean & Modern UI</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
