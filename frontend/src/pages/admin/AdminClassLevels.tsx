import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit } from "lucide-react";
import { classLevelService, ClassLevel } from "@/services/classLevelService";

const AdminClassLevels = () => {
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newClassLevel, setNewClassLevel] = useState({
    name: "",
    displayName: "",
    description: "",
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchClassLevels();
  }, []);

  const fetchClassLevels = async () => {
    try {
      setLoading(true);
      const response = await classLevelService.getAllClassLevels();
      setClassLevels(response.data || response);
    } catch (err) {
      console.error("Failed to fetch class levels:", err);
      setError("Failed to load class levels");
    } finally {
      setLoading(false);
    }
  };

  const handleAddClassLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassLevel.name || !newClassLevel.displayName) {
      setError("Name and display name are required");
      return;
    }

    try {
      await classLevelService.createClassLevel(newClassLevel);
      setNewClassLevel({
        name: "",
        displayName: "",
        description: "",
        order: 0,
        isActive: true,
      });
      setShowAddForm(false);
      await fetchClassLevels();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create class level");
    }
  };

  const handleUpdateClassLevel = async (id: string) => {
    const level = classLevels.find((c) => c.id === id);
    if (!level) return;

    try {
      await classLevelService.updateClassLevel(id, level);
      setEditingId(null);
      await fetchClassLevels();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update class level");
    }
  };

  const handleDeleteClassLevel = async (id: string) => {
    if (!confirm("Are you sure you want to delete this class level?")) return;

    try {
      await classLevelService.deleteClassLevel(id);
      setClassLevels(classLevels.filter((c) => c.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete class level");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex justify-between items-center"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Class Levels
          </h1>
          <p className="text-muted-foreground">
            Manage class levels (e.g., 9th, 10th, 11th, 12th grade)
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-accent text-primary-foreground font-semibold hover:opacity-90"
        >
          <Plus className="w-5 h-5" />
          New Class Level
        </button>
      </motion.div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 mb-4">
          {error}
        </div>
      )}

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 mb-6"
        >
          <h3 className="font-display text-lg font-bold text-foreground mb-4">
            Create New Class Level
          </h3>
          <form onSubmit={handleAddClassLevel} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name (e.g., class-9)"
                value={newClassLevel.name}
                onChange={(e) =>
                  setNewClassLevel({ ...newClassLevel, name: e.target.value })
                }
                className="px-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
              />
              <input
                type="text"
                placeholder="Display Name (e.g., Class 9th)"
                value={newClassLevel.displayName}
                onChange={(e) =>
                  setNewClassLevel({
                    ...newClassLevel,
                    displayName: e.target.value,
                  })
                }
                className="px-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
              />
            </div>
            <textarea
              placeholder="Description"
              value={newClassLevel.description}
              onChange={(e) =>
                setNewClassLevel({
                  ...newClassLevel,
                  description: e.target.value,
                })
              }
              className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg gradient-accent text-primary-foreground font-semibold hover:opacity-90"
              >
                Create Class Level
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent/10"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div className="glass-panel p-12 text-center text-muted-foreground">
          Loading class levels...
        </div>
      ) : classLevels.length === 0 ? (
        <div className="glass-panel p-12 text-center text-muted-foreground">
          No class levels found. Create your first class level to get started.
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
          }}
          className="glass-panel overflow-x-auto"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-semibold text-foreground">
                  Name
                </th>
                <th className="text-left p-4 font-semibold text-foreground">
                  Display Name
                </th>
                <th className="text-left p-4 font-semibold text-foreground">
                  Order
                </th>
                <th className="text-left p-4 font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {classLevels.map((level) => (
                <tr
                  key={level.id}
                  className="border-b border-border hover:bg-accent/5"
                >
                  <td className="p-4">
                    {editingId === level.id ? (
                      <input
                        type="text"
                        value={level.name}
                        onChange={(e) =>
                          setClassLevels(
                            classLevels.map((c) =>
                              c.id === level.id
                                ? { ...c, name: e.target.value }
                                : c,
                            ),
                          )
                        }
                        className="px-2 py-1 rounded border border-border bg-card text-foreground"
                      />
                    ) : (
                      <span className="font-mono">{level.name}</span>
                    )}
                  </td>
                  <td className="p-4">
                    {editingId === level.id ? (
                      <input
                        type="text"
                        value={level.displayName}
                        onChange={(e) =>
                          setClassLevels(
                            classLevels.map((c) =>
                              c.id === level.id
                                ? { ...c, displayName: e.target.value }
                                : c,
                            ),
                          )
                        }
                        className="px-2 py-1 rounded border border-border bg-card text-foreground"
                      />
                    ) : (
                      level.displayName
                    )}
                  </td>
                  <td className="p-4">
                    {editingId === level.id ? (
                      <input
                        type="number"
                        value={level.order}
                        onChange={(e) =>
                          setClassLevels(
                            classLevels.map((c) =>
                              c.id === level.id
                                ? { ...c, order: parseInt(e.target.value) }
                                : c,
                            ),
                          )
                        }
                        className="px-2 py-1 rounded border border-border bg-card text-foreground w-20"
                      />
                    ) : (
                      level.order
                    )}
                  </td>
                  <td className="p-4 flex gap-2">
                    {editingId === level.id ? (
                      <>
                        <button
                          onClick={() => handleUpdateClassLevel(level.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30 transition-colors text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 rounded-lg bg-gray-500/20 text-gray-600 hover:bg-gray-500/30 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingId(level.id)}
                          className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors text-sm"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClassLevel(level.id)}
                          className="flex items-center gap-2 px-3 py-1 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
};

export default AdminClassLevels;
