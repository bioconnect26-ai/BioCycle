import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Users } from "lucide-react";
import { userService, User } from "@/services/userService";

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pendingEditors, setPendingEditors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "pending">("pending");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const allUsers = await userService.getAllUsers(1, 20);
        const pending = await userService.getPendingEditors();

        setUsers(allUsers.data || allUsers);
        setPendingEditors(pending.data || pending);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      await userService.approveEditor(userId);
      setPendingEditors(pendingEditors.filter((u) => u.id !== userId));
    } catch (err) {
      console.error("Failed to approve editor:", err);
      alert("Failed to approve editor");
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await userService.rejectEditor(userId);
      setPendingEditors(pendingEditors.filter((u) => u.id !== userId));
    } catch (err) {
      console.error("Failed to reject editor:", err);
      alert("Failed to reject editor");
    }
  };

  const tabVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          User Management
        </h1>
        <p className="text-muted-foreground mb-8">
          Manage editors and admin accounts.
        </p>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 mb-4">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
              activeTab === "pending"
                ? "border-emerald text-emerald"
                : "border-transparent text-muted-foreground"
            }`}
          >
            Pending Approvals ({pendingEditors.length})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
              activeTab === "all"
                ? "border-emerald text-emerald"
                : "border-transparent text-muted-foreground"
            }`}
          >
            All Users ({users.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="glass-panel p-12 text-center text-muted-foreground">
            Loading users...
          </div>
        ) : activeTab === "pending" ? (
          <motion.div variants={tabVariants} initial="hidden" animate="visible">
            {pendingEditors.length === 0 ? (
              <div className="glass-panel p-12 text-center text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-3 opacity-50" />
                No pending approvals.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingEditors.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-panel p-4 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {user.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                      {user.about && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {user.about}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(user.id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald/10 text-emerald hover:bg-emerald/20 transition-colors text-sm font-medium"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(user.id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors text-sm font-medium"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            className="glass-panel overflow-x-auto"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-semibold text-foreground">
                    Name
                  </th>
                  <th className="text-left p-4 font-semibold text-foreground">
                    Email
                  </th>
                  <th className="text-left p-4 font-semibold text-foreground">
                    Role
                  </th>
                  <th className="text-left p-4 font-semibold text-foreground">
                    Status
                  </th>
                  <th className="text-left p-4 font-semibold text-foreground">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border hover:bg-accent/5 transition-colors"
                  >
                    <td className="p-4 font-medium text-foreground">
                      {user.name}
                    </td>
                    <td className="p-4 text-muted-foreground">{user.email}</td>
                    <td className="p-4">
                      <span className="inline-flex px-2 py-1 rounded bg-accent/20 text-accent text-xs font-medium">
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                          user.status === "active"
                            ? "bg-emerald/10 text-emerald"
                            : user.status === "pending_approval"
                              ? "bg-yellow/10 text-yellow"
                              : "bg-gray/10 text-gray"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminUsers;
