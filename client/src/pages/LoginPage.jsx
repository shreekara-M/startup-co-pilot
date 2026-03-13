import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogIn } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "../components/layout/AuthLayout";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import useAuth from "../hooks/useAuth";
import { loginApi } from "../api/auth.api";

// ─── Login Page ─────────────────────────────────────────
//
// Form: email, password
// On submit: POST /auth/login → store token → redirect
// Redirects to the page user originally wanted (via location.state.from)
// or defaults to /dashboard

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  // Where to redirect after login (saved by ProtectedRoute)
  const from = location.state?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await loginApi({
        email: data.email,
        password: data.password,
      });

      login(result.user, result.token);
      toast.success(`Welcome back, ${result.user.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to continue building your startup
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address",
            },
          })}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register("password", {
            required: "Password is required",
          })}
        />

        <Button
          type="submit"
          loading={loading}
          className="w-full"
        >
          <LogIn className="h-4 w-4" />
          Sign In
        </Button>
      </form>

      {/* Footer link */}
      <p className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
