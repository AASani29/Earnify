'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useJWTAuthContext } from '@/config/Auth'
import { LayoutDashboard, User, LogOut } from 'lucide-react'

export default function AuthNavbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout, isLoggedIn } = useJWTAuthContext()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  // Check if current page is dashboard or profile
  const isDashboardPage = pathname?.includes('/dashboard')
  const isProfilePage = pathname?.includes('/profile')

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
      {/* Logo */}
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

      {/* Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        {isLoggedIn === true && user ? (
          <>
            {/* Show Profile button if on Dashboard, Show Dashboard button if on Profile */}
            {isDashboardPage ? (
              <button
                onClick={() => router.push('/profile')}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                  border: '1px solid #e0e0e0',
                  borderRadius: '10px',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  color: '#063c7a',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)'
                  e.currentTarget.style.color = 'white'
                  e.currentTarget.style.borderColor = '#063c7a'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 60, 122, 0.2)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
                  e.currentTarget.style.color = '#063c7a'
                  e.currentTarget.style.borderColor = '#e0e0e0'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <User size={16} strokeWidth={2.5} />
                Profile
              </button>
            ) : isProfilePage ? (
              <button
                onClick={() => {
                  if (user.role === 'WORKER') {
                    router.push('/dashboard/worker')
                  } else if (user.role === 'CLIENT') {
                    router.push('/dashboard/client')
                  } else if (user.role === 'ADMIN') {
                    router.push('/dashboard/admin')
                  }
                }}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                  border: '1px solid #e0e0e0',
                  borderRadius: '10px',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  color: '#063c7a',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)'
                  e.currentTarget.style.color = 'white'
                  e.currentTarget.style.borderColor = '#063c7a'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 60, 122, 0.2)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
                  e.currentTarget.style.color = '#063c7a'
                  e.currentTarget.style.borderColor = '#e0e0e0'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <LayoutDashboard size={16} strokeWidth={2.5} />
                Dashboard
              </button>
            ) : (
              <>
                {/* Show both buttons on other pages */}
                <button
                  onClick={() => {
                    if (user.role === 'WORKER') {
                      router.push('/dashboard/worker')
                    } else if (user.role === 'CLIENT') {
                      router.push('/dashboard/client')
                    } else if (user.role === 'ADMIN') {
                      router.push('/dashboard/admin')
                    }
                  }}
                  style={{
                    padding: '0.625rem 1.25rem',
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                    border: '1px solid #e0e0e0',
                    borderRadius: '10px',
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    color: '#063c7a',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)'
                    e.currentTarget.style.color = 'white'
                    e.currentTarget.style.borderColor = '#063c7a'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 60, 122, 0.2)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
                    e.currentTarget.style.color = '#063c7a'
                    e.currentTarget.style.borderColor = '#e0e0e0'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <LayoutDashboard size={16} strokeWidth={2.5} />
                  Dashboard
                </button>
                <button
                  onClick={() => router.push('/profile')}
                  style={{
                    padding: '0.625rem 1.25rem',
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                    border: '1px solid #e0e0e0',
                    borderRadius: '10px',
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    color: '#063c7a',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)'
                    e.currentTarget.style.color = 'white'
                    e.currentTarget.style.borderColor = '#063c7a'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 60, 122, 0.2)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
                    e.currentTarget.style.color = '#063c7a'
                    e.currentTarget.style.borderColor = '#e0e0e0'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <User size={16} strokeWidth={2.5} />
                  Profile
                </button>
              </>
            )}

            {/* Logout Button - Primary Blue */}
            <button
              onClick={handleLogout}
              style={{
                padding: '0.625rem 1.25rem',
                background: 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.9375rem',
                fontWeight: '600',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 8px rgba(6, 60, 122, 0.2)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #084d99 0%, #0a5aad 100%)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 60, 122, 0.3)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(6, 60, 122, 0.2)'
              }}
            >
              <LogOut size={16} strokeWidth={2.5} />
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => router.push('/login')}
              style={{
                padding: '0.625rem 1.25rem',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                border: '1px solid #e0e0e0',
                borderRadius: '10px',
                fontSize: '0.9375rem',
                fontWeight: '600',
                color: '#063c7a',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)'
                e.currentTarget.style.color = 'white'
                e.currentTarget.style.borderColor = '#063c7a'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 60, 122, 0.2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
                e.currentTarget.style.color = '#063c7a'
                e.currentTarget.style.borderColor = '#e0e0e0'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/signup')}
              style={{
                padding: '0.625rem 1.25rem',
                background: 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.9375rem',
                fontWeight: '600',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 2px 8px rgba(6, 60, 122, 0.2)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #084d99 0%, #0a5aad 100%)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 60, 122, 0.3)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(6, 60, 122, 0.2)'
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
