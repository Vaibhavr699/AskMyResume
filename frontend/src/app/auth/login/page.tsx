"use client";

import LoginForm from "@/app/components/auth/LoginForm";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { HiArrowLeft } from "react-icons/hi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Please enter your email", {
        position: "top-right",
        className: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
      });
      return;
    }

    setResetLoading(true);
    try {
      const res = await fetch("http://localhost:3005/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      if (!res.ok) {
        throw new Error("Failed to send reset email");
      }

      toast.success("Password reset instructions will be sent if the email is registered.", {
        position: "top-right",
        className: "bg-gradient-to-r from-emerald-500 to-blue-500 text-white",
      });
      setShowReset(false);
      setResetEmail("");
    } catch {
      toast.error("Error sending reset link. Please try again.", {
        position: "top-right",
        className: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
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
      {/* Optimized background image */}
      <Image
        src="/bgb.jpg"
        alt="Background"
        fill
        priority
        quality={100}
        className="object-cover object-center -z-10"
      />
      {/* Back to Home Button */}
      <motion.button
        onClick={() => router.push("/")}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-20 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Back to Home"
      >
        <HiArrowLeft className="w-5 h-5 text-blue-600" />
      </motion.button>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-xl border-2 border-white b shadow-lg overflow-hidden">
        {/* Logo Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-900 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-blue-100 mt-1">Sign in to your account</p>
        </div>

        {/* Form Content */}
        <div className="p-6 sm:p-8">
          <LoginForm />

          {/* Auth Footer Links */}
          <div className="mt-4 flex flex-col lg:flex-row justify-between font-normal items-center text-sm text-gray-600 gap-2">
            <span>
              Don’t have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-blue-700 hover:text-blue-900 font-semibold underline cursor-pointer"
              >
                Create one
              </Link>
            </span>

            <button
              onClick={() => setShowReset(true)}
              className="text-blue-700 hover:text-blue-900 font-semibold underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showReset && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowReset(false)}
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 cursor-default"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Reset Password
            </h2>
            <form className="space-y-4" onSubmit={handleResetPassword}>
              <div>
                <label
                  htmlFor="reset-email"
                  className="block text-sm font-medium text-black mb-1"
                >
                  Email address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowReset(false)}
                  className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition cursor-pointer disabled:opacity-60"
                >
                  {resetLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
