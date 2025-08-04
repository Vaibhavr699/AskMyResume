"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@/hooks/useUser";
import { useResumes } from "@/hooks/useResumes";
import { useUploadResume } from "@/hooks/useUploadResume";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  CheckCircle,
  FileText,
  Search,
  Zap,
  Briefcase,
  X,
  CloudUpload,
  Plus,
  Upload,
} from "lucide-react";

import ChatBot from "../components/ChatBot";
import ResumeCard from "../components/ResumeCard";
import Link from "next/link";
import { HiChevronDown } from "react-icons/hi";
import { FiLogOut } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { clearChatData } from "@/utils/api";

function SkeletonCard() {
  return (
    <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-slate-700/20 animate-pulse">
      <div className="h-6 w-1/3 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl mb-4" />
      <div className="space-y-3">
        <div className="h-4 w-2/3 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg" />
        <div className="h-4 w-1/2 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg" />
        <div className="h-3 w-3/4 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [uploadModal, setUploadModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  const steps = [
    {
      label: "Parsing",
      icon: <FileText className="w-5 h-5" />,
      color: "text-blue-500",
    },
    {
      label: "Extracting",
      icon: <Search className="w-5 h-5" />,
      color: "text-indigo-500",
    },
    {
      label: "Embedding",
      icon: <Zap className="w-5 h-5" />,
      color: "text-purple-500",
    },
    {
      label: "Processing",
      icon: <Briefcase className="w-5 h-5" />,
      color: "text-emerald-500",
    },
  ];

  const [stepStatus, setStepStatus] = useState([false, false, false, false]);

  const { data: user, isLoading: userLoading } = useUser();
  const { mutate: uploadResume, isPending: uploading } = useUploadResume();
  const {
    data: resumes = [],
    isLoading: resumesLoading,
    refetch: refetchResumes,
  } = useResumes();

  const router = useRouter();

  // Redirect admin users away from dashboard
  useEffect(() => {
    if (!userLoading && user?.role === "ADMIN") {
      router.replace("/admin");
    }
  }, [user, userLoading, router]);

  // Auto-select first resume if available
  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes, selectedResumeId]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (
      droppedFile &&
      (droppedFile.type === "application/pdf" ||
        droppedFile.name.endsWith(".pdf") ||
        droppedFile.name.endsWith(".doc") ||
        droppedFile.name.endsWith(".docx"))
    ) {
      setFile(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setProgress(0);
    setProgressStep(0);
    setStepStatus([false, false, false, false]);
    setSuccess(false);

    let current = 0;
    const interval = setInterval(() => {
      current += 0.25;
      if (current >= 90) {
        clearInterval(interval);
        setProgress(90);
      } else {
        setProgress(current);
      }

      if (current >= 0 && current < 25) setProgressStep(0);
      else if (current >= 25 && current < 50) setProgressStep(1);
      else if (current >= 50 && current < 75) setProgressStep(2);
      else if (current >= 75) setProgressStep(3);
    }, 100);

    uploadResume(file, {
      onSuccess: () => {
        clearInterval(interval);
        setProgress(100);
        setStepStatus([true, true, true, true]);
        setProgressStep(4);
        setSuccess(true);
        setTimeout(() => {
          setUploadModal(false);
          setFile(null);
          setProgress(0);
          setProgressStep(0);
          setStepStatus([false, false, false, false]);
          setSuccess(false);
          refetchResumes();
        }, 1200);
        toast.success(
          "Resume uploaded successfully! You can now chat with AI about it.",
          {
            className:
              "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
          }
        );
      },
      onError: () => {
        clearInterval(interval);
        setProgress(0);
        setProgressStep(0);
        setStepStatus([false, false, false, false]);
        setSuccess(false);
        toast.error("Upload failed. Please try again.", {
          className: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
        });
      },
    });
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    clearChatData(); // Clear all chat messages from localStorage
    toast.success("Logged out successfully!", {
      className: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
    });
    setTimeout(() => {
      router.push("/");
    }, 1200);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="w-full max-w-7xl">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Sticky Responsive Navbar */}
      <nav className="w-full bg-slate-800/95 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50 shadow-2xl shadow-black/20">
        <div className="max-w-full mx-auto px-4 md:px-8 lg:px-10 py-2 sm:py-3 md:py-4 flex items-center justify-between">
          {/* Logo - Enhanced with hover effects and better gradient */}
          <Link href="" className="flex items-center gap-2 sm:gap-3 group">
            {/* Logo Image */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl overflow-hidden shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105">
              <img
                src="/a.png"
                alt="AskMyResume Logo"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Brand Text */}
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-white group-hover:text-blue-100 transition-colors duration-200">
              AskMy
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Resume
              </span>
            </span>
          </Link>

          <div className="flex-1" />

          {/* Enhanced User Info Card */}
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((open) => !open)}
                className="cursor-pointer group flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1 sm:py-2 bg-slate-700/90 backdrop-blur-sm border border-slate-600/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 hover:bg-slate-600 hover:scale-[1.02] active:scale-[0.98]"
              >
                {/* Avatar */}
                <div className="relative">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="User Avatar"
                      className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-2xl object-cover ring-2 ring-white/50"
                    />
                  ) : (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-inner">
                      {user.name
                        ? user.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        : "U"}
                    </div>
                  )}
                  {/* Status Indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 border-2 border-white rounded-full"></div>
                </div>

                {/* Name */}
                <span className="text-xs sm:text-sm md:text-base font-semibold text-white truncate max-w-[90px] sm:max-w-[120px] group-hover:text-blue-100 transition-colors">
                  {user.name || "User"}
                </span>

                <HiChevronDown
                  className={`w-4 h-4 text-slate-300 transition-all duration-300 group-hover:text-blue-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />

                  {/* Dropdown Panel */}
                  <div className="absolute right-0 mt-2 w-56 xs:w-60 sm:w-64 bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-3xl shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-3 sm:p-4 border-b border-slate-600/50">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="relative">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt="User Avatar"
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl object-cover ring-2 ring-white/50"
                            />
                          ) : (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-inner">
                              {user.name
                                ? user.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()
                                : "U"}
                            </div>
                          )}
                          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 bg-green-400 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm sm:text-base font-bold text-white truncate">
                            {user.name || "User"}
                          </div>
                          <div className="text-xs text-slate-300 truncate mt-0.5">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu */}
                    <div className="p-2 sm:p-3">
                      <button
                        onClick={handleLogout}
                        className="cursor-pointer w-full flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-200 font-medium px-3 sm:px-4 py-2 sm:py-3 rounded-2xl hover:bg-red-900/50 hover:text-red-300 transition-all duration-200 group"
                      >
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-900/30 rounded-xl flex items-center justify-center group-hover:bg-red-800/50 transition-colors">
                          <FiLogOut className="w-4 h-4 text-red-400" />
                        </div>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-slate-500/5 to-blue-500/5 rounded-full blur-3xl animate-pulse animation-delay-4000" />
      </div>

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

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-full px-0 md:px-6 lg:px-10 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Resumes Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Your Resumes</h2>
                  <button
                    onClick={() => setUploadModal(true)}
                    className="cursor-pointer p-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-500/30"
                    title="Upload new resume"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {resumesLoading ? (
                  <div className="space-y-4">
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-300 mb-4">
                      No resumes uploaded yet
                    </p>
                    <button
                      onClick={() => setUploadModal(true)}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg"
                    >
                      <CloudUpload className="w-4 h-4" />
                      Upload First Resume
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {resumes.map((resume: any) => (
                      <ResumeCard
                        key={resume.id}
                        resume={resume}
                        isSelected={selectedResumeId === resume.id}
                        onSelect={setSelectedResumeId}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <div className="h-[600px] bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
                <ChatBot
                  resumeId={selectedResumeId || undefined}
                  onUploadResume={() => setUploadModal(true)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Upload Modal */}
      {uploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl flex items-center justify-center z-[100] p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900 rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl relative border border-slate-600/50 transform transition-all duration-300 animate-scaleIn backdrop-blur-sm">
            {/* Close Button */}
            <button
              onClick={() => {
                setUploadModal(false);
                setProgressStep(0);
                setFile(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-700/80 rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl mb-4 animate-pulse-slow">
                <CloudUpload className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent mb-2">
                Upload Your Resume
              </h2>
              <p className="text-slate-300 font-medium">
                Get AI-powered insights and chat about your experience
              </p>
            </div>

            {/* Modern Drop Zone */}
            <div
              className={`cursor-pointer relative border-2 border-dashed rounded-2xl p-8 mb-6 text-center transition-all duration-300 backdrop-blur-sm ${
                isDragOver
                  ? "border-blue-400 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 scale-[1.02] shadow-lg"
                  : file
                    ? "border-emerald-400 bg-gradient-to-br from-emerald-900/30 to-teal-900/30 shadow-md"
                    : "border-slate-600 hover:border-blue-400 hover:bg-gradient-to-br hover:from-slate-700/50 hover:to-blue-900/30 hover:shadow-md"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="space-y-4">
                  <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 border border-emerald-200 shadow-lg">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{file.name}</p>
                    <p className="text-sm text-emerald-400 font-medium">
                      Ready to upload
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div
                    className={`inline-flex p-4 rounded-2xl transition-all duration-300 shadow-lg ${
                      isDragOver
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white border border-indigo-400 scale-110 shadow-xl"
                        : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 border border-gray-300 hover:from-indigo-100 hover:to-purple-100 hover:text-indigo-600"
                    }`}
                  >
                    <Upload className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-bold text-white mb-2">
                      {isDragOver
                        ? "Drop your file here!"
                        : "Drag and drop your resume"}
                    </p>
                    <p className="text-sm text-slate-400 mb-4">
                      Supports PDF, DOC, and DOCX files
                    </p>
                    <label className="inline-block">
                      <span className="sr-only">Choose resume file</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-slate-300 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gradient-to-r file:from-blue-600 file:to-cyan-600 file:text-white hover:file:from-blue-500 hover:file:to-cyan-500 file:cursor-pointer cursor-pointer bg-transparent file:shadow-lg hover:file:shadow-xl file:transition-all file:duration-300"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Modern Progress Tracking */}
            {(progress > 0 || uploading) && (
              <div className="space-y-6 mb-6">
                {/* Vibrant Progress Bar */}
                <div className="relative">
                  <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden shadow-inner backdrop-blur-sm">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 transition-all duration-700 ease-out relative overflow-hidden shadow-lg"
                      style={{ width: `${progress}%` }}
                    >
                      {/* Multi-layered animation effects */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer transform -skew-x-12" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent animate-pulse" />
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-white/80 via-transparent to-white/80 animate-bounce" />
                    </div>
                  </div>
                  <div className="flex justify-between mt-3">
                    <span className="text-xs font-medium text-slate-300 bg-slate-700/60 px-2 py-1 rounded-full backdrop-blur-sm">
                      Processing
                    </span>
                    <span className="text-xs font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>

                {success && (
                  <div className="flex justify-center animate-bounceIn">
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 text-emerald-300 px-6 py-3 rounded-2xl border border-emerald-500/30 shadow-xl backdrop-blur-sm">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <span className="font-bold">Upload Complete!</span>
                      <span className="text-xs text-emerald-300 bg-emerald-800/50 px-2 py-1 rounded-full">
                        Ready for analysis
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modern Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!file || uploading || progressStep > 0}
              className="cursor-pointer w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 hover:from-blue-500 hover:via-cyan-500 hover:to-indigo-500 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-[1.02] active:scale-95 relative overflow-hidden group backdrop-blur-sm"
            >
              {uploading || progressStep > 0 ? (
                <span className="flex items-center justify-center gap-2 relative z-10">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading & Processing...
                </span>
              ) : (
                <span className="relative z-10">Upload Resume</span>
              )}
              {/* Multiple animated layers */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer transform -skew-x-12"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-200/20 via-transparent to-cyan-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse"></span>
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-bounceIn {
          animation: bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite;
        }
      `}</style>
    </div>
  );
}
