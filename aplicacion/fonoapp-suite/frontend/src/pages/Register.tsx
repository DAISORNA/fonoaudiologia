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

export default function Register() {
  const nav = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    // No enviar passwordConfirm a la API
    const { passwordConfirm, ...payload } = data
    await api.post('/auth/register', payload)
    const res = await api.post('/auth/login', { email: payload.email, password: payload.password })
    localStorage.setItem('token', res.data.access_token)
    nav('/app/dashboard')
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
              <input className="input mt-1" type="password" {...register('password')} autoComplete="new-password" />
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label>Repite la contraseña</label>
              <input className="input mt-1" type="password" {...register('passwordConfirm')} autoComplete="new-password" />
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
              {isSubmitting ? 'Creando...' : 'Crear cuenta'}
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
