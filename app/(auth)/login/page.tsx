'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useJWTAuthContext } from '@/config/Auth'
import Navbar from '@/components/Navbar'
import { LogIn, Mail, Lock, Info } from 'lucide-react'

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
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <Navbar showAuthButtons={false} />

      <div
        style={{
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '450px',
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #e0e0e0',
            padding: '3rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}
            >
              <LogIn size={32} color="white" strokeWidth={2} />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '0.5rem' }}>
              Welcome Back
            </h1>
            <p style={{ color: '#666', fontSize: '1rem' }}>Sign in to your Earnify account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#1a1a1a',
                }}
              >
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={20}
                  color="#666"
                  style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem 0.875rem 3rem',
                    fontSize: '1rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '10px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = '#063c7a'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 60, 122, 0.1)'
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = '#e0e0e0'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#1a1a1a',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={20}
                  color="#666"
                  style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem 0.875rem 3rem',
                    fontSize: '1rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '10px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = '#063c7a'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 60, 122, 0.1)'
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = '#e0e0e0'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  padding: '0.875rem',
                  background: '#fee',
                  border: '1px solid #fcc',
                  borderRadius: '8px',
                  color: '#c33',
                  fontSize: '0.875rem',
                  marginBottom: '1.5rem',
                }}
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '1rem',
                background: isLoading ? '#999' : '#063c7a',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: '600',
                color: 'white',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 14px rgba(6, 60, 122, 0.3)',
              }}
              onMouseEnter={e => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#084d99'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(6, 60, 122, 0.4)'
                }
              }}
              onMouseLeave={e => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#063c7a'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(6, 60, 122, 0.3)'
                }
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#666' }}>
            Don't have an account?{' '}
            <Link
              href="/signup"
              style={{
                color: '#063c7a',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#084d99'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = '#063c7a'
              }}
            >
              Sign Up
            </Link>
          </div>

          {/* Test Credentials */}
          <div
            style={{
              marginTop: '2rem',
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '10px',
              border: '1px solid #e0e0e0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Info size={16} color="#063c7a" />
              <strong style={{ fontSize: '0.875rem', color: '#1a1a1a' }}>Test Credentials</strong>
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#666', lineHeight: '1.6' }}>
              <div>
                <strong>Admin:</strong> admin@example.com / admin123
              </div>
              <div>
                <strong>Client:</strong> client@example.com / client123
              </div>
              <div>
                <strong>Worker:</strong> worker@example.com / worker123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
