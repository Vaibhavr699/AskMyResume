'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white px-4 text-center">
      <div className="max-w-md w-full">
        {/* Icon and Error Code */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-orange-600 rounded-full shadow-lg">
            <Home className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-amber-400 mb-2">404</h1>
          <p className="text-lg text-slate-300">Page Not Found</p>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-400 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => router.push('/')}
            className="px-5 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold shadow transition"
          >
            Go to Home
          </button>

          <Link
            href="/search"
            className="text-sm text-amber-400 hover:underline transition"
          >
            Try Searching
          </Link>
        </div>

        {/* Support Link */}
        <p className="mt-6 text-xs text-slate-500">
          Need help?{' '}
          <Link href="/contact" className="text-amber-400 hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}
