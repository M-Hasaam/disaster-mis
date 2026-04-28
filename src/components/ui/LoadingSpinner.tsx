'use client'
import React from 'react'

export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const dim = size === 'sm' ? 20 : size === 'lg' ? 48 : 32
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div
                className="loading-ring"
                style={{ width: dim, height: dim, borderWidth: size === 'sm' ? 2 : 2.5 }}
            />
        </div>
    )
}
