"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 8) {
      toast.error("Password must be at least 8 characters.", {
        className: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3005/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || "Reset failed. Please try again or request a new link.", {
          className: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
        });
      } else {
        toast.success("Password updated! 🔒 You can now sign in.", {
          className: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
        });
        setTimeout(() => router.push("/auth/login"), 2000);
      }
    } catch {
      toast.error("Network error. Please try again.", {
        className: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Reset Your Password</h1>
        <p className="text-gray-600">Enter your new password below.</p>
      </div>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-800 mb-1">New Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none bg-white text-gray-900"
            placeholder="Minimum 8 characters"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-lg transition disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Loading...</h1>
        <p className="text-gray-600">Please wait while we load the reset form.</p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-4">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="rounded-xl shadow-lg"
      />
      <Suspense fallback={<LoadingFallback />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
} 