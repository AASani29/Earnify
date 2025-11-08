'use client'

import { useState } from 'react'
import { Star, Send, Loader2 } from 'lucide-react'
import { useJWTAuthContext } from '@/config/Auth'

interface ReviewFormProps {
  taskId: string
  workerId: string
  workerName: string
  onSubmitSuccess?: () => void
  onCancel?: () => void
}

export default function ReviewForm({ taskId, workerId, workerName, onSubmitSuccess, onCancel }: ReviewFormProps) {
  const { controller } = useJWTAuthContext()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    professionalism: 5,
    communication: 5,
    quality: 5,
    timeliness: 5,
    wouldHireAgain: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const token = controller.getAccessToken()
      if (!token) {
        throw new Error('You must be logged in to submit a review')
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskId,
          workerId,
          ...formData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review')
      }

      if (onSubmitSuccess) {
        onSubmitSuccess()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const StarRating = ({
    value,
    onChange,
    label,
  }: {
    value: number
    onChange: (val: number) => void
    label: string
  }) => (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#1a1a1a' }}>{label}</label>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <Star
              size={32}
              fill={star <= value ? '#fbbf24' : 'none'}
              color={star <= value ? '#fbbf24' : '#d1d5db'}
              strokeWidth={2}
            />
          </button>
        ))}
        <span style={{ marginLeft: '1rem', color: '#666', fontSize: '1.125rem', fontWeight: '600' }}>{value}/5</span>
      </div>
    </div>
  )

  return (
    <div
      style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      }}
    >
      <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '0.5rem' }}>
        Review {workerName}
      </h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Share your experience working with this professional</p>

      {error && (
        <div
          style={{
            background: '#fee',
            border: '1px solid #fcc',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            color: '#c33',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Overall Rating */}
        <StarRating
          label="Overall Rating"
          value={formData.rating}
          onChange={val => setFormData({ ...formData, rating: val })}
        />

        {/* Detailed Ratings */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <StarRating
            label="Professionalism"
            value={formData.professionalism}
            onChange={val => setFormData({ ...formData, professionalism: val })}
          />
          <StarRating
            label="Communication"
            value={formData.communication}
            onChange={val => setFormData({ ...formData, communication: val })}
          />
          <StarRating
            label="Quality of Work"
            value={formData.quality}
            onChange={val => setFormData({ ...formData, quality: val })}
          />
          <StarRating
            label="Timeliness"
            value={formData.timeliness}
            onChange={val => setFormData({ ...formData, timeliness: val })}
          />
        </div>

        {/* Comment */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="comment"
            style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#1a1a1a' }}
          >
            Your Review
          </label>
          <textarea
            id="comment"
            value={formData.comment}
            onChange={e => setFormData({ ...formData, comment: e.target.value })}
            placeholder="Share details about your experience..."
            rows={5}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '1rem',
              fontFamily: 'inherit',
              resize: 'vertical',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = '#063c7a'
              e.currentTarget.style.outline = 'none'
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = '#e0e0e0'
            }}
          />
        </div>

        {/* Would Hire Again */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.wouldHireAgain}
              onChange={e => setFormData({ ...formData, wouldHireAgain: e.target.checked })}
              style={{
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                accentColor: '#063c7a',
              }}
            />
            <span style={{ fontSize: '1rem', color: '#1a1a1a', fontWeight: '500' }}>
              I would hire this worker again
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#f5f5f5',
                color: '#666',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                if (!submitting) {
                  e.currentTarget.style.background = '#e0e0e0'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#f5f5f5'
              }}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '0.75rem 2rem',
              background: submitting ? '#ccc' : '#063c7a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              if (!submitting) {
                e.currentTarget.style.background = '#084d99'
              }
            }}
            onMouseLeave={e => {
              if (!submitting) {
                e.currentTarget.style.background = '#063c7a'
              }
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Submitting...
              </>
            ) : (
              <>
                <Send size={20} />
                Submit Review
              </>
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
