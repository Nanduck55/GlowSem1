import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchUsers } from '../../api/services'
import { PageTitle, StatusBadge, Loading, cardCls, inputCls, btnGreen, formatDate } from './adminUi'

function StatCard({ label, value }) {
  return (
    <div className={`${cardCls} px-3 sm:px-5 py-3 sm:py-4`}>
      <p className="text-xs sm:text-lg lg:text-xl font-semibold leading-tight">{label}</p>
      <p className="mt-1 sm:mt-2 text-center text-3xl sm:text-5xl font-semibold">{value}</p>
    </div>
  )
}

export default function UsersList() {
  const navigate = useNavigate()
  const [users, setUsers] = useState(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch((e) => setError(e.response?.data?.error || 'Could not load users.'))
  }, [])

  const stats = useMemo(() => {
    const all = users ?? []
    const active = all.filter((u) => u.active).length
    return { total: all.length, active, deactivated: all.length - active }
  }, [users])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (users ?? []).filter((u) => {
      if (q && !`${u.name} ${u.email}`.toLowerCase().includes(q)) return false
      if (role && u.role !== role) return false
      if (status === 'active' && !u.active) return false
      if (status === 'deactivated' && u.active) return false
      return true
    })
  }, [users, search, role, status])

  return (
    <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[95rem]">
      <PageTitle sub="Manage registered GlowGuard Accounts">Users</PageTitle>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <StatCard label="Total Users" value={stats.total} />
        <StatCard label="Active Users" value={stats.active} />
        <StatCard label="Deactivated Users" value={stats.deactivated} />
      </div>

      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 mb-5 sm:mb-6">
        <input className={`${inputCls} col-span-2 sm:flex-1 sm:min-w-[200px] !py-2`} placeholder="Search Users"
               value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className={`${inputCls} sm:!w-auto !py-2`} value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Role</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <select className={`${inputCls} sm:!w-auto !py-2`} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Status</option>
          <option value="active">Active</option>
          <option value="deactivated">Deactivated</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {!users && !error && <Loading />}

      {users && (
        <div>
          {/* Column headings — hidden on phones, where each row becomes a card */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1.6fr_1.2fr_1fr] gap-3 px-4 pb-2 text-sm font-semibold">
            <span>Username</span><span>Role</span><span>Joined</span><span>Status</span><span />
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 -mr-1">
            {filtered.map((u) => (
              <div
                key={u.id}
                className={`${cardCls} px-4 py-3 text-sm
                  grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 items-center
                  md:grid-cols-[2fr_1fr_1.6fr_1.2fr_1fr] md:gap-3 xl:px-6 xl:gap-4`}
              >
                {/* name */}
                <span className="font-medium md:font-normal truncate">{u.name}</span>
                {/* status: top-right on phones */}
                <span className="justify-self-end md:order-4 md:justify-self-start"><StatusBadge active={u.active} /></span>
                {/* role + joined: second line on phones */}
                <span className="col-span-2 md:col-span-1 md:order-2 text-[#3d4a42] md:text-inherit">
                  <span className="capitalize">{u.role}</span>
                  <span className="md:hidden"> · Joined {formatDate(u.createdAt)}</span>
                </span>
                <span className="hidden md:block md:order-3">{formatDate(u.createdAt)}</span>
                <button
                  className={`${btnGreen} !py-1.5 !text-xs col-span-2 mt-2 md:mt-0 md:col-span-1 md:order-5`}
                  onClick={() => navigate(`/admin/users/${u.id}`)}
                >
                  View User
                </button>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-[#59645d] py-6 text-center">No users match your filters.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
