'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useJWTAuthContext } from '@/config/Auth'

export default function LoginPage() {
  const { loginWithCredentials } = useJWTAuthContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await loginWithCredentials({ email, password })
      if (success) {
        router.push('/dashboard')
      } else {
        setError('Login failed')
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <h1 style={{ marginBottom: '1.5rem' }}>Login</h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
            <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ width: '100%' }}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          Don't have an account?{' '}
          <Link href="/signup" style={{ color: '#0070f3', textDecoration: 'none' }}>
            Sign Up
          </Link>
        </div>

        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#f0f0f0',
            borderRadius: '4px',
            fontSize: '0.875rem',
          }}
        >
          <strong>Test Credentials:</strong>
          <br />
          Admin: admin@example.com / admin123
          <br />
          Client: client@example.com / client123
          <br />
          Worker: worker@example.com / worker123
        </div>
      </div>
    </div>
  )
}
