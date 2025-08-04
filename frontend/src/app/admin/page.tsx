"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  FileText, 
  Search, 
  Star, 
  Filter, 
  LogOut, 
  ChevronDown,
  Calendar,
  Mail,
  User,
  Award,
  TrendingUp,
  Database,
  Eye
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CountUp from 'react-countup';
import { clearChatData } from '@/utils/api';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [scoreFilter, setScoreFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [tokenChecked, setTokenChecked] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [openSkillsDropdown, setOpenSkillsDropdown] = useState<number | null>(null);
  const skillsDropdownRef = useRef<HTMLDivElement>(null);

  // Auth check: redirect to login if not authenticated
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/auth/login");
      return;
    }
  }, [router]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  // Close skills dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (skillsDropdownRef.current && !skillsDropdownRef.current.contains(e.target as Node)) {
        setOpenSkillsDropdown(null);
      }
    }
    if (openSkillsDropdown !== null) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [openSkillsDropdown]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setTokenChecked(false);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch users
        const usersRes = await fetch("http://localhost:3005/users", { headers });
        const usersData = await usersRes.json();
        setUsers(Array.isArray(usersData) ? usersData : []);

        // Fetch resumes (admin endpoint)
        const resumesRes = await fetch("http://localhost:3005/admin/resumes", { headers });
        const resumesData = await resumesRes.json();
        setResumes(Array.isArray(resumesData) ? resumesData : []);
      } catch (err) {
        // Optionally handle error
      } finally {
        setTokenChecked(true);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // After fetching users and resumes, filter out admin users for display
  const nonAdminUsers = Array.isArray(users) ? users.filter((user: any) => user.role !== 'admin') : [];
  // For resumes, only show those whose user is not admin
  const nonAdminResumes = Array.isArray(resumes) ? resumes.filter((resume: any) => resume.user?.role !== 'admin') : [];

  // Filtering and searching for users tab
  const filteredUsers = users
    .filter((user: any) => String(user.role).toLowerCase() === 'user')
    .filter((user: any) => {
      const userName = user.name || "";
      const userEmail = user.email || "";
      return (
        userName.toLowerCase().includes(search.toLowerCase()) ||
        userEmail.toLowerCase().includes(search.toLowerCase())
      );
    });

  // Filtering and searching for resumes tab (already correct)
  const filteredResumes = nonAdminResumes.filter((resume: any) => {
    const userName = resume.user?.name || "";
    const userEmail = resume.user?.email || "";
    const matchesSearch =
      userName.toLowerCase().includes(search.toLowerCase()) ||
      userEmail.toLowerCase().includes(search.toLowerCase());
    const matchesScore = scoreFilter ? String(resume.analysis?.score || "").includes(scoreFilter) : true;
    const matchesSkill = skillFilter
      ? (resume.analysis?.skills || []).some((skill: string) => skill.toLowerCase().includes(skillFilter.toLowerCase()))
      : true;
    return matchesSearch && matchesScore && matchesSkill;
  });

  // Stats: show only non-admin user count
  const stats = [
    { title: "Total Users", value: Math.max(users.length - 1, 0), icon: Users, color: "bg-blue-500", trend: "+12%" },
    { title: "Total Resumes", value: resumes.length, icon: FileText, color: "bg-emerald-500", trend: "+8%" },
    { title: "Avg Score", value: Math.round(resumes.reduce((acc, r) => acc + (r.analysis?.score || 0), 0) / resumes.length) || 0, icon: Star, color: "bg-yellow-500", trend: "+5%" },
    { title: "Active Today", value: Math.floor(nonAdminUsers.length * 0.6), icon: TrendingUp, color: "bg-purple-500", trend: "+15%" }
  ];

  if (loading || !tokenChecked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-lg font-medium text-gray-600 text-center max-w-xs">Loading Dashboard...</p>
      </div>
    );
  }

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Admin Navbar (styled like user dashboard) */}
      <header className="w-full bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-2 lg:px-1 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 lg:h-8 lg:w-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm lg:text-xl font-bold text-[#0B2E1C] tracking-tight">
              Admin <span className="text-orange-500">Dashboard</span>
            </span>
          </div>
          {/* Logout Button */}
          <button
            onClick={() => {
              localStorage.removeItem('token');
              clearChatData(); // Clear all chat messages from localStorage
              toast.success('Logged out successfully!', { className: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' });
              setTimeout(() => {
                router.push('/');
              }, 1200);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-medium shadow-lg transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>
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
      {/* End Admin Navbar */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.04 }}
              className="relative rounded-3xl p-6 flex flex-col items-start justify-between overflow-hidden group transition-all duration-300 hover:shadow-2xl"
              style={{
                minHeight: '140px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.30) 60%, rgba(200,220,255,0.18) 100%)',
                boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
                border: '1.5px solid rgba(255,255,255,0.35)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
              }}
            >
              {/* Futuristic Glow */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/10 rounded-full blur-2xl z-0 group-hover:scale-110 transition-transform duration-300" />
              {/* Icon with glass effect */}
              <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-white/60 to-blue-100/60 shadow-lg mb-3 border border-white/40">
                <stat.icon className="w-7 h-7 text-blue-500 group-hover:text-indigo-600 transition-colors duration-300" />
              </div>
              <div className="relative z-10">
                <div className="text-sm font-semibold text-gray-700 mb-1 tracking-wide uppercase opacity-80">
                  {stat.title}
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#0B2E1C] mb-1 flex items-end gap-2">
                  <CountUp end={stat.value} duration={1.2} separator="," />
                </div>
                <div className="text-xs font-bold text-emerald-500 mt-1 flex items-center gap-1">
                  <span>{stat.trend}</span>
                  <span className="w-2 h-2 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full animate-pulse" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-2 mb-6 bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg"
        >
          {[
            { id: "overview", label: "Overview", icon: Eye },
            { id: "users", label: "Users", icon: Users },
            { id: "resumes", label: "Resumes", icon: FileText }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/70"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Search and Filters */}
        {(activeTab === "users" || activeTab === "resumes") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                {activeTab === "resumes" && (
                  <>
                    {/* Score Filter */}
                    <div className="lg:w-48">
                      <div className="relative">
                        <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-500" />
                        <input
                          type="text"
                          placeholder="Filter by score"
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                          value={scoreFilter}
                          onChange={e => setScoreFilter(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Skill Filter */}
                    <div className="lg:w-48">
                      <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-500" />
                        <input
                          type="text"
                          placeholder="Filter by skill"
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          value={skillFilter}
                          onChange={e => setSkillFilter(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Recent Users
                  </h3>
                  <div className="space-y-3">
                    {users.slice(0, 3).map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {user.role}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Top Resumes */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    Top Scoring Resumes
                  </h3>
                  <div className="space-y-3">
                    {resumes
                      .sort((a, b) => (b.analysis?.score || 0) - (a.analysis?.score || 0))
                      .slice(0, 3)
                      .map((resume, index) => (
                        <motion.div
                          key={resume.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{resume.user?.name}</p>
                            <p className="text-sm text-gray-500">{resume.user?.email}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-yellow-600">{resume.analysis?.score}</div>
                            <div className="text-xs text-gray-500">Score</div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "users" && (
            <motion.div
              key="users"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold">ID</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">User</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-blue-50 transition-colors group"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.id}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{user.name || "N/A"}</div>
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700`}>
                              USER
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "resumes" && (
            <motion.div
              key="resumes"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Resume ID</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">User</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Score</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Skills</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Uploaded</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredResumes.map((resume, index) => (
                        <motion.tr
                          key={resume.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-indigo-50 transition-colors group"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{resume.id}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-lg flex items-center justify-center">
                                <FileText className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <div className="font-medium text-blue-700">{resume.user?.name || resume.user?.email}</div>
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {resume.user?.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="font-bold text-indigo-700">
                                {resume.analysis?.score ?? "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {(resume.analysis?.skills || []).length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-xs relative">
                                {resume.analysis.skills.slice(0, 3).map((skill: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {resume.analysis.skills.length > 3 && (
                                  <>
                                    <button
                                      className="text-xs text-blue-600 underline px-2 py-1 focus:outline-none"
                                      onClick={() => setOpenSkillsDropdown(openSkillsDropdown === resume.id ? null : resume.id)}
                                      type="button"
                                    >
                                      View all skills
                                    </button>
                                    {openSkillsDropdown === resume.id && (
                                      <div ref={skillsDropdownRef} className="absolute left-0 top-8 z-20 bg-white border border-blue-200 rounded-xl shadow-lg p-3 mt-1 min-w-[180px] max-w-[320px] flex flex-wrap gap-2">
                                        {resume.analysis.skills.map((skill: string, idx: number) => (
                                          <span
                                            key={idx}
                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                                          >
                                            {skill}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            ) : (
                              <span className="italic text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(resume.createdAt).toLocaleDateString()}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}