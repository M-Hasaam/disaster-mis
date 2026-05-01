'use client'
import React from 'react'

interface StatCardProps {
    title: string
    value: string | number
    icon: React.ReactNode
    iconColor?: 'blue' | 'emerald' | 'amber' | 'rose' | 'violet' | 'cyan' | 'orange'
    trend?: { value: number; label: string; positive?: boolean }
    suffix?: string
    description?: string
    sparkline?: number[]
}

const COLOR_RGB: Record<string, string> = {
    blue:    '59,130,246',
    emerald: '16,185,129',
    amber:   '245,158,11',
    rose:    '244,63,94',
    violet:  '139,92,246',
    cyan:    '6,182,212',
    orange:  '249,115,22',
}

const LABEL_COLOR: Record<string, string> = {
    blue:    '#60a5fa',
    emerald: '#34d399',
    amber:   '#fbbf24',
    rose:    '#fb7185',
    violet:  '#a78bfa',
    cyan:    '#22d3ee',
    orange:  '#fb923c',
}

function genSparkline(seed: string, len = 7): number[] {
    let h = 5381
    for (let i = 0; i < seed.length; i++) h = ((h << 5) + h) ^ seed.charCodeAt(i)
    return Array.from({ length: len }, () => {
        h = (Math.imul(1664525, h) + 1013904223) | 0
        return 15 + Math.abs(h % 85)
    })
}

export default function StatCard({ title, value, icon, iconColor = 'blue', trend, suffix, description, sparkline }: StatCardProps) {
    const rgb       = COLOR_RGB[iconColor] ?? COLOR_RGB.blue
    const labelClr  = LABEL_COLOR[iconColor] ?? LABEL_COLOR.blue
    const bars      = sparkline ?? genSparkline(title)
    const maxBar    = Math.max(...bars)

    return (
        <div
            className="stat-card"
            style={{
                '--card-shadow-color': `rgba(${rgb}, 0.28)`,
                background: `linear-gradient(145deg, rgba(${rgb}, 0.12) 0%, rgba(${rgb}, 0.04) 35%, var(--bg-card) 65%)`,
                borderLeft: `3px solid rgba(${rgb}, 0.75)`,
                borderTop: `1px solid rgba(${rgb}, 0.2)`,
                borderRight: '1px solid rgba(255,255,255,0.04)',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
            } as React.CSSProperties}
        >
            {/* Label + icon */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                <p style={{
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    color: labelClr,
                    textTransform: 'uppercase',
                    letterSpacing: '0.09em',
                    textShadow: `0 0 16px rgba(${rgb}, 0.5)`,
                }}>
                    {title}
                </p>
                <div
                    className={`icon-box icon-box-${iconColor}`}
                    style={{
                        width: 42, height: 42,
                        background: `rgba(${rgb}, 0.18)`,
                        border: `1px solid rgba(${rgb}, 0.4)`,
                        boxShadow: `0 0 20px rgba(${rgb}, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)`,
                    }}
                >
                    {icon}
                </div>
            </div>

            {/* Value */}
            <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                    <span style={{
                        fontSize: '2.5rem',
                        fontWeight: 800,
                        color: '#f0f4ff',
                        letterSpacing: '-0.05em',
                        lineHeight: 1,
                        fontVariantNumeric: 'tabular-nums',
                        textShadow: '0 2px 12px rgba(0,0,0,0.5)',
                    }}>
                        {value}
                    </span>
                    {suffix && (
                        <span style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '-0.02em' }}>{suffix}</span>
                    )}
                </div>

                {trend && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.55rem' }}>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                            fontSize: '0.6875rem', fontWeight: 800,
                            padding: '0.2rem 0.55rem', borderRadius: '5px',
                            color: trend.positive ? '#34d399' : '#fb7185',
                            background: trend.positive ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
                            border: `1px solid ${trend.positive ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.4)'}`,
                        }}>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d={trend.positive ? 'M5 10l7-7 7 7' : 'M19 14l-7 7-7-7'} />
                            </svg>
                            {trend.value}%
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>{trend.label}</span>
                    </div>
                )}

                {description && !trend && (
                    <p style={{ fontSize: '0.75rem', color: 'rgba(139,158,197,0.7)', marginTop: '0.4rem', lineHeight: 1.4 }}>{description}</p>
                )}
            </div>

            {/* Sparkline */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '2px',
                    height: '32px',
                    paddingTop: '0.625rem',
                    borderTop: `1px solid rgba(${rgb}, 0.12)`,
                    marginTop: '0.25rem',
                }}
            >
                {bars.map((h, i) => {
                    const isLast = i === bars.length - 1
                    return (
                        <div
                            key={i}
                            className="sparkline-bar"
                            style={{
                                flex: 1,
                                height: `${(h / maxBar) * 100}%`,
                                borderRadius: '2px 2px 0 0',
                                minHeight: '3px',
                                background: isLast
                                    ? `rgba(${rgb}, 0.95)`
                                    : `rgba(${rgb}, 0.2)`,
                                boxShadow: isLast ? `0 0 6px rgba(${rgb}, 0.5)` : 'none',
                                border: isLast
                                    ? `1px solid rgba(${rgb}, 0.6)`
                                    : `1px solid rgba(${rgb}, 0.07)`,
                                borderBottom: 'none',
                            }}
                        />
                    )
                })}
            </div>
        </div>
    )
}
