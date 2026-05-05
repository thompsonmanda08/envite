"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import { createNewAccount } from "@/app/_actions/auth";
import {
  countries,
  formatCountryOption,
  type Country,
} from "@/lib/countries";

export default function Signup() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+260");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setMessage("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    const response = await createNewAccount({
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      phone: phone ? `${countryCode}${phone}` : "",
    });

    if (response.success) {
      router.push("/dashboard?account=new");
    } else {
      setMessage(`Error: ${response.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-md space-y-4"
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Start sending beautiful invitations in minutes.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="firstName"
            className="mb-1 block text-sm font-medium"
          >
            First name
          </label>
          <input
            id="firstName"
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="mb-1 block text-sm font-medium">
            Last name
          </label>
          <input
            id="lastName"
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium">
          Phone <span className="text-muted-foreground">(optional)</span>
        </label>
        <div className="flex gap-2">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="rounded-lg border border-input bg-background px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {countries.map((country: Country) => (
              <option key={country.code} value={country.dialCode}>
                {formatCountryOption(country)}
              </option>
            ))}
          </select>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-1 block text-sm font-medium"
        >
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {message && (
        <p className="text-sm text-destructive" role="alert">
          {message}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Spinner color="white" size="sm" />
            <span className="ml-2">Creating account...</span>
          </>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
}
