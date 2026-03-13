import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "../components/layout/AuthLayout";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import useAuth from "../hooks/useAuth";
import { signupApi } from "../api/auth.api";

// ─── Signup Page ────────────────────────────────────────
//
// Form: name, email, password, confirm password
// Validation: React Hook Form (client-side)
// On submit: POST /auth/signup → store token → redirect to /dashboard
// Error handling: API errors shown as toast or field-level messages

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // Watch password field for confirm password validation
  const password = watch("password");

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await signupApi({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      // Store in AuthContext + localStorage
      login(result.user, result.token);
      toast.success("Account created successfully!");
      navigate("/dashboard", { replace: true });
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
        <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Start planning your startup in minutes
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Full Name"
          placeholder="John Doe"
          error={errors.name?.message}
          {...register("name", {
            required: "Name is required",
            minLength: { value: 2, message: "Name must be at least 2 characters" },
            maxLength: { value: 50, message: "Name must be under 50 characters" },
          })}
        />

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
          placeholder="Min. 8 characters"
          error={errors.password?.message}
          {...register("password", {
            required: "Password is required",
            minLength: { value: 8, message: "Password must be at least 8 characters" },
            maxLength: { value: 100, message: "Password is too long" },
          })}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) =>
              value === password || "Passwords do not match",
          })}
        />

        <Button
          type="submit"
          loading={loading}
          className="w-full"
        >
          <UserPlus className="h-4 w-4" />
          Create Account
        </Button>
      </form>

      {/* Footer link */}
      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
