"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";

export default function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    // Client-side validation
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      toast.error("Please fill in all fields.", {
        className: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      toast.error("Please enter a valid email address.", {
        className: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters.", {
        className: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.", {
        className: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3005/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      
      console.log('Signup Response Status:', res.status);
      console.log('Signup Response OK:', res.ok);
      
      const data = await res.json();
      console.log('Signup Response Data:', data);
      
      if (!res.ok) {
        console.log('Signup failed - showing error toast');
        
        // Handle specific error cases with proper toastify styling
        if (data.message === 'A user with this email already exists') {
          toast.error("This email is already registered. Please use a different email or try logging in.", {
            className: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else {
          toast.error(data.message || "Signup failed. Please try again.", {
            className: "bg-gradient-to-r from-red-500 to-pink-500 text-white"
          });
        }
      } else {
        toast.success("Account created! 🎉 Please sign in to continue.", {
          className: "bg-gradient-to-r from-emerald-500 to-blue-500 text-white",
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setTimeout(() => {
          router.push("/auth/login");
        }, 1200);
      }
    } catch (err) {
      console.log('Signup catch error:', err);
      toast.error("Network error. Please try again.", {
        className: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name" className="block text-xs lg:text-sm font-medium text-gray-800 mb-0.5">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full px-2.5 py-2 lg:px-3 lg:py-2.5 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none bg-white text-gray-900 text-xs lg:text-sm"
          placeholder="Your full name"
          required
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-xs lg:text-sm font-medium text-gray-800 mb-0.5">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full px-2.5 py-2 lg:px-3 lg:py-2.5 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none bg-white text-gray-900 text-xs lg:text-sm"
          placeholder="@youremail"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-xs lg:text-sm font-medium text-gray-800 mb-0.5">
          Password
        </label>
        <input
          id="password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          className="w-full px-2.5 py-2 lg:px-3 lg:py-2.5 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none bg-white text-gray-900 text-xs lg:text-sm"
          placeholder="Minimum 8 characters"
          required
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-xs lg:text-sm font-medium text-gray-800 mb-0.5">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full px-2.5 py-2 lg:px-3 lg:py-2.5 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none bg-white text-gray-900 text-xs lg:text-sm"
          placeholder="••••••••"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full py-2 cursor-pointer lg:py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-lg transition disabled:opacity-60 text-sm lg:text-base"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Account"}
      </button>
      <div className="text-center text-gray-600 text-xs lg:text-sm mt-1">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-blue-700 hover:text-blue-900 font-semibold underline cursor-pointer"
        >
          Sign In
        </Link>
      </div>
    </form>
  );
}
