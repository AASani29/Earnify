'use client'

import { useRouter } from 'next/navigation'

interface NavbarProps {
  showAuthButtons?: boolean
}

export default function Navbar({ showAuthButtons = true }: NavbarProps) {
  const router = useRouter()

  return (
    <nav
      style={{
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #f0f0f0',
        background: '#ffffff',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* Logo - Slightly to the right */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src="/Earnify-Logo.png"
          alt="Earnify"
          style={{
            height: '40px',
            width: 'auto',
            maxWidth: '150px',
            objectFit: 'contain',
            cursor: 'pointer',
          }}
          onClick={() => router.push('/')}
          onError={e => {
            console.error('Logo failed to load')
            e.currentTarget.style.display = 'none'
          }}
        />
      </div>

        
        {/* Auth Buttons - Slightly to the left */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          
        }}
      >
        {showAuthButtons && (
          <>
            <button
              onClick={() => router.push('/login')}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                color: '#1a1a1a',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#063c7a'
                e.currentTarget.style.color = '#063c7a'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#e0e0e0'
                e.currentTarget.style.color = '#1a1a1a'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/signup')}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#063c7a',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#084d99'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#063c7a'
              }}
            >
              Get Started
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
