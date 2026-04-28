import { mssql } from '../lib/db'

export interface Role {
    role_id: number
    role_name: string
    description?: string
}

export interface UserRow {
    user_id: number
    name: string
    email: string
    password_hash: string
    phone?: string
    role_id: number
    is_active: boolean
    created_at: string
}

export interface Citizen {
    citizen_id: number
    name: string
    phone?: string
    address?: string
    email?: string
}

export interface EmergencyReport {
    report_id: number
    citizen_id: number
    location: string
    disaster_type: string
    severity: string
    report_time: string
    status: string
}

export interface RescueTeam {
    team_id: number
    team_name: string
    team_type: string
    current_location?: string
    status: string
    equipment?: string
}

export type DBParamType = typeof mssql.VarChar

export type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string }

export function isRole(role: any, roleName: string): boolean {
    return role === roleName
}
