'use client'

import { useState } from 'react'
import type { ActivityItem } from '@/lib/types'

const TYPE_LABEL: Record<ActivityItem['type'], string> = {
  movie: 'Movie',
  tv_show: 'TV',
  video_game: 'Game',
  book: 'Book',
  post: 'Post',
}

interface Props {
  activity: ActivityItem[]
}

export default function ActivityPanel({ activity }: Props) {
  const [open, setOpen] = useState(false)

  if (activity.length === 0) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 10,
        pointerEvents: 'none',
      }}
    >
      {open && (
        <div
          style={{
            pointerEvents: 'auto',
            width: 320,
            maxHeight: '70vh',
            overflowY: 'auto',
            background: 'rgba(4, 9, 16, 0.94)',
            border: '1px solid rgba(120, 240, 200, 0.25)',
            borderRadius: 10,
            padding: '14px 14px 6px',
          }}
        >
          <div
            style={{
              fontFamily: "'Trajan Pro', 'Trajan', serif",
              fontSize: 13,
              color: 'rgba(220, 195, 110, 0.95)',
              letterSpacing: '0.05em',
              marginBottom: 10,
            }}
          >
            Recently Logged
          </div>
          {activity.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                gap: 10,
                marginBottom: 14,
                paddingBottom: 14,
                borderBottom: '1px solid rgba(168, 197, 232, 0.10)',
              }}
            >
              {item.posterUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.posterUrl}
                  alt=""
                  style={{
                    width: 46,
                    height: 68,
                    objectFit: 'cover',
                    borderRadius: 4,
                    flexShrink: 0,
                  }}
                />
              )}
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "'Trajan Pro', 'Trajan', serif",
                    fontSize: 12,
                    color: 'rgba(230, 240, 235, 0.95)',
                    marginBottom: 3,
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontFamily: 'Perpetua, Georgia, serif',
                    fontSize: 10.5,
                    color: 'rgba(100, 215, 175, 0.80)',
                    letterSpacing: '0.04em',
                    marginBottom: 4,
                  }}
                >
                  {TYPE_LABEL[item.type]}
                  {item.rating ? ` · ${item.rating}/10` : ''}
                  {item.status === 'in_progress' ? ' · in progress' : ''}
                </div>
                {item.review && (
                  <div
                    style={{
                      fontFamily: 'Perpetua, Georgia, serif',
                      fontSize: 10.5,
                      color: 'rgba(168, 197, 232, 0.65)',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.review}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          pointerEvents: 'auto',
          fontFamily: "'Trajan Pro', 'Trajan', serif",
          fontSize: 12,
          letterSpacing: '0.05em',
          color: 'rgba(220, 195, 110, 0.95)',
          background: 'rgba(4, 9, 16, 0.90)',
          border: '1px solid rgba(180, 160, 80, 0.45)',
          borderRadius: 20,
          padding: '9px 16px',
          cursor: 'pointer',
        }}
      >
        {open ? 'Close' : `Activity (${activity.length})`}
      </button>
    </div>
  )
}
