"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { FiLock, FiMail, FiEye, FiEyeOff, FiLoader } from "react-icons/fi";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaExclamationTriangle, FaLock, FaRocket } from "react-icons/fa";

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hoverToggle, setHoverToggle] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isFormValid = form.email.trim() !== "" && form.password.trim() !== "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!isFormValid) {
      toast.error("Please fill in all fields", {
        className: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3005/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.message || "Login failed";
        toast.error(
          errorMsg.includes("password")
            ? "Ohh no! Invalid credentials. Please try again."
            : errorMsg,
          {
            className: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
          }
        );
      } else if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        document.cookie = `token=${data.access_token}; path=/; SameSite=Strict${
          keepLoggedIn ? "; max-age=2592000" : ""
        }`;

        const payload = parseJwt(data.access_token);
        toast.success("Great to see you again! Redirecting...", {
          className: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
        });

        setTimeout(() => {
          router.push(payload?.role === "ADMIN" ? "/admin" : "/dashboard");
        }, 1000);
      }
    } catch (err) {
      toast.error("Network error. Please try again.", {
        className: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Please enter your email", {
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
        className: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
      });
      setShowReset(false);
      setResetEmail("");
    } catch {
      toast.error("Error sending reset link. Please try again.", {
        className: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
      });
    } finally {
      setResetLoading(false);
    }
  };

  const buttonVariants = {
    initial: { y: 0 },
    down: { y: 14 },
    up: { y: -14 },
  };

  return (
    <>
      <motion.form
        className="space-y-5"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-1">
            Email
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400">
              <FiMail />
            </span>
            <input
              type="email"
              name="email"
              id="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-800 mb-1">
            Password
          </label>
          <div className="relative">
            <span className="absolute left-3 justify-center top-2.5 text-gray-400">
              <FiLock />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            />
            <span
              className="absolute right-3 top-2.5 text-gray-400 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
        </div>

        {/* Keep Me Logged In */}
        <div className="flex justify-between items-center">
          <label className="flex items-center space-x-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={keepLoggedIn}
              onChange={() => setKeepLoggedIn(!keepLoggedIn)}
              className="accent-blue-600 cursor-pointer"
            />
            <span>Keep me logged in</span>
          </label>
        </div>

        {/* Animated Button */}
        <div>
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`cursor-pointer w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition
              ${!isFormValid ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
            `}
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </div>
      </motion.form>
    </>
  );
}
