"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Eye, EyeOff, Check, User, Phone, LockIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginUser, registerUser, SignUpData } from "@/app/_actions/auth";
import { LoadingButton } from "@/components/ui/loading-button";
import { notify } from "@/lib/utils";
import CustomAlert from "@/components/ui/custom-alert";

export default function LoginPage() {
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("signin");

  return (
    <div className="w-full max-w-md space-y-8 animate-fade-in">
      {/* Logo */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
            <Mail className="w-4 h-4 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">e-nvite</span>
        </div>
      </div>

      {/* Welcome Text */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          {activeTab === "signin" ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-gray-500">
          {activeTab === "signin"
            ? "Welcome Back, Please enter Your details"
            : "Join thousands of event organizers today"}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-100 rounded-2xl p-1">
        <button
          className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-300 ${
            activeTab === "signin"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("signin")}
        >
          Sign In
        </button>
        <button
          className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-300 ${
            activeTab === "signup"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("signup")}
        >
          Sign Up
        </button>
      </div>

      {/* Forms Container with Sliding Animation */}
      <div className="relative overflow-clip rounded-2xl px-2">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform:
              activeTab === "signin" ? "translateX(0%)" : "translateX(-100%)",
          }}
        >
          {/* Sign In Form */}
          <div className="w-full flex-shrink-0 space-y-6">
            <LoginForm error={error} setError={setError} />
          </div>

          {/* Sign Up Form */}
          <div className="w-full flex-shrink-0 space-y-6">
            <SignupForm error={error} setError={setError} />
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <CustomAlert className="rounded-2xl" message={error} type="error" />
      )}

      {/* Divider - Only show for Sign In */}
      {activeTab === "signin" && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Or Continue With
              </span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="flex justify-center space-x-4">
            <Button
              className="w-12 h-12 rounded-full border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-transparent"
              size="icon"
              variant="outline"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="currentColor"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="currentColor"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="currentColor"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="currentColor"
                />
              </svg>
            </Button>
            <Button
              className="w-12 h-12 rounded-full border-gray-200 hover:border-gray-300 hover:bg-opacity-80 bg-black text-white hover:bg-gray-800"
              size="icon"
              variant="outline"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
            </Button>
            <Button
              className="w-12 h-12 rounded-full border-gray-200 hover:border-gray-300 hover:bg-opacity-80 bg-blue-600 text-white hover:bg-blue-700"
              size="icon"
              variant="outline"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </Button>
          </div>
        </>
      )}

      {/* Bottom Text */}
      <div className="text-center text-sm text-gray-500 leading-relaxed">
        {activeTab === "signin"
          ? "Welcome back! Access your events, track RSVPs, and send invites in seconds."
          : "Join e-nvite in seconds. Create stunning invites, track guests, and celebrate stress-free!"}
      </div>

      {/* Back to Home */}
      <div className="text-center">
        <Link
          className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          href="/"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}

function LoginForm({
  error,
  setError,
}: {
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  function updateFormData(fields: Partial<typeof formData>) {
    setFormData((prevData) => ({
      ...prevData,
      ...fields,
    }));
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const result = await loginUser(formData);

      if (result.success) {
        router.push("/");
      } else {
        notify({
          title: "Error",
          description: result.message,
          type: "error",
        });
        setError(result.message || "An error occurred. Please try again.");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleLogin}>
      {/* Email Field */}
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            required
            className="pl-12 pr-12 h-14 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            disabled={isLoading}
            id="login-email"
            label="Email Address"
            name="email"
            placeholder="Enter your email"
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
          />
          {formData.email && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <Check className="h-5 w-5 text-green-500" />
            </div>
          )}
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <div className="relative">
          <Input
            required
            className="pr-12 h-14 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            disabled={isLoading}
            id="login-password"
            label="Password"
            name="password"
            placeholder="Enter your password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => updateFormData({ password: e.target.value })}
          />
          <button
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Continue Button */}
      <LoadingButton
        className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
        disabled={isLoading}
        isLoading={isLoading}
        loadingText="  Signing in...
                    </>"
        type="submit"
      >
        Continue
      </LoadingButton>
    </form>
  );
}

function SignupForm({
  error,
  setError,
}: {
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [formData, setFormData] = useState<SignUpData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
  });

  function updateFormData(fields: Partial<SignUpData>) {
    setFormData((prevData) => ({
      ...prevData,
      ...fields,
    }));
  }

  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await registerUser(formData);

      if (result.success) {
        router.push("/login");
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSignup}>
      {/* Full Name Field */}
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            required
            className="pl-12 pr-12 h-14 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            disabled={isLoading}
            id="signup-name"
            label="Full Name"
            name="name"
            placeholder="Enter your full name"
            type="text"
            value={formData.first_name}
            onChange={(e) => updateFormData({ first_name: e.target.value })}
          />
          {formData.first_name && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <Check className="h-5 w-5 text-green-500" />
            </div>
          )}
        </div>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            required
            className="pl-12 pr-12 h-14 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            disabled={isLoading}
            id="signup-email"
            label="Email Address"
            name="email"
            placeholder="Enter your email"
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
          />
          {formData.email && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <Check className="h-5 w-5 text-green-500" />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Number Field */}
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Phone className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            required
            className="pl-12 pr-12 h-14 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            disabled={isLoading}
            id="signup-mobile"
            label="Mobile Number"
            name="mobile"
            placeholder="Enter your mobile number"
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData({ phone: e.target.value })}
          />
          {formData.phone && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <Check className="h-5 w-5 text-green-500" />
            </div>
          )}
        </div>
      </div>

      {/* Password Field */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <LockIcon className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          required
          className="pl-12 pr-12 h-14 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          disabled={isLoading}
          id="signup-password"
          label="Password"
          name="password"
          placeholder="Create a password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={(e) => updateFormData({ password: e.target.value })}
        />
        <button
          className="absolute inset-y-0 right-0 pr-4 flex items-center"
          type="button"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5 text-gray-400" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* Create Account Button */}
      <LoadingButton
        className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
        disabled={isLoading}
        isLoading={isLoading}
        loadingText="Creating account..."
        type="submit"
      >
        Create Account
      </LoadingButton>
    </form>
  );
}
