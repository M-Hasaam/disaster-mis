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
}

export default function StatCard({ title, value, icon, iconColor = 'blue', trend, suffix, description }: StatCardProps) {
    return (
        <div className="stat-card">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <p className="stat-label">{title}</p>
                    <div className="flex items-baseline gap-1.5 mt-2">
                        <span className="stat-value">{value}</span>
                        {suffix && <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{suffix}</span>}
                    </div>
                    {trend && (
                        <div className="flex items-center gap-1.5 mt-2.5">
                            <div className={`flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded ${trend.positive ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'}`}>
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d={trend.positive ? 'M5 10l7-7 7 7' : 'M19 14l-7 7-7-7'} />
                                </svg>
                                {trend.value}%
                            </div>
                            <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{trend.label}</span>
                        </div>
                    )}
                    {description && (
                        <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>{description}</p>
                    )}
                </div>
                <div className={`icon-box icon-box-${iconColor}`}>
                    {icon}
                </div>
            </div>
        </div>
    )
}
