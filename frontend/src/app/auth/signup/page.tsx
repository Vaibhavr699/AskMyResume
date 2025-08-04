'use client';

import SignupForm from '@/app/components/auth/SignupForm';
import { motion } from 'framer-motion';
import { HiArrowLeft } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SignupPage() {
  const router = useRouter();

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
      {/* Background Image */}
      <Image
        src="/bgb.jpg"
        alt="Background"
        fill
        priority
        quality={100}
        className="object-cover object-center -z-10"
      />

      {/* Optional overlay for contrast */}
      <div className="absolute inset-0 bg-black/30 -z-10" />

      {/* Back Button */}
      <motion.button
        onClick={() => router.push('/')}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-20 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Back to Home"
      >
        <HiArrowLeft className="w-5 h-5 text-blue-600" />
      </motion.button>

      {/* Main Signup Card */}
      <div className="w-full max-w-md bg-white rounded-xl border-2 border-white shadow-lg overflow-hidden z-10">
        {/* Header with Logo */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-900 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Join AskMyResume</h1>
          <p className="text-blue-100 mt-1">Create your account below</p>
        </div>

        {/* Signup Form */}
        <div className="p-6 sm:p-8">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
