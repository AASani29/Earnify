'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AuthNavbar from '@/components/AuthNavbar'
import { Star, MapPin, Briefcase, DollarSign, CheckCircle, Calendar, User as UserIcon, ArrowLeft } from 'lucide-react'

export default function WorkerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [worker, setWorker] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchWorkerProfile()
    fetchWorkerReviews()
  }, [params.id])

  const fetchWorkerProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/workers/${params.id}`)

      if (!response.ok) {
        throw new Error('Failed to fetch worker profile')
      }

      const data = await response.json()
      setWorker(data.worker)
    } catch (err: any) {
      console.error('Error fetching worker profile:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchWorkerReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?workerId=${params.id}`)

      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#ffffff' }}>
        <AuthNavbar />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>
          <p style={{ color: '#666' }}>Loading worker profile...</p>
        </div>
      </div>
    )
  }

  if (error || !worker) {
    return (
      <div style={{ minHeight: '100vh', background: '#ffffff' }}>
        <AuthNavbar />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>
          <p style={{ color: '#c33' }}>{error || 'Worker not found'}</p>
        </div>
      </div>
    )
  }

  const avgProfessionalism =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.professionalism || 0), 0) / reviews.filter(r => r.professionalism).length
      : 0
  const avgCommunication =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.communication || 0), 0) / reviews.filter(r => r.communication).length
      : 0
  const avgQuality =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + (r.quality || 0), 0) / reviews.filter(r => r.quality).length : 0
  const avgTimeliness =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.timeliness || 0), 0) / reviews.filter(r => r.timeliness).length
      : 0

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <AuthNavbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            color: '#063c7a',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            padding: '0.5rem',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#084d99'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#063c7a'
          }}
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Worker Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)',
            padding: '2.5rem',
            borderRadius: '16px',
            color: 'white',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                fontWeight: '700',
                color: '#063c7a',
              }}
            >
              {worker.firstName[0]}
              {worker.lastName[0]}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                {worker.firstName} {worker.lastName}
              </h1>
              {worker.bio && <p style={{ fontSize: '1.125rem', opacity: 0.9, marginBottom: '1rem' }}>{worker.bio}</p>}
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '1rem' }}>
                {worker.location?.city && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={18} />
                    <span>
                      {worker.location.city}
                      {worker.location.area && `, ${worker.location.area}`}
                    </span>
                  </div>
                )}
                {worker.hourlyRate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <DollarSign size={18} />
                    <span>৳{worker.hourlyRate}/hour</span>
                  </div>
                )}
                {worker.completedTasks > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={18} />
                    <span>{worker.completedTasks} tasks completed</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          {/* Left Column - Skills & Stats */}
          <div>
            {/* Rating Card */}
            {worker.rating?.count > 0 && (
              <div
                style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0',
                  marginBottom: '1.5rem',
                }}
              >
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1a1a1a' }}>
                  Overall Rating
                </h3>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '3rem', fontWeight: '700', color: '#063c7a' }}>
                    {worker.rating.average.toFixed(1)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        size={24}
                        fill={star <= Math.round(worker.rating.average) ? '#fbbf24' : 'none'}
                        color={star <= Math.round(worker.rating.average) ? '#fbbf24' : '#d1d5db'}
                        strokeWidth={2}
                      />
                    ))}
                  </div>
                  <div style={{ color: '#666', fontSize: '0.875rem' }}>{worker.rating.count} reviews</div>
                </div>

                {/* Detailed Ratings */}
                {reviews.length > 0 && (
                  <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '1rem' }}>
                    {avgProfessionalism > 0 && (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.875rem', color: '#666' }}>Professionalism</span>
                          <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{avgProfessionalism.toFixed(1)}</span>
                        </div>
                        <div style={{ height: '6px', background: '#e0e0e0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              background: '#063c7a',
                              width: `${(avgProfessionalism / 5) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {avgCommunication > 0 && (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.875rem', color: '#666' }}>Communication</span>
                          <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{avgCommunication.toFixed(1)}</span>
                        </div>
                        <div style={{ height: '6px', background: '#e0e0e0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              background: '#063c7a',
                              width: `${(avgCommunication / 5) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {avgQuality > 0 && (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.875rem', color: '#666' }}>Quality</span>
                          <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{avgQuality.toFixed(1)}</span>
                        </div>
                        <div style={{ height: '6px', background: '#e0e0e0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              background: '#063c7a',
                              width: `${(avgQuality / 5) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {avgTimeliness > 0 && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.875rem', color: '#666' }}>Timeliness</span>
                          <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{avgTimeliness.toFixed(1)}</span>
                        </div>
                        <div style={{ height: '6px', background: '#e0e0e0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              background: '#063c7a',
                              width: `${(avgTimeliness / 5) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Skills */}
            {worker.skills && worker.skills.length > 0 && (
              <div
                style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0',
                  marginBottom: '1.5rem',
                }}
              >
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1a1a1a' }}>Skills</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {worker.skills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      style={{
                        background: '#f0f4ff',
                        color: '#063c7a',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Reviews */}
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1a1a1a' }}>
              Reviews ({reviews.length})
            </h2>

            {reviews.length === 0 ? (
              <div
                style={{
                  background: 'white',
                  padding: '3rem',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0',
                  textAlign: 'center',
                }}
              >
                <Star size={48} color="#ccc" strokeWidth={2} style={{ margin: '0 auto 1rem' }} />
                <p style={{ color: '#666', fontSize: '1rem' }}>No reviews yet</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {reviews.map((review: any) => (
                  <div
                    key={review._id}
                    style={{
                      background: 'white',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    {/* Review Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <UserIcon size={16} color="#666" />
                          <span style={{ fontWeight: '600', color: '#1a1a1a' }}>
                            {review.clientId?.companyName || `${review.clientId?.firstName} ${review.clientId?.lastName}`}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              size={18}
                              fill={star <= review.rating ? '#fbbf24' : 'none'}
                              color={star <= review.rating ? '#fbbf24' : '#d1d5db'}
                              strokeWidth={2}
                            />
                          ))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', fontSize: '0.875rem' }}>
                        <Calendar size={14} />
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Task Info */}
                    {review.taskId && (
                      <div
                        style={{
                          background: '#f8f9fa',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          marginBottom: '1rem',
                          fontSize: '0.875rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666' }}>
                          <Briefcase size={14} />
                          <span style={{ fontWeight: '600', color: '#1a1a1a' }}>{review.taskId.title}</span>
                        </div>
                      </div>
                    )}

                    {/* Comment */}
                    {review.comment && (
                      <p style={{ color: '#374151', lineHeight: '1.6', marginBottom: '1rem' }}>"{review.comment}"</p>
                    )}

                    {/* Would Hire Again Badge */}
                    {review.wouldHireAgain && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          background: '#dcfce7',
                          color: '#16a34a',
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                        }}
                      >
                        <CheckCircle size={16} />
                        Would hire again
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

