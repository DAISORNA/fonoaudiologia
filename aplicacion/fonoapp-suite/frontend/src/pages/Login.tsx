// frontend/src/pages/Login.tsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(4, "Mínimo 4 caracteres"),
});
type FormData = z.infer<typeof schema>;

function getErrorMessage(err: any) {
  const d = err?.response?.data?.detail;
  if (Array.isArray(d)) return d.map((e: any) => e?.msg ?? JSON.stringify(e)).join(", ");
  if (typeof d === "string") return d;
  if (err?.message) return err.message;
  return "No se pudo iniciar sesión.";
}

export default function Login() {
  const nav = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema), mode: "onTouched" });

  const onSubmit = async (data: FormData) => {
    try {
      // /auth/login espera OAuth2PasswordRequestForm
      const form = new URLSearchParams();
      form.append("username", data.email);
      form.append("password", data.password);

      const res = await api.post("/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      localStorage.setItem("token", res.data.access_token);
      nav("/app/dashboard");
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Panel con imagen de fondo */}
      <div className="hidden md:flex items-center justify-center text-white relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/img/fono.png')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
        <div className="relative max-w-md p-10">
          <h1 className="text-4xl font-bold mb-4">FonoApp Suite</h1>
          <p className="text-blue-100">Plataforma integral para fonoaudiología.</p>
        </div>
      </div>

      {/* Panel con formulario */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md card p-8">
          <h2 className="text-2xl font-semibold mb-6">Iniciar sesión</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input mt-1"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email")}
              />
              {errors.email && (
                <p id="email-error" className="text-red-600 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                className="input mt-1"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                {...register("password")}
              />
              {errors.password && (
                <p id="password-error" className="text-red-600 text-sm mt-1">
                  {errors.password.message}
                </p>
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
