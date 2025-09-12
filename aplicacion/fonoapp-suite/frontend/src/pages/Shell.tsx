import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { me } from '../lib/api'

export default function Shell(){
  const nav = useNavigate()
  const [user, setUser] = useState<any>(null)
  useEffect(()=>{ (async()=>{
    try{ setUser(await me()) } catch{ nav('/login') }
  })() },[])
  const logout = () => { localStorage.removeItem('token'); nav('/login') }
  return (
    <div className="min-h-screen">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="font-semibold">FonoApp Suite</div>
          <nav className="flex gap-4 text-sm">
            <NavLink to="/app/dashboard" className={({isActive})=> isActive?'text-blue-700':'text-gray-600'}>Dashboard</NavLink>
            <NavLink to="/app/patients" className={({isActive})=> isActive?'text-blue-700':'text-gray-600'}>Pacientes</NavLink>
            <NavLink to="/app/calendar" className={({isActive})=> isActive?'text-blue-700':'text-gray-600'}>Agenda</NavLink>
            <NavLink to="/app/teletherapy" className={({isActive})=> isActive?'text-blue-700':'text-gray-600'}>Teleterapia</NavLink>
            <NavLink to="/app/chat" className={({isActive})=> isActive?'text-blue-700':'text-gray-600'}>Chat</NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">{user?.full_name} · {user?.role}</div>
            <button className="btn btn-outline" onClick={logout}>Salir</button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4">
        <Outlet />
      </main>
    </div>
  )
}
