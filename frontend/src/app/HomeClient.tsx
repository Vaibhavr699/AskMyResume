"use client";

import Link from 'next/link';
import { FaRobot, FaSearch, FaFileAlt, FaChartLine, FaLightbulb, FaCheckCircle, FaComments, FaBrain, FaUpload } from 'react-icons/fa';
import { HiMenu, HiX, HiSparkles } from 'react-icons/hi';
import { useState, useEffect } from 'react';
import { FAQSection } from './components/FAQSection';

export default function HomeClient() {
  const [isVisible, setIsVisible] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-slate-800/95 backdrop-blur-lg border-b border-slate-700/50 z-50 shadow-xl">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg">
              <img 
                src="/a.png" 
                alt="AskMyResume Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xl font-bold text-white">
              AskMy<span className="text-blue-300">Resume</span>
            </span>
          </Link>

          <div className="hidden lg:flex gap-8 items-center">
            <Link href="/" className="text-gray-200 font-medium hover:text-blue-300 transition-colors">Home</Link>
            <Link href="#features" className="text-gray-200 font-medium hover:text-blue-300 transition-colors">Features</Link>
            <Link href="/auth/login" className="text-gray-200 font-medium hover:text-blue-300 transition-colors">Chat</Link>
            <Link href="#faq" className="text-gray-200 font-medium hover:text-blue-300 transition-colors">FAQ</Link>
          </div>

          <div className="hidden lg:flex gap-3 items-center">
            <Link href="/auth/login" className="px-5 py-2 rounded-lg text-gray-200 font-medium hover:bg-slate-700/50 transition-colors">Login</Link>
            <Link href="/auth/signup" className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg">
              Start Chatting
            </Link>
          </div>

          <button
            className="lg:hidden p-2 rounded-md text-gray-300 hover:text-white focus:outline-none"
            onClick={() => setNavOpen(!navOpen)}
          >
            {navOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>
        </div>

        {navOpen && (
          <div className="lg:hidden bg-slate-800/95 border-t border-slate-700/50 px-4 py-3 space-y-3 flex flex-col">
            <Link href="/" className="py-2 text-gray-200 font-medium hover:text-blue-300" onClick={() => setNavOpen(false)}>Home</Link>
            <Link href="#features" className="py-2 text-gray-200 font-medium hover:text-blue-300" onClick={() => setNavOpen(false)}>Features</Link>
            <Link href="/auth/login" className="py-2 text-gray-200 font-medium hover:text-blue-300" onClick={() => setNavOpen(false)}>Chat</Link>
            <Link href="#faq" className="py-2 text-gray-200 font-medium hover:text-blue-300" onClick={() => setNavOpen(false)}>FAQ</Link>
            <div className="flex gap-3 pt-2">
              <Link href="/auth/login" className="flex-1 py-2 text-center rounded-lg border border-slate-600 text-gray-200 font-medium hover:bg-slate-700/50">Login</Link>
              <Link href="/auth/signup" className="flex-1 py-2 text-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium">Start Chat</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="w-full pt-24 pb-20 sm:pt-32 sm:pb-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-30"></div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-full mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-blue-600/30 text-sm text-gray-200">
              <HiSparkles className="text-blue-400" />
              AI-Powered Career Intelligence
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Chat with Your Resume<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-400">Like Never Before</span>
            </h1>
            <p className="text-xl text-gray-200 leading-relaxed">
              Upload your resume and engage in intelligent conversations. Get instant answers about your career, personalized optimization tips, and strategic guidance—all powered by advanced AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/auth/signup" className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-1 text-center">
                Start Your Chat
              </Link>
              <Link href="#features" className="px-8 py-4 rounded-xl border border-white/80 text-gray-200 font-semibold hover:bg-slate-800/50 hover:border-blue-500/50 transition-all text-center">
                See How It Works
              </Link>
            </div>
            <div className="flex items-center gap-6 pt-4 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-400" />
                <span>Instant AI responses</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-400" />
                <span>Privacy-first approach</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-blue-600/20 shadow-2xl overflow-hidden">
              {/* Chat Interface Mockup */}
              <div className="bg-slate-800 px-6 py-4 border-b border-blue-600/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                    <FaBrain className="text-white text-sm" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Resume AI Assistant</h3>
                    <p className="text-sm text-gray-300">Analyzing your career profile...</p>
                  </div>
                  <div className="ml-auto flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-4 h-80 overflow-hidden">
                <div className="flex justify-start">
                  <div className="bg-slate-700 rounded-2xl rounded-tl-md px-4 py-3 max-w-xs">
                    <p className="text-white text-sm">Hi! I've analyzed your resume. What would you like to know about your career profile?</p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl rounded-tr-md px-4 py-3 max-w-xs">
                    <p className="text-white text-sm">How does my experience align with senior developer roles?</p>
                  </div>
                </div>
                
                <div className="flex justify-start">
                  <div className="bg-slate-700 rounded-2xl rounded-tl-md px-4 py-3 max-w-sm">
                    <p className="text-white text-sm">Your 5+ years in full-stack development strongly align with senior roles. Your leadership experience and cloud architecture skills are particularly valuable...</p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl rounded-tr-md px-4 py-3 max-w-xs">
                    <p className="text-white text-sm">What should I improve for FAANG applications?</p>
                  </div>
                </div>
                
                <div className="flex justify-start">
                  <div className="bg-slate-700 rounded-2xl rounded-tl-md px-4 py-3 max-w-sm animate-pulse">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-800">
        <div className="max-w-8xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Intelligent Career Conversations
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Transform your resume into an interactive career advisor. Get personalized insights through natural conversations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="cursor-pointer bg-slate-900 border border-blue-600/20 rounded-2xl p-8 hover:border-blue-500/50 transition-all hover:shadow-xl hover:bg-slate-800/70">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center mb-6 shadow-lg">
                <FaUpload className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Smart Upload & Analysis</h3>
              <p className="text-gray-200 leading-relaxed">
                Simply upload your resume in any format. Our AI instantly understands your background, skills, and career trajectory.
              </p>
            </div>

            <div className="cursor-pointer bg-slate-900 border border-slate-700 rounded-2xl p-8 hover:border-blue-500/50 transition-all hover:shadow-xl hover:bg-slate-800/50">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg">
                <FaComments className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Natural Conversations</h3>
              <p className="text-gray-300 leading-relaxed">
                Ask anything about your career in plain English. Get advice on roles, salary, skills gaps, and career progression.
              </p>
            </div>

            <div className="cursor-pointer bg-slate-900 border border-slate-700 rounded-2xl p-8 hover:border-blue-500/50 transition-all hover:shadow-xl hover:bg-slate-800/50">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6 shadow-lg">
                <FaBrain className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Personalized Insights</h3>
              <p className="text-gray-300 leading-relaxed">
                Receive tailored recommendations based on your unique profile, industry trends, and career goals.
              </p>
            </div>

            <div className="cursor-pointer bg-slate-900 border border-slate-700 rounded-2xl p-8 hover:border-blue-500/50 transition-all hover:shadow-xl hover:bg-slate-800/50">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-6 shadow-lg">
                <FaChartLine className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Market Intelligence</h3>
              <p className="text-gray-300 leading-relaxed">
                Get insights on salary ranges, skill demand, and market positioning for your experience level and target roles.
              </p>
            </div>

            <div className="cursor-pointer bg-slate-900 border border-slate-700 rounded-2xl p-8 hover:border-blue-500/50 transition-all hover:shadow-xl hover:bg-slate-800/50">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-6 shadow-lg">
                <FaLightbulb className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Optimization Tips</h3>
              <p className="text-gray-300 leading-relaxed">
                Discover specific improvements to make your resume more compelling for your target positions and industries.
              </p>
            </div>

            <div className="cursor-pointer bg-slate-900 border border-slate-700 rounded-2xl p-8 hover:border-blue-500/50 transition-all hover:shadow-xl hover:bg-slate-800/50">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-6 shadow-lg">
                <FaSearch className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Career Exploration</h3>
              <p className="text-gray-300 leading-relaxed">
                Explore new career paths, understand role requirements, and get guidance on making strategic career transitions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-900 via-blue-900/20 to-indigo-900/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-600/5"></div>
        <div className="max-w-4xl mx-auto text-center text-white relative z-10">
          <h2 className="text-3xl sm:text-5xl font-bold mb-8">
            Ready to Have a Career Conversation?
          </h2>
          <p className="text-xl mb-10 text-gray-300 leading-relaxed">
            Join professionals who are making smarter career decisions through AI-powered resume conversations.
          </p>
          <Link 
            href="/auth/signup" 
            className="inline-block px-10 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1"
          >
            Start Your Free Chat
          </Link>
          <div className="mt-8 text-sm text-gray-400">
            No credit card required • Get insights in seconds • Your data stays private
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <div className="bg-gray-800">
        <FAQSection />
      </div>

      {/* Footer */}
      <footer className="w-full bg-slate-900 border-t border-slate-800 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img 
                  src="/a.png" 
                  alt="AskMyResume Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl font-bold">
                AskMy<span className="text-blue-400">Resume</span>
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-md">
              Transform your resume into intelligent career conversations. Get personalized insights and strategic guidance powered by AI.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Product</h3>
            <ul className="space-y-3 text-gray-400">
              <li><Link href="#features" className="hover:text-blue-400 transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Pricing</Link></li>
              <li><Link href="/auth/login" className="hover:text-blue-400 transition-colors">Login</Link></li>
              <li><Link href="#faq" className="hover:text-blue-400 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Company</h3>
            <ul className="space-y-3 text-gray-400">
              <li><Link href="#" className="hover:text-blue-400 transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Privacy</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-12 border-t border-slate-800 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} AskMyResume. All rights reserved.
        </div>
      </footer>
    </div>
  );
}