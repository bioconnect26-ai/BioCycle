import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileClock,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { DashboardStats, userService } from "@/services/userService";

const REFRESH_INTERVAL_MS = 30000;

const statCards = (stats: DashboardStats) => [
  {
    label: "Total Cycles",
    value: stats.totalCycles,
    change: `${stats.updatedCyclesToday} updated today`,
    icon: BookOpen,
  },
  {
    label: "Published Cycles",
    value: stats.publishedCycles,
    change: `${stats.pendingReviewCycles} awaiting review`,
    icon: CheckCircle2,
  },
  {
    label: "Online Users",
    value: stats.onlineUsers,
    change: `${stats.activeUsers} active accounts`,
    icon: UserCheck,
  },
  {
    label: "Pending Approvals",
    value: stats.pendingApproval,
    change: `${stats.newUsersThisWeek} new this week`,
    icon: Clock3,
  },
];

const emptyStats: DashboardStats = {
  totalUsers: 0,
  activeUsers: 0,
  totalEditors: 0,
  onlineUsers: 0,
  lockedUsers: 0,
  newUsersThisWeek: 0,
  totalCycles: 0,
  publishedCycles: 0,
  draftCycles: 0,
  pendingReviewCycles: 0,
  updatedCyclesToday: 0,
  newCyclesThisWeek: 0,
  activeEditors: 0,
  pendingApproval: 0,
  recentActivity: [],
  recentUsers: [],
  recentCycles: [],
  activitySummary: {},
  topContributors: [],
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45 },
  }),
};

const statusBadge: Record<string, string> = {
  active: "bg-emerald/10 text-emerald",
  inactive: "bg-slate-500/10 text-slate-500",
  pending: "bg-amber-500/10 text-amber-600",
  published: "bg-emerald/10 text-emerald",
  draft: "bg-sky-500/10 text-sky-600",
  pending_review: "bg-amber-500/10 text-amber-600",
};

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState<DashboardStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async (showLoader = false) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        const data = await userService.getDashboardStats();
        if (!isMounted) return;

        setDashboard(data);
        setLastUpdated(new Date().toLocaleTimeString());
        setError(null);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        if (isMounted) {
          setError("Failed to load dashboard statistics");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData(true);
    const intervalId = window.setInterval(
      () => fetchDashboardData(false),
      REFRESH_INTERVAL_MS,
    );

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const cards = statCards(dashboard);

  if (error && loading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Live platform snapshot for users, content velocity, and moderation.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-2 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-emerald" />
          Auto-refresh every 30s
          {lastUpdated ? <span>• Updated {lastUpdated}</span> : null}
        </div>
      </motion.div>

      {error ? (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="glass-panel p-6 card-hover-glow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-emerald" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-emerald" />
            </div>
            <div className="font-display text-3xl font-bold text-foreground">
              {loading ? "..." : stat.value}
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="glass-panel p-6 xl:col-span-2"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Content Operations
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Publishing queue and editing throughput across the library.
              </p>
            </div>
            <Activity className="h-4 w-4 text-emerald" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
              <div className="text-xs text-muted-foreground">Drafts</div>
              <div className="mt-2 text-2xl font-display font-bold text-foreground">
                {dashboard.draftCycles}
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
              <div className="text-xs text-muted-foreground">Pending Review</div>
              <div className="mt-2 text-2xl font-display font-bold text-foreground">
                {dashboard.pendingReviewCycles}
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
              <div className="text-xs text-muted-foreground">Updated Today</div>
              <div className="mt-2 text-2xl font-display font-bold text-foreground">
                {dashboard.updatedCyclesToday}
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
              <div className="text-xs text-muted-foreground">New This Week</div>
              <div className="mt-2 text-2xl font-display font-bold text-foreground">
                {dashboard.newCyclesThisWeek}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {dashboard.recentCycles.map((cycle) => (
              <div
                key={cycle.id}
                className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-background/30 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {cycle.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Updated by {cycle.updater} • {cycle.lastUpdated}
                  </div>
                </div>
                <span
                  className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
                    statusBadge[cycle.status] || "bg-slate-500/10 text-slate-500"
                  }`}
                >
                  {cycle.status.replace("_", " ")}
                </span>
              </div>
            ))}
            {!loading && dashboard.recentCycles.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No cycle updates yet.
              </div>
            ) : null}
          </div>
        </motion.div>

        <motion.div
          custom={5}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="glass-panel p-6"
        >
          <h2 className="font-display text-lg font-bold text-foreground mb-5">
            User Signals
          </h2>

          <div className="space-y-3 mb-6">
            <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
              <div className="text-xs text-muted-foreground">Total Users</div>
              <div className="mt-2 text-2xl font-display font-bold text-foreground">
                {dashboard.totalUsers}
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
              <div className="text-xs text-muted-foreground">Editors</div>
              <div className="mt-2 text-2xl font-display font-bold text-foreground">
                {dashboard.totalEditors}
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
              <div className="text-xs text-muted-foreground">Locked Accounts</div>
              <div className="mt-2 text-2xl font-display font-bold text-foreground">
                {dashboard.lockedUsers}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {dashboard.recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/30 p-4"
              >
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {user.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {user.email}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      user.isOnline
                        ? "bg-emerald/10 text-emerald"
                        : statusBadge[user.status] || "bg-slate-500/10 text-slate-500"
                    }`}
                  >
                    {user.isOnline ? "online" : user.status}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {user.lastSeen}
                  </div>
                </div>
              </div>
            ))}
            {!loading && dashboard.recentUsers.length === 0 ? (
              <div className="text-sm text-muted-foreground">No user activity yet.</div>
            ) : null}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          custom={6}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="glass-panel p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-foreground">
              Recent Activity
            </h2>
            <FileClock className="h-4 w-4 text-emerald" />
          </div>
          <div className="space-y-3">
            {dashboard.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0"
              >
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {activity.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    by {activity.user}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            ))}
            {!loading && dashboard.recentActivity.length === 0 ? (
              <div className="text-sm text-muted-foreground">No activity logged yet.</div>
            ) : null}
          </div>
        </motion.div>

        <motion.div
          custom={7}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="glass-panel p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-foreground">
              Team Throughput
            </h2>
            <Users className="h-4 w-4 text-emerald" />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
              <div className="text-xs text-muted-foreground">Creates</div>
              <div className="mt-2 text-xl font-display font-bold text-foreground">
                {dashboard.activitySummary.create || 0}
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
              <div className="text-xs text-muted-foreground">Edits</div>
              <div className="mt-2 text-xl font-display font-bold text-foreground">
                {dashboard.activitySummary.edit || 0}
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
              <div className="text-xs text-muted-foreground">Publishes</div>
              <div className="mt-2 text-xl font-display font-bold text-foreground">
                {dashboard.activitySummary.publish || 0}
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
              <div className="text-xs text-muted-foreground">Approvals</div>
              <div className="mt-2 text-xl font-display font-bold text-foreground">
                {dashboard.activitySummary.approve || 0}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {dashboard.topContributors.map((contributor) => (
              <div
                key={contributor.id}
                className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/30 p-4"
              >
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {contributor.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {contributor.role}
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald/10 px-3 py-1.5 text-xs font-medium text-emerald">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {contributor.actions} actions
                </div>
              </div>
            ))}
            {!loading && dashboard.topContributors.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Contributor rankings will appear as admins and editors work.
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
