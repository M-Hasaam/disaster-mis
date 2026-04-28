'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

interface SidebarItemProps {
    href: string
    icon: React.ReactNode
    label: string
    badge?: string | number
    badgeColor?: string
}

function SidebarItem({ href, icon, label, badge, badgeColor = 'rose' }: SidebarItemProps) {
    const pathname = usePathname()
    const active = pathname === href || pathname.startsWith(href + '/')
    return (
        <Link href={href} className={`sidebar-item ${active ? 'active' : ''}`}>
            {icon}
            <span className="flex-1">{label}</span>
            {badge !== undefined && (
                <span className={`badge-${badgeColor} badge text-[9px] px-1.5 py-0 min-w-[18px] justify-center`} style={{ padding: '1px 5px' }}>
                    {badge}
                </span>
            )}
        </Link>
    )
}

const icons = {
    overview:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
    incidents:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75h.007v.008H12v-.008z"/></svg>,
    teams:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>,
    inventory:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/></svg>,
    finance:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/></svg>,
    approvals:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
    reports:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>,
    performance:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>,
    settings:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
    logout:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/></svg>,
    hospital:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819"/></svg>,
}

export default function Sidebar({ role }: { role: string }) {
    const isAdmin     = role === 'Administrator'
    const isOperator  = role === 'Emergency Operator'
    const isWarehouse = role === 'Warehouse Manager'
    const isFinance   = role === 'Finance Officer'
    const isField     = role === 'Field Officer'

    const homeHref = isAdmin ? '/admin' : isOperator ? '/operator' : isWarehouse ? '/warehouse' : isFinance ? '/finance' : '/field-officer'

    return (
        <aside className="sidebar">
            {/* Top accent line */}
            <div className="status-line" />

            {/* Logo */}
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248z" clipRule="evenodd"/>
                    </svg>
                </div>
                <div>
                    <div className="sidebar-logo-text">DISASTER MIS</div>
                    <div className="sidebar-logo-sub">CRISIS COMMAND</div>
                </div>
            </div>

            {/* Role badge */}
            <div style={{ padding: '0.625rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ background: 'var(--accent-blue-subtle)', border: '1px solid var(--border-accent)', borderRadius: 'var(--r-md)', padding: '0.375rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="live-dot pulse-dot" />
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--accent-blue-light)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{role}</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="sidebar-section-label">Overview</div>
                <SidebarItem href={homeHref} icon={icons.overview} label="Dashboard" />

                <div className="sidebar-section-label">Operations</div>
                {(isAdmin || isOperator) && (
                    <>
                        <SidebarItem href="/operator/incidents" icon={icons.incidents} label="Incidents" />
                        <SidebarItem href="/operator/hospitals" icon={icons.hospital} label="Hospitals" />
                    </>
                )}
                {(isAdmin || isWarehouse) && (
                    <SidebarItem href="/warehouse/inventory" icon={icons.inventory} label="Inventory" />
                )}
                {(isAdmin || isField) && (
                    <SidebarItem href="/field-officer/missions" icon={icons.teams} label="Missions" />
                )}
                {(isAdmin || isFinance) && (
                    <SidebarItem href="/finance/transactions" icon={icons.finance} label="Finance" />
                )}

                <div className="sidebar-section-label">System</div>
                {isAdmin && (
                    <>
                        <SidebarItem href="/admin/approvals" icon={icons.approvals} label="Approvals" />
                        <SidebarItem href="/admin/users" icon={icons.settings} label="User Management" />
                    </>
                )}
                <SidebarItem href="/reports" icon={icons.reports} label="Reports" />
                <SidebarItem href="/performance" icon={icons.performance} label="Performance" />
            </nav>

            <div className="sidebar-footer">
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="sidebar-item w-full bg-transparent border-none text-left"
                    style={{ width: '100%' }}
                >
                    {icons.logout}
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    )
}
