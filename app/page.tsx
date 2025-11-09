'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
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
  Shield,
  Zap,
  Award,
  Star,
  Brain,
  Lock,
  MessageCircle,
  ChevronDown,
  Quote,
  MapPin,
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'worker' | 'client'>('worker')
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out forwards;
        }

        .animate-slide-in-right {
          animation: slideInRight 0.8s ease-out forwards;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '6rem 2rem',
          textAlign: 'center',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 1s ease-out',
        }}
      >
        <div className="animate-fade-in-up">
          <h2
            style={{
              fontSize: '3.5rem',
              fontWeight: '700',
              color: '#1a1a1a',
              marginBottom: '1.5rem',
              lineHeight: '1.2',
              background: 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Connect. Work. Earn.
          </h2>
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
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
        </div>
        <div
          className="animate-fade-in-up"
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            animationDelay: '0.4s',
            opacity: 0,
          }}
        >
          <button
            onClick={() => router.push('/signup')}
            style={{
              padding: '1rem 2.5rem',
              background: 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 14px rgba(6, 60, 122, 0.3)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(6, 60, 122, 0.4)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(6, 60, 122, 0.3)'
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
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#063c7a'
              e.currentTarget.style.color = 'white'
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'white'
              e.currentTarget.style.color = '#063c7a'
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
            }}
          >
            Post a Task
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #fafafa 0%, #f0f4ff 100%)',
          padding: '4rem 2rem',
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
          {[
            { icon: Users, value: '1000+', label: 'Active Workers' },
            { icon: TrendingUp, value: '500+', label: 'Tasks Completed' },
            { icon: CheckCircle, value: '98%', label: 'Satisfaction Rate' },
            { icon: Clock, value: '24/7', label: 'Support Available' },
          ].map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div
                key={index}
                className="animate-fade-in-up"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  opacity: 0,
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  <IconComponent size={32} color="#063c7a" strokeWidth={2} className="animate-float" />
                  <div
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: '700',
                      background: 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {stat.value}
                  </div>
                </div>
                <div style={{ fontSize: '1rem', color: '#666', fontWeight: '500' }}>{stat.label}</div>
              </div>
            )
          })}
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
              background: activeTab === 'worker' ? 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)' : 'white',
              border: activeTab === 'worker' ? 'none' : '2px solid #e0e0e0',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: '600',
              color: activeTab === 'worker' ? 'white' : '#666',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: activeTab === 'worker' ? '0 4px 12px rgba(6, 60, 122, 0.3)' : 'none',
            }}
            onMouseEnter={e => {
              if (activeTab !== 'worker') {
                e.currentTarget.style.borderColor = '#063c7a'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }
            }}
            onMouseLeave={e => {
              if (activeTab !== 'worker') {
                e.currentTarget.style.borderColor = '#e0e0e0'
                e.currentTarget.style.transform = 'translateY(0)'
              }
            }}
          >
            For Workers
          </button>
          <button
            onClick={() => setActiveTab('client')}
            style={{
              padding: '0.75rem 2rem',
              background: activeTab === 'client' ? 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)' : 'white',
              border: activeTab === 'client' ? 'none' : '2px solid #e0e0e0',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: '600',
              color: activeTab === 'client' ? 'white' : '#666',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: activeTab === 'client' ? '0 4px 12px rgba(6, 60, 122, 0.3)' : 'none',
            }}
            onMouseEnter={e => {
              if (activeTab !== 'client') {
                e.currentTarget.style.borderColor = '#063c7a'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }
            }}
            onMouseLeave={e => {
              if (activeTab !== 'client') {
                e.currentTarget.style.borderColor = '#e0e0e0'
                e.currentTarget.style.transform = 'translateY(0)'
              }
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
              {[
                {
                  icon: FileText,
                  title: 'Create Profile',
                  desc: 'Sign up and showcase your skills, experience, and hourly rate',
                },
                {
                  icon: Search,
                  title: 'Browse Tasks',
                  desc: 'Find tasks that match your skills and apply with your proposal',
                },
                {
                  icon: DollarSign,
                  title: 'Get Paid',
                  desc: 'Complete the work and receive payment securely through our platform',
                },
              ].map((item, index) => {
                const IconComponent = item.icon
                return (
                  <div
                    key={index}
                    className="animate-slide-in-left"
                    style={{
                      textAlign: 'center',
                      padding: '2rem',
                      background: 'white',
                      borderRadius: '16px',
                      border: '1px solid #e0e0e0',
                      transition: 'all 0.3s',
                      animationDelay: `${index * 0.15}s`,
                      opacity: 0,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-8px)'
                      e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.1)'
                      e.currentTarget.style.borderColor = '#063c7a'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.borderColor = '#e0e0e0'
                    }}
                  >
                    <div
                      style={{
                        width: '90px',
                        height: '90px',
                        background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                      }}
                      className="animate-float"
                    >
                      <IconComponent size={40} color="#063c7a" strokeWidth={2} />
                    </div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.75rem' }}>
                      {item.title}
                    </h4>
                    <p style={{ color: '#666', lineHeight: '1.6' }}>{item.desc}</p>
                  </div>
                )
              })}
            </>
          ) : (
            <>
              {[
                {
                  icon: Edit3,
                  title: 'Post a Task',
                  desc: 'Describe your task, set budget and deadline, and publish it',
                },
                {
                  icon: UserCheck,
                  title: 'Review Applications',
                  desc: 'Receive proposals from skilled workers and choose the best fit',
                },
                {
                  icon: CheckCircle,
                  title: 'Get It Done',
                  desc: 'Work with your chosen worker and mark the task as complete',
                },
              ].map((item, index) => {
                const IconComponent = item.icon
                return (
                  <div
                    key={index}
                    className="animate-slide-in-right"
                    style={{
                      textAlign: 'center',
                      padding: '2rem',
                      background: 'white',
                      borderRadius: '16px',
                      border: '1px solid #e0e0e0',
                      transition: 'all 0.3s',
                      animationDelay: `${index * 0.15}s`,
                      opacity: 0,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-8px)'
                      e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.1)'
                      e.currentTarget.style.borderColor = '#063c7a'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.borderColor = '#e0e0e0'
                    }}
                  >
                    <div
                      style={{
                        width: '90px',
                        height: '90px',
                        background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                      }}
                      className="animate-float"
                    >
                      <IconComponent size={40} color="#063c7a" strokeWidth={2} />
                    </div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.75rem' }}>
                      {item.title}
                    </h4>
                    <p style={{ color: '#666', lineHeight: '1.6' }}>{item.desc}</p>
                  </div>
                )
              })}
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
              { icon: Truck, name: 'Delivery', desc: 'Package & food delivery', color: '#10b981' },
              { icon: Sparkles, name: 'Cleaning', desc: 'Home & office cleaning', color: '#f59e0b' },
              { icon: Headphones, name: 'Tech Support', desc: 'IT & technical help', color: '#3b82f6' },
              { icon: Wrench, name: 'Handyman', desc: 'Repairs & maintenance', color: '#ef4444' },
              { icon: BookOpen, name: 'Tutoring', desc: 'Education & teaching', color: '#8b5cf6' },
              { icon: Camera, name: 'Photography', desc: 'Photo & video services', color: '#ec4899' },
              { icon: PenTool, name: 'Writing', desc: 'Content & copywriting', color: '#06b6d4' },
              { icon: Palette, name: 'Design', desc: 'Graphic & web design', color: '#f97316' },
            ].map((category, index) => {
              const IconComponent = category.icon
              return (
                <div
                  key={index}
                  className="animate-fade-in-up"
                  style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '16px',
                    border: '1px solid #e0e0e0',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    animationDelay: `${index * 0.05}s`,
                    opacity: 0,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = category.color
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e0e0e0'
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      background: `${category.color}15`,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.5rem',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = category.color
                      const icon = e.currentTarget.querySelector('svg')
                      if (icon) {
                        icon.style.color = 'white'
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = `${category.color}15`
                      const icon = e.currentTarget.querySelector('svg')
                      if (icon) {
                        icon.style.color = category.color
                      }
                    }}
                  >
                    <IconComponent
                      size={40}
                      color={category.color}
                      strokeWidth={2}
                      style={{ transition: 'all 0.3s' }}
                    />
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

      {/* AI-Powered Features Section */}
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
          Powered by AI
        </h3>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '4rem', fontSize: '1.125rem' }}>
          Smart technology that makes finding work easier
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
          }}
        >
          {[
            {
              icon: Brain,
              title: 'Smart Matching',
              desc: 'AI algorithms match workers with tasks based on skills, location, and availability',
              gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            },
            {
              icon: Zap,
              title: 'Instant Recommendations',
              desc: 'Get personalized task recommendations tailored to your profile and preferences',
              gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            },
            {
              icon: Shield,
              title: 'Fraud Detection',
              desc: 'Advanced AI monitors transactions and profiles to ensure platform safety',
              gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            },
          ].map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div
                key={index}
                className="animate-fade-in-up"
                style={{
                  background: 'white',
                  padding: '2.5rem',
                  borderRadius: '16px',
                  border: '1px solid #e0e0e0',
                  transition: 'all 0.3s',
                  animationDelay: `${index * 0.1}s`,
                  opacity: 0,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)'
                  e.currentTarget.style.borderColor = '#063c7a'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = '#e0e0e0'
                }}
              >
                <div
                  style={{
                    width: '70px',
                    height: '70px',
                    background: feature.gradient,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                  }}
                  className="animate-float"
                >
                  <IconComponent size={36} color="white" strokeWidth={2} />
                </div>
                <h4 style={{ fontSize: '1.375rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.75rem' }}>
                  {feature.title}
                </h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>{feature.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)',
          padding: '5rem 2rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative Elements */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '50%',
            filter: 'blur(40px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-50px',
            left: '-50px',
            width: '250px',
            height: '250px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '50%',
            filter: 'blur(40px)',
          }}
        />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <div
              style={{
                display: 'inline-block',
                padding: '0.5rem 1.25rem',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '50px',
                marginBottom: '1.5rem',
                backdropFilter: 'blur(10px)',
              }}
            >
              <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: '600', letterSpacing: '1px' }}>
                TESTIMONIALS
              </span>
            </div>
          </div>
          <h3
            style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: 'white',
              textAlign: 'center',
              marginBottom: '1rem',
            }}
          >
            What Our Users Say
          </h3>
          <p
            style={{ textAlign: 'center', color: 'rgba(255,255,255,0.9)', marginBottom: '4rem', fontSize: '1.125rem' }}
          >
            Join thousands of satisfied workers and clients
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '2rem',
            }}
          >
            {[
              {
                name: 'Rahul Ahmed',
                role: 'Freelance Developer',
                location: 'Dhaka',
                rating: 5,
                text: 'Earnify helped me find consistent work and build my reputation. The AI recommendations are spot-on!',
                avatar: 'RA',
                color: '#10b981',
              },
              {
                name: 'Fatima Khan',
                role: 'Small Business Owner',
                location: 'Chittagong',
                rating: 5,
                text: 'Finding reliable workers was always a challenge. Earnify made it simple and secure. Highly recommended!',
                avatar: 'FK',
                color: '#f59e0b',
              },
              {
                name: 'Karim Hassan',
                role: 'Delivery Professional',
                location: 'Sylhet',
                rating: 5,
                text: 'I love the flexibility and the variety of tasks available. Payment is always on time and secure.',
                avatar: 'KH',
                color: '#3b82f6',
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="animate-fade-in-up"
                style={{
                  background: 'white',
                  padding: '2.5rem',
                  borderRadius: '20px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                  transition: 'all 0.4s',
                  animationDelay: `${index * 0.15}s`,
                  opacity: 0,
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-10px)'
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.3)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.2)'
                }}
              >
                {/* Quote Icon */}
                <div
                  style={{
                    position: 'absolute',
                    top: '1.5rem',
                    right: '1.5rem',
                    width: '50px',
                    height: '50px',
                    background: `${testimonial.color}15`,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Quote size={24} color={testimonial.color} strokeWidth={2} />
                </div>

                {/* Rating */}
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem' }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={18} fill="#fbbf24" color="#fbbf24" strokeWidth={2} />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p
                  style={{
                    color: '#333',
                    fontSize: '1.0625rem',
                    lineHeight: '1.7',
                    marginBottom: '2rem',
                    fontStyle: 'italic',
                  }}
                >
                  "{testimonial.text}"
                </p>

                {/* User Info */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    borderTop: '1px solid #f0f0f0',
                    paddingTop: '1.5rem',
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      background: `linear-gradient(135deg, ${testimonial.color} 0%, ${testimonial.color}dd 100%)`,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '1.125rem',
                      flexShrink: 0,
                    }}
                  >
                    {testimonial.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ fontWeight: '600', color: '#1a1a1a', marginBottom: '0.25rem', fontSize: '1.0625rem' }}
                    >
                      {testimonial.name}
                    </div>
                    <div
                      style={{
                        fontSize: '0.875rem',
                        color: '#666',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span>{testimonial.role}</span>
                      <span style={{ color: '#d0d0d0' }}>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={14} color="#666" />
                        {testimonial.location}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
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
          Your Safety is Our Priority
        </h3>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '4rem', fontSize: '1.125rem' }}>
          Built with security and trust at the core
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2.5rem',
          }}
        >
          {[
            {
              icon: Lock,
              title: 'Secure Payments',
              desc: 'All transactions are encrypted and protected with industry-standard security',
            },
            {
              icon: Award,
              title: 'Rating System',
              desc: 'Transparent reviews and ratings help you make informed decisions',
            },
            {
              icon: MessageCircle,
              title: '24/7 Support',
              desc: 'Our dedicated support team is always here to help you',
            },
          ].map((item, index) => {
            const IconComponent = item.icon
            return (
              <div
                key={index}
                className="animate-fade-in-up"
                style={{
                  textAlign: 'center',
                  padding: '2rem',
                  animationDelay: `${index * 0.1}s`,
                  opacity: 0,
                }}
              >
                <div
                  style={{
                    width: '90px',
                    height: '90px',
                    background: 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    boxShadow: '0 8px 20px rgba(6, 60, 122, 0.25)',
                  }}
                  className="animate-float"
                >
                  <IconComponent size={42} color="white" strokeWidth={2} />
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.75rem' }}>
                  {item.title}
                </h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>{item.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)',
          padding: '5rem 2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h3
            style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: 'white',
              marginBottom: '1rem',
            }}
          >
            Ready to Get Started?
          </h3>
          <p
            style={{
              fontSize: '1.125rem',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '2.5rem',
              lineHeight: '1.6',
            }}
          >
            Join thousands of workers and clients already using Earnify to connect and grow
          </p>
          <button
            onClick={() => router.push('/signup')}
            style={{
              padding: '1rem 3rem',
              background: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#063c7a',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.2)'
            }}
          >
            Create Free Account
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          padding: '5rem 2rem',
          borderTop: '1px solid #e0e0e0',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h3
              style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#1a1a1a',
                marginBottom: '1rem',
              }}
            >
              Frequently Asked Questions
            </h3>
            <p style={{ color: '#666', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
              Find answers to common questions about using Earnify
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {[
              {
                question: 'How do I get started on Earnify?',
                answer:
                  'Simply sign up for a free account, complete your profile, and start browsing tasks (for workers) or posting tasks (for clients). The entire process takes less than 5 minutes.',
                category: 'Getting Started',
              },
              {
                question: 'How does payment work?',
                answer:
                  'Clients fund tasks upfront, and payments are held securely until the work is completed and approved. Workers receive payment directly to their account within 24-48 hours of task completion.',
                category: 'Payments',
              },
              {
                question: 'What fees does Earnify charge?',
                answer:
                  'Earnify charges a small service fee on completed transactions. Workers pay 10% on earnings, while clients pay a 5% processing fee. There are no hidden charges or subscription fees.',
                category: 'Pricing',
              },
              {
                question: 'How are workers verified?',
                answer:
                  'All workers go through identity verification and can build their reputation through our rating system. We also use AI-powered fraud detection to ensure platform safety.',
                category: 'Safety',
              },
              {
                question: 'What if I have a dispute?',
                answer:
                  'Our support team is available 24/7 to help resolve any disputes. We have a fair resolution process that protects both workers and clients.',
                category: 'Support',
              },
              {
                question: 'Can I work from anywhere in Bangladesh?',
                answer:
                  'Yes! Earnify connects workers and clients across all of Bangladesh. You can filter tasks by location to find opportunities near you.',
                category: 'General',
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="animate-fade-in-up"
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: activeFaq === index ? '2px solid #063c7a' : '2px solid transparent',
                  boxShadow: activeFaq === index ? '0 8px 24px rgba(6, 60, 122, 0.15)' : '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'all 0.3s',
                  animationDelay: `${index * 0.05}s`,
                  opacity: 0,
                }}
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  style={{
                    width: '100%',
                    padding: '1.75rem 2rem',
                    background: activeFaq === index ? 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)' : 'white',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={e => {
                    if (activeFaq !== index) {
                      e.currentTarget.style.background = '#fafafa'
                    }
                  }}
                  onMouseLeave={e => {
                    if (activeFaq !== index) {
                      e.currentTarget.style.background = 'white'
                    }
                  }}
                >
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      background: 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      alignSelf: 'flex-start',
                    }}
                  >
                    {faq.category}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <span
                      style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#1a1a1a',
                        lineHeight: '1.5',
                      }}
                    >
                      {faq.question}
                    </span>
                    <div
                      style={{
                        minWidth: '32px',
                        height: '32px',
                        background: activeFaq === index ? '#063c7a' : '#f0f0f0',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s',
                      }}
                    >
                      <ChevronDown
                        size={20}
                        color={activeFaq === index ? 'white' : '#666'}
                        strokeWidth={2.5}
                        style={{
                          transform: activeFaq === index ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s',
                        }}
                      />
                    </div>
                  </div>
                </button>
                <div
                  style={{
                    maxHeight: activeFaq === index ? '300px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.4s ease-out',
                  }}
                >
                  <div
                    style={{
                      padding: '0 2rem 2rem',
                      color: '#555',
                      lineHeight: '1.7',
                      fontSize: '1rem',
                      borderTop: '1px solid #f0f0f0',
                      paddingTop: '1.5rem',
                    }}
                  >
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Support CTA */}
          <div
            style={{
              marginTop: '4rem',
              textAlign: 'center',
              padding: '2.5rem',
              background: 'white',
              borderRadius: '16px',
              border: '2px solid #e0e0e0',
            }}
          >
            <MessageCircle size={48} color="#063c7a" strokeWidth={2} style={{ marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.75rem' }}>
              Still have questions?
            </h4>
            <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '1rem' }}>
              Our support team is available 24/7 to help you with any questions or concerns
            </p>
            <button
              onClick={() => router.push('/contact')}
              style={{
                padding: '0.875rem 2rem',
                background: 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: '600',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(6, 60, 122, 0.3)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(6, 60, 122, 0.4)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 60, 122, 0.3)'
              }}
            >
              Contact Support
            </button>
          </div>
        </div>
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
