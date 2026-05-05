import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for could not be found.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <nav className="px-6 py-4 border-b border-gray-100">
        <Link href="/" className="inline-block">
          <Image
            src="/logo/black-on-white-transparent.png"
            alt="xclsv"
            width={120}
            height={40}
            className="h-12 w-auto"
          />
        </Link>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="text-center max-w-md">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-8xl font-light text-gray-200 mb-4">404</div>
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          <h1 className="text-2xl lg:text-3xl font-light text-gray-900 mb-4">
            Page <span className="font-bold">Not Found</span>
          </h1>

          <p className="text-gray-600 mb-8 leading-relaxed">
            The page you are looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back on track.
          </p>

          {/* Actions */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block w-full bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors"
            >
              Go to Homepage
            </Link>

            <div className="flex gap-3">
              <Link
                href="/dashboard"
                className="flex-1 bg-gray-100 text-gray-900 px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
              >
                Dashboard
              </Link>
              <Link
                href="/apply"
                className="flex-1 bg-gray-100 text-gray-900 px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
              >
                Create Store
              </Link>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-4">
              Need help finding something?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              <a
                href="https://chat.whatsapp.com/ELdaZCgi8SvBRIMAM8KIdQ"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-black transition-colors"
              >
                Contact Support
              </a>
              <span className="hidden sm:inline text-gray-300">•</span>
              <Link
                href="/login"
                className="text-gray-600 hover:text-black transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-gray-100">
        <div className="text-center text-sm text-gray-500">
          © 2024 xclsv. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
