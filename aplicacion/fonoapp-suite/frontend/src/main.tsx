import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Shell from './pages/Shell'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import PatientDetail from './pages/PatientDetail'
import Calendar from './pages/Calendar'
import Teletherapy from './pages/Teletherapy'
import Chat from './pages/Chat'

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    path: '/app',
    element: <Shell />,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'patients', element: <Patients /> },
      { path: 'patients/:id', element: <PatientDetail /> },
      { path: 'calendar', element: <Calendar /> },
      { path: 'teletherapy', element: <Teletherapy /> },
      { path: 'chat', element: <Chat /> }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><RouterProvider router={router} /></React.StrictMode>
)
