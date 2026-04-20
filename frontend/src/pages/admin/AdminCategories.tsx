import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit } from "lucide-react";
import { categoryService, Category } from "@/services/categoryService";

const emptyCategoryForm = {
  name: "",
  slug: "",
  description: "",
};

const unwrapCategory = (response: any): Category =>
  response?.category || response?.data || response;

const getErrorMessage = (err: any, fallback: string) =>
  err?.response?.data?.message || fallback;

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState(emptyCategoryForm);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState(emptyCategoryForm);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryService.getAllCategories();
      setCategories(response.data || response);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name || !newCategory.slug) {
      alert("Name and slug are required");
      return;
    }

    try {
      const created = await categoryService.createCategory(newCategory);
      setCategories((currentCategories) => [
        ...currentCategories,
        unwrapCategory(created),
      ]);
      setNewCategory(emptyCategoryForm);
      setShowAddForm(false);
      setError(null);
    } catch (err: any) {
      console.error("Failed to create category:", err);
      setError(getErrorMessage(err, "Failed to create category"));
    }
  };

  const startEditingCategory = (category: Category) => {
    if (!category.id) {
      setError("Cannot edit this category because it is missing an id.");
      return;
    }

    setEditingId(category.id);
    setEditCategory({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
    });
    setShowAddForm(false);
    setError(null);
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editCategory.name || !editCategory.slug) {
      setError("Name and slug are required");
      return;
    }

    try {
      const updated = await categoryService.updateCategory(id, editCategory);
      const updatedCategory = unwrapCategory(updated);

      setCategories((currentCategories) =>
        currentCategories.map((category) =>
          category.id === id ? { ...category, ...updatedCategory } : category,
        ),
      );
      setEditingId(null);
      setEditCategory(emptyCategoryForm);
      setError(null);
    } catch (err: any) {
      console.error("Failed to update category:", err);
      setError(getErrorMessage(err, "Failed to update category"));
    }
  };

  const cancelEditingCategory = () => {
    setEditingId(null);
    setEditCategory(emptyCategoryForm);
    setError(null);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await categoryService.deleteCategory(id);
      setCategories((currentCategories) =>
        currentCategories.filter((category) => category.id !== id),
      );
      if (editingId === id) cancelEditingCategory();
      setError(null);
    } catch (err: any) {
      console.error("Failed to delete category:", err);
      setError(getErrorMessage(err, "Failed to delete category"));
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
            Categories
          </h1>
          <p className="text-muted-foreground">
            Organize your biology cycles by category.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-accent text-primary-foreground font-semibold hover:opacity-90"
        >
          <Plus className="w-5 h-5" />
          New Category
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
            Create New Category
          </h3>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Category Name"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                className="px-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
              />
              <input
                type="text"
                placeholder="Slug (url-friendly)"
                value={newCategory.slug}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, slug: e.target.value })
                }
                className="px-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
              />
            </div>
            <textarea
              placeholder="Description"
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory({ ...newCategory, description: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg gradient-accent text-primary-foreground font-semibold hover:opacity-90"
              >
                Create Category
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
          Loading categories...
        </div>
      ) : categories.length === 0 ? (
        <div className="glass-panel p-12 text-center text-muted-foreground">
          No categories found. Create your first category to get started.
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {categories.map((category, i) => (
            <motion.div
              key={category.id || category.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel p-6 card-hover-glow"
            >
              {editingId === category.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Category Name"
                    value={editCategory.name}
                    onChange={(e) =>
                      setEditCategory({
                        ...editCategory,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Slug (url-friendly)"
                    value={editCategory.slug}
                    onChange={(e) =>
                      setEditCategory({
                        ...editCategory,
                        slug: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
                  />
                  <textarea
                    placeholder="Description"
                    value={editCategory.description}
                    onChange={(e) =>
                      setEditCategory({
                        ...editCategory,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateCategory(category.id)}
                      className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30 transition-colors text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditingCategory}
                      className="px-3 py-1 rounded-lg bg-gray-500/20 text-gray-600 hover:bg-gray-500/30 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-display font-bold text-foreground text-lg">
                        {category.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {category.slug}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditingCategory(category)}
                        className="p-2 hover:bg-accent rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                      {category.id && (
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>
                  {category.description && (
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  )}
                  {category.cycleCount !== undefined && (
                    <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                      {category.cycleCount} cycles
                    </div>
                  )}
                </>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default AdminCategories;
