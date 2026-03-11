import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  Eye,
  Clock,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { userService } from "@/services/userService";

const AdminDashboard = () => {
  const [stats, setStats] = useState([
    {
      label: "Total Cycles",
      value: "0",
      change: "Loading...",
      icon: BookOpen,
    },
    {
      label: "Total Editors",
      value: "0",
      change: "Loading...",
      icon: Users,
    },
    {
      label: "Published Cycles",
      value: "0",
      change: "Loading...",
      icon: Eye,
    },
    {
      label: "Pending Approvals",
      value: "0",
      change: "Review needed",
      icon: Clock,
    },
  ]);

  const [recentActivity, setRecentActivity] = useState([
    { title: "Loading...", user: "System", time: "now" },
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const dashboardStats = await userService.getDashboardStats();

        setStats([
          {
            label: "Total Cycles",
            value: String(dashboardStats.totalCycles),
            change: `${dashboardStats.publishedCycles} published`,
            icon: BookOpen,
          },
          {
            label: "Total Users",
            value: String(dashboardStats.totalUsers),
            change: `${dashboardStats.activeEditors} editors`,
            icon: Users,
          },
          {
            label: "Published Cycles",
            value: String(dashboardStats.publishedCycles),
            change: `${dashboardStats.draftCycles} drafts`,
            icon: Eye,
          },
          {
            label: "Pending Approvals",
            value: String(dashboardStats.pendingApproval),
            change: "Review needed",
            icon: Clock,
          },
        ]);

        if (dashboardStats.recentActivity) {
          setRecentActivity(dashboardStats.recentActivity);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.5 },
    }),
  };

  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Overview of your BioCycles platform.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="glass-panel p-6 card-hover-glow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-emerald" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-emerald" />
            </div>
            <div className="font-display text-2xl font-bold text-foreground">
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stat.label}
            </div>
            <div className="text-xs text-emerald mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {stat.change}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={4}
        className="glass-panel p-6"
      >
        <h2 className="font-display text-lg font-bold text-foreground mb-4">
          Recent Activity
        </h2>
        <div className="space-y-3">
          {recentActivity.map((activity, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b border-border last:border-0"
            >
              <div>
                <div className="text-sm font-medium text-foreground">
                  {activity.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  by {activity.user}
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
