"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import { createNewAccount } from "@/app/_actions/auth";
import {
  countries,
  formatCountryOption,
  findCountryByDialCode,
  type Country,
} from "@/lib/countries";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [shopName, setShopName] = useState("");
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [step, setStep] = useState(1); // 1: Store info, 2: Password creation
  const [showWhatsAppConfirmation, setShowWhatsAppConfirmation] =
    useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (step === 1) {
      // First step: validate store info and show WhatsApp confirmation modal
      if (!email || !username || !shopName || !whatsapp) {
        setMessage(
          "Please fill in all required fields including WhatsApp number.",
        );

        return;
      }
      setShowWhatsAppConfirmation(true);

      return;
    }

    if (step === 2) {
      // Second step: create account with password
      if (!password || !confirmPassword) {
        setMessage("Please enter and confirm your password.");

        return;
      }

      if (password !== confirmPassword) {
        setMessage("Passwords do not match. Please try again.");

        return;
      }

      if (password.length < 8) {
        setMessage("Password must be at least 8 characters long.");

        return;
      }

      setIsSubmitting(true);

      const response = await createNewAccount({
        email,
        username,
        shopName,
        description,
        whatsapp: whatsapp ? `${countryCode}${whatsapp}` : undefined,
        password,
      });

      if (response.success) {
        // Account created and user is automatically logged in
        // Redirect to dashboard
        router.push("/dashboard?account=new");
      } else {
        setMessage(`Error: ${response.message}`);
        setIsSubmitting(false);
      }

      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000 * 60); // Simulate a delay of 1 minute
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
    setMessage("");
  };

  const handleWhatsAppConfirm = () => {
    setShowWhatsAppConfirmation(false);
    setStep(2);
  };

  const handleWhatsAppEdit = () => {
    setShowWhatsAppConfirmation(false);
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-light text-black mb-4">
          {step === 1 ? (
            <>
              Create your <span className="font-bold">store</span>
            </>
          ) : (
            <>
              Secure your <span className="font-bold">account</span>
            </>
          )}
        </h1>
        <p className="text-gray-600 leading-relaxed">
          {step === 1
            ? "Join thousands of creators who are already building their business with xclsv. Get started in less than 2 minutes."
            : "Create a strong password to protect your store and customer data."}
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {step === 1 ? (
          // Step 1: Store Information
          <>
            <div>
              <label
                className="block text-sm font-medium text-black mb-2"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors placeholder:text-gray-400 text-black"
                id="email"
                placeholder="your@email.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-black mb-2"
                htmlFor="username"
              >
                Username{" "}
                <span className="text-xs text-gray-400">
                  (xclsv.com/@{username || "your-handle"})
                </span>
              </label>
              <input
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors placeholder:text-gray-400 text-black"
                id="username"
                placeholder="your-handle"
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
                  )
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                • Only letters, numbers, - and _ allowed
              </p>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-black mb-2"
                htmlFor="shopName"
              >
                Store Name
              </label>
              <input
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors placeholder:text-gray-400 text-black"
                id="shopName"
                placeholder="Your Brand Name"
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                This is your brand name and can contain any characters
              </p>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-black mb-2"
                htmlFor="description"
              >
                Store Description{" "}
                <span className="text-gray-400">(Optional)</span>
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors resize-none placeholder:text-gray-400 text-black"
                id="description"
                placeholder="What do you sell? Tell your customers about your brand..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-black mb-2"
                htmlFor="whatsapp"
              >
                WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  className="w-20 px-2 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-black bg-white text-sm"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  {countries.map((country: Country) => (
                    <option key={country.code} value={country.dialCode}>
                      {formatCountryOption(country)}
                    </option>
                  ))}
                </select>
                <div className="flex-1 flex items-center px-3 py-3 border border-gray-200 rounded-lg bg-gray-50">
                  <span className="text-gray-700 mr-2">{countryCode}</span>
                  <input
                    required
                    className="flex-1 bg-transparent outline-none placeholder:text-gray-400 text-black"
                    id="whatsapp"
                    placeholder="1234567890"
                    type="tel"
                    value={whatsapp}
                    onChange={(e) =>
                      setWhatsapp(e.target.value.replace(/[^0-9]/g, ""))
                    }
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Required for store notifications and customer support
              </p>
            </div>

            <Button className="w-full" disabled={isSubmitting} type="submit">
              Continue to Password
            </Button>
          </>
        ) : (
          // Step 2: Password Creation
          <>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-black mb-2">Store Information</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <strong>Email:</strong> {email}
                </p>
                <p>
                  <strong>Username:</strong> @{username}
                </p>
                <p>
                  <strong>Store:</strong> {shopName}
                </p>
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-black mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <input
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors placeholder:text-gray-400 text-black"
                id="password"
                placeholder="Enter a strong password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters long
              </p>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-black mb-2"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <input
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors placeholder:text-gray-400 text-black"
                id="confirmPassword"
                placeholder="Confirm your password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <Button
                className="w-full bg-gray-100 text-black"
                type="button"
                variant="outline"
                onClick={handleBack}
              >
                Back
              </Button>

              <Button className="w-full" disabled={isSubmitting} type="submit">
                {isSubmitting ? (
                  <span className="flex items-center gap-1 ">
                    <Spinner color="white" size={"sm"} /> Creating Store...
                  </span>
                ) : (
                  "Create Store"
                )}
              </Button>
            </div>
          </>
        )}
      </form>

      {message && (
        <div
          className={`mt-6 p-4 rounded-lg border ${
            message.includes("Error")
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-green-50 border-green-200 text-green-700"
          }`}
        >
          <p className="text-center text-sm">{message}</p>
        </div>
      )}

      {/* Benefits Section */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-black rounded-full flex-shrink-0" />
            <span>Your personalized store page instantly</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-black rounded-full flex-shrink-0" />
            <span>One link to share across all platforms</span>
          </div>
        </div>
      </div>

      {/* WhatsApp Confirmation Modal */}
      {showWhatsAppConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto shadow-2xl">
            <div className="text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Confirm your WhatsApp number
              </h3>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                <p className="text-lg font-mono text-green-800">
                  {countryCode} {whatsapp}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {findCountryByDialCode(countryCode)?.name}
                </p>
              </div>
              <div className="text-sm text-gray-700 space-y-1 mb-6">
                <p>✓ Store order notifications</p>
                <p>✓ Account verification codes</p>
                <p>✓ Important store updates</p>
                <p>✓ Customer support access</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1"
                type="button"
                variant="outline"
                onClick={handleWhatsAppEdit}
              >
                Edit Number
              </Button>
              <Button
                className="flex-1"
                type="button"
                onClick={handleWhatsAppConfirm}
              >
                Confirm & Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
