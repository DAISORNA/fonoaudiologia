import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '../lib/api'
import { Link, useNavigate } from 'react-router-dom'

const schema = z.object({
  full_name: z.string().min(3, 'Mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  passwordConfirm: z.string().min(6, 'Repite la contraseña'),
  role: z.enum(['admin','therapist','assistant','patient'])
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Las contraseñas no coinciden',
  path: ['passwordConfirm'],
})

type FormData = z.infer<typeof schema>

function getErrorMessage(err: any) {
  // FastAPI: detail puede ser string o una lista de errores 422
  const d = err?.response?.data?.detail
  if (Array.isArray(d)) {
    return d.map((e: any) => e?.msg ?? JSON.stringify(e)).join(', ')
  }
  if (typeof d === 'string') return d
  if (err?.message) return err.message
  return 'No se pudo completar el registro.'
}

export default function Register() {
  const nav = useNavigate()
  const [status, setStatus] = useState<{type: 'success' | 'error' | null, msg: string}>({type: null, msg: ''})
  const [showPwd, setShowPwd] = useState(false)
  const [showPwd2, setShowPwd2] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema), mode: 'onTouched' })

  const onSubmit = async (data: FormData) => {
    const { passwordConfirm, ...payload } = data
    setStatus({ type: null, msg: '' })
    try {
      const res = await api.post('/auth/register', payload)
      if (res.status !== 201) throw new Error('El servidor no confirmó la creación')
      setStatus({ type: 'success', msg: 'Cuenta creada correctamente. Iniciando sesión…' })

      const login = await api.post('/auth/login', { email: payload.email, password: payload.password })
      localStorage.setItem('token', login.data.access_token)
      nav('/app/dashboard')
    } catch (err) {
      setStatus({ type: 'error', msg: getErrorMessage(err) })
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-md p-10">
          <h1 className="text-4xl font-bold mb-4">Crea tu cuenta</h1>
          <p className="text-blue-100">Selecciona tu rol y empieza a trabajar.</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md card p-8">
          <h2 className="text-2xl font-semibold mb-6">Registro</h2>

          {status.type && (
            <div className={`mb-4 rounded-lg p-3 text-sm ${
              status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {status.msg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
            <div>
              <label>Nombre completo</label>
              <input className="input mt-1" {...register('full_name')} autoComplete="name" />
              {errors.full_name && <p className="text-red-600 text-sm mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label>Email</label>
              <input className="input mt-1" type="email" {...register('email')} autoComplete="email" />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label>Contraseña</label>
              <div className="flex gap-2">
                <input
                  className="input mt-1 flex-1"
                  type={showPwd ? 'text' : 'password'}
                  {...register('password')}
                  autoComplete="new-password"
                />
                <button type="button" className="btn mt-1" onClick={() => setShowPwd(v => !v)}>
                  {showPwd ? 'Ocultar' : 'Ver'}
                </button>
              </div>
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label>Repite la contraseña</label>
              <div className="flex gap-2">
                <input
                  className="input mt-1 flex-1"
                  type={showPwd2 ? 'text' : 'password'}
                  {...register('passwordConfirm')}
                  autoComplete="new-password"
                />
                <button type="button" className="btn mt-1" onClick={() => setShowPwd2(v => !v)}>
                  {showPwd2 ? 'Ocultar' : 'Ver'}
                </button>
              </div>
              {errors.passwordConfirm && <p className="text-red-600 text-sm mt-1">{errors.passwordConfirm.message}</p>}
            </div>

            <div>
              <label>Rol</label>
              <select className="input mt-1" {...register('role')}>
                <option value="therapist">Terapeuta</option>
                <option value="assistant">Asistente</option>
                <option value="admin">Administrador</option>
                <option value="patient">Paciente</option>
              </select>
              {errors.role && <p className="text-red-600 text-sm mt-1">{errors.role.message}</p>}
            </div>

            <button disabled={isSubmitting} className="btn btn-primary w-full mt-2">
              {isSubmitting ? 'Creando…' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-6">
            ¿Ya tienes cuenta? <Link to="/login" className="text-blue-700 hover:underline">Iniciar sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
