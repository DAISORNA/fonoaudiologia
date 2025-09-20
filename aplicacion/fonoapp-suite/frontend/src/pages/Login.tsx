// frontend/src/pages/Login.tsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { login as loginApi } from "../lib/api";
import { Link, useNavigate } from "react-router-dom";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(4, "Mínimo 4 caracteres"),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const nav = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const res = await loginApi(data.email, data.password);
    localStorage.setItem("token", res.access_token);
    nav("/app/dashboard");
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-md p-10">
          <h1 className="text-4xl font-bold mb-4">FonoApp Suite</h1>
          <p className="text-blue-100">Plataforma integral para fonoaudiología.</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md card p-8">
          <h2 className="text-2xl font-semibold mb-6">Iniciar sesión</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label>Email</label>
              <input className="input mt-1" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label>Contraseña</label>
              <input className="input mt-1" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
            <button disabled={isSubmitting} className="btn btn-primary w-full mt-2">
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>
          <p className="text-sm text-gray-600 mt-6">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-blue-700 hover:underline">
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
