'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import axios from 'axios'
import { Mail, Lock, User, Phone, Briefcase, CheckCircle } from 'lucide-react'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'WORKER' as 'CLIENT' | 'WORKER',
    phoneNumber: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await axios.post('/api/auth/signup', formData)

      if (response.status === 201) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            gap: '2rem',
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              src="/Earnify-Logo.png"
              alt="Earnify Logo"
              width={140}
              height={140}
              style={{ objectFit: 'contain' }}
            />
          </div>

          <div
            style={{
              width: '100%',
              maxWidth: '450px',
              background: 'white',
              borderRadius: '16px',
              border: '1px solid #e0e0e0',
              padding: '3rem',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}
            >
              <CheckCircle size={48} color="white" strokeWidth={2} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '0.75rem' }}>
              Account Created!
            </h2>
            <p style={{ color: '#666', fontSize: '1rem' }}>Redirecting to login page...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          gap: '2rem',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image src="/Earnify-Logo.png" alt="Earnify Logo" width={140} height={140} style={{ objectFit: 'contain' }} />
        </div>

        <div
          style={{
            width: '100%',
            maxWidth: '550px',
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #e0e0e0',
            padding: '3rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '0.5rem' }}>
              Create Account
            </h1>
            <p style={{ color: '#666', fontSize: '1rem' }}>Join Earnify and start your journey</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Role Selection */}
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
                I want to
              </label>
              <div style={{ position: 'relative' }}>
                <Briefcase
                  size={20}
                  color="#666"
                  style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
                />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem 0.875rem 3rem',
                    fontSize: '1rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '10px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    background: 'white',
                    cursor: 'pointer',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = '#063c7a'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 60, 122, 0.1)'
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = '#e0e0e0'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <option value="WORKER">Find Work (Service Provider)</option>
                  <option value="CLIENT">Hire Workers (Client)</option>
                </select>
              </div>
            </div>

            {/* Name Fields - Side by Side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#1a1a1a',
                  }}
                >
                  First Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={20}
                    color="#666"
                    style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="John"
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

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#1a1a1a',
                  }}
                >
                  Last Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={20}
                    color="#666"
                    style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Doe"
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
            </div>

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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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

            {/* Phone Field */}
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
                Phone Number <span style={{ color: '#999', fontWeight: '400' }}>(Optional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Phone
                  size={20}
                  color="#666"
                  style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+880XXXXXXXXXX"
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
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
              <small style={{ color: '#666', fontSize: '0.8125rem', marginTop: '0.25rem', display: 'block' }}>
                Minimum 6 characters
              </small>
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
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Sign In Link */}
          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#666' }}>
            Already have an account?{' '}
            <Link
              href="/login"
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
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
