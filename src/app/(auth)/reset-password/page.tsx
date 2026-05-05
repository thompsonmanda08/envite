"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { resetPassword } from "@/app/_actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import Spinner2 from "@/components/ui/spinner";

function LoadingPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Spinner2 size="lg" />
    </div>
  );
}
import { toast } from "sonner";

export default function ResetForgotPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!token) {
    router.push("/forgot-password");
    toast.error("No reset token provided.");

    return <LoadingPage />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!newPassword || !confirmPassword) {
      setMessage("Please enter both newPassword and password.");

      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");

      return;
    }

    setIsSubmitting(true);

    const response = await resetPassword({ password: newPassword, token });

    if (response.success) {
      const token = response.data.token;

      // Redirect to reset password page with token
      toast.success(response.message || "Password reset successfully!");
      setMessage("🎉 Password reset successfully! Redirecting...");
      router.push(`/login?password_reset=${true}`);
    } else {
      setMessage(`Error: ${response?.data?.message || response?.message}`);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-light text-black mb-2">
          Reset <span className="font-bold">Password</span>
        </h1>
        <p className="text-gray-600">Change your Password?</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          disabled={isSubmitting}
          errorText="Password must be at least 6 characters."
          id="newPassword"
          isInvalid={newPassword.length < 6 && newPassword.length > 0}
          label="New Password"
          placeholder="Enter your new password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Input
          disabled={isSubmitting}
          errorText="Passwords do not match."
          id="confirmPassword"
          isInvalid={
            confirmPassword !== newPassword && confirmPassword.length > 6
          }
          label="Confirm Password"
          placeholder="Enter your password again"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? (
            <span className="flex items-center gap-1 ">
              <Spinner color="white" size={"sm"} /> Submitting...
            </span>
          ) : (
            "Change Password"
          )}
        </Button>

        {message && (
          <div
            className={`mt-4 p-4 rounded-lg text-center ${
              message.includes("🎉") || message.includes("successfully")
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
