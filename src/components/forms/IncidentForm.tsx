'use client'
import React from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

type Form = { name: string; phone?: string; email?: string; location: string; disaster_type: string; severity: string }

export default function IncidentForm() {
    const { register, handleSubmit, reset } = useForm<Form>()

    async function onSubmit(data: Form) {
        try {
            const res = await fetch('/api/incidents', { method: 'POST', body: JSON.stringify({ citizen: { name: data.name, phone: data.phone, email: data.email }, location: data.location, disaster_type: data.disaster_type, severity: data.severity }), headers: { 'Content-Type': 'application/json' } })
            const json = await res.json()
            if (json.ok) {
                toast.success('Incident created')
                reset()
            } else {
                toast.error(json.error || 'Failed')
            }
        } catch (e) {
            toast.error('Network error')
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <input placeholder="Citizen name" className="w-full p-2 border rounded" {...register('name')} />
            <input placeholder="Phone" className="w-full p-2 border rounded" {...register('phone')} />
            <input placeholder="Email" className="w-full p-2 border rounded" {...register('email')} />
            <input placeholder="Location" className="w-full p-2 border rounded" {...register('location')} />
            <input placeholder="Disaster type" className="w-full p-2 border rounded" {...register('disaster_type')} />
            <select className="w-full p-2 border rounded" {...register('severity')}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
            </select>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded">Report</button>
        </form>
    )
}
