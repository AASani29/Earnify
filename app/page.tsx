'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import {
  Users,
  TrendingUp,
  Clock,
  FileText,
  Search,
  DollarSign,
  Edit3,
  UserCheck,
  CheckCircle,
  Truck,
  Sparkles,
  Headphones,
  Wrench,
  BookOpen,
  Camera,
  PenTool,
  Palette,
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'worker' | 'client'>('worker')

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 2rem', textAlign: 'center' }}>
        <h2
          style={{
            fontSize: '3.5rem',
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '1.5rem',
            lineHeight: '1.2',
          }}
        >
          Connect. Work. Earn.
        </h2>
        <p
          style={{
            fontSize: '1.25rem',
            color: '#666',
            marginBottom: '3rem',
            maxWidth: '700px',
            margin: '0 auto 3rem',
            lineHeight: '1.6',
          }}
        >
          Bangladesh's premier AI-powered labor marketplace connecting skilled workers with clients for gig economy
          opportunities
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => router.push('/signup')}
            style={{
              padding: '1rem 2.5rem',
              background: '#063c7a',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 14px rgba(6, 60, 122, 0.3)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(6, 60, 122, 0.4)'
              e.currentTarget.style.background = '#084d99'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(6, 60, 122, 0.3)'
              e.currentTarget.style.background = '#063c7a'
            }}
          >
            Join as Worker
          </button>
          <button
            onClick={() => router.push('/signup')}
            style={{
              padding: '1rem 2.5rem',
              background: 'white',
              border: '2px solid #063c7a',
              borderRadius: '10px',
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#063c7a',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#f0f4f8'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'white'
            }}
          >
            Post a Task
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section
        style={{
          background: '#fafafa',
          padding: '3rem 2rem',
          borderTop: '1px solid #f0f0f0',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '3rem',
            textAlign: 'center',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
              }}
            >
              <Users size={32} color="#063c7a" strokeWidth={2} />
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#063c7a' }}>1000+</div>
            </div>
            <div style={{ fontSize: '1rem', color: '#666' }}>Active Workers</div>
          </div>
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
              }}
            >
              <TrendingUp size={32} color="#063c7a" strokeWidth={2} />
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#063c7a' }}>500+</div>
            </div>
            <div style={{ fontSize: '1rem', color: '#666' }}>Tasks Completed</div>
          </div>
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
              }}
            >
              <CheckCircle size={32} color="#063c7a" strokeWidth={2} />
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#063c7a' }}>98%</div>
            </div>
            <div style={{ fontSize: '1rem', color: '#666' }}>Satisfaction Rate</div>
          </div>
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
              }}
            >
              <Clock size={32} color="#063c7a" strokeWidth={2} />
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#063c7a' }}>24/7</div>
            </div>
            <div style={{ fontSize: '1rem', color: '#666' }}>Support Available</div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 2rem' }}>
        <h3
          style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#1a1a1a',
            textAlign: 'center',
            marginBottom: '1rem',
          }}
        >
          How It Works
        </h3>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '4rem', fontSize: '1.125rem' }}>
          Simple steps to get started
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
          <button
            onClick={() => setActiveTab('worker')}
            style={{
              padding: '0.75rem 2rem',
              background: activeTab === 'worker' ? '#063c7a' : 'white',
              border: activeTab === 'worker' ? 'none' : '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              color: activeTab === 'worker' ? 'white' : '#666',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            For Workers
          </button>
          <button
            onClick={() => setActiveTab('client')}
            style={{
              padding: '0.75rem 2rem',
              background: activeTab === 'client' ? '#063c7a' : 'white',
              border: activeTab === 'client' ? 'none' : '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              color: activeTab === 'client' ? 'white' : '#666',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            For Clients
          </button>
        </div>

        {/* Steps */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}
        >
          {activeTab === 'worker' ? (
            <>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    background: '#f0f4ff',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                  }}
                >
                  <FileText size={36} color="#063c7a" strokeWidth={2} />
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.75rem' }}>
                  Create Profile
                </h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Sign up and showcase your skills, experience, and hourly rate
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    background: '#f0f4ff',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                  }}
                >
                  <Search size={36} color="#063c7a" strokeWidth={2} />
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.75rem' }}>
                  Browse Tasks
                </h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Find tasks that match your skills and apply with your proposal
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    background: '#f0f4ff',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                  }}
                >
                  <DollarSign size={36} color="#063c7a" strokeWidth={2} />
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.75rem' }}>
                  Get Paid
                </h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Complete the work and receive payment securely through our platform
                </p>
              </div>
            </>
          ) : (
            <>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    background: '#f0f4ff',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                  }}
                >
                  <Edit3 size={36} color="#063c7a" strokeWidth={2} />
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.75rem' }}>
                  Post a Task
                </h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Describe your task, set budget and deadline, and publish it
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    background: '#f0f4ff',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                  }}
                >
                  <UserCheck size={36} color="#063c7a" strokeWidth={2} />
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.75rem' }}>
                  Review Applications
                </h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Receive proposals from skilled workers and choose the best fit
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    background: '#f0f4ff',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                  }}
                >
                  <CheckCircle size={36} color="#063c7a" strokeWidth={2} />
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.75rem' }}>
                  Get It Done
                </h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Work with your chosen worker and mark the task as complete
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section
        style={{
          background: '#fafafa',
          padding: '5rem 2rem',
          borderTop: '1px solid #f0f0f0',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3
            style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#1a1a1a',
              textAlign: 'center',
              marginBottom: '1rem',
            }}
          >
            Popular Categories
          </h3>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '4rem', fontSize: '1.125rem' }}>
            Find work in various fields
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {[
              { icon: Truck, name: 'Delivery', desc: 'Package & food delivery' },
              { icon: Sparkles, name: 'Cleaning', desc: 'Home & office cleaning' },
              { icon: Headphones, name: 'Tech Support', desc: 'IT & technical help' },
              { icon: Wrench, name: 'Handyman', desc: 'Repairs & maintenance' },
              { icon: BookOpen, name: 'Tutoring', desc: 'Education & teaching' },
              { icon: Camera, name: 'Photography', desc: 'Photo & video services' },
              { icon: PenTool, name: 'Writing', desc: 'Content & copywriting' },
              { icon: Palette, name: 'Design', desc: 'Graphic & web design' },
            ].map((category, index) => {
              const IconComponent = category.icon
              return (
                <div
                  key={index}
                  style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px solid #e0e0e0',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#063c7a'
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e0e0e0'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div style={{ marginBottom: '1rem' }}>
                    <IconComponent size={48} color="#063c7a" strokeWidth={2} />
                  </div>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.5rem' }}>
                    {category.name}
                  </h4>
                  <p style={{ color: '#666', fontSize: '0.875rem' }}>{category.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 2rem', textAlign: 'center' }}>
        <h3
          style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '1rem',
          }}
        >
          Ready to Get Started?
        </h3>
        <p
          style={{
            fontSize: '1.125rem',
            color: '#666',
            marginBottom: '2.5rem',
            maxWidth: '600px',
            margin: '0 auto 2.5rem',
          }}
        >
          Join thousands of workers and clients already using Earnify to connect and grow
        </p>
        <button
          onClick={() => router.push('/signup')}
          style={{
            padding: '1rem 3rem',
            background: '#063c7a',
            border: 'none',
            borderRadius: '10px',
            fontSize: '1.125rem',
            fontWeight: '600',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 14px rgba(6, 60, 122, 0.3)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(6, 60, 122, 0.4)'
            e.currentTarget.style.background = '#084d99'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(6, 60, 122, 0.3)'
            e.currentTarget.style.background = '#063c7a'
          }}
        >
          Create Free Account
        </button>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: '#1a1a1a',
          color: 'white',
          padding: '3rem 2rem',
          borderTop: '1px solid #f0f0f0',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <img
              src="/Earnify-Logo.png"
              alt="Earnify"
              style={{ height: '35px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
            />
          </div>
          <p style={{ color: '#999', marginBottom: '2rem' }}>Bangladesh's premier labor marketplace</p>
          <div style={{ borderTop: '1px solid #333', paddingTop: '2rem' }}>
            <p style={{ color: '#666', fontSize: '0.875rem' }}>© 2024 Earnify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
