# Frontend-Backend Integration Guide

## 🔗 Connecting React Frontend to Express Backend

This guide shows how to integrate your BioCycle frontend with the backend API.

---

## 1. Setup API Base URL

### Create API Service (Frontend)

Create `src/services/api.js`:

```javascript
import axios from "axios";

// Use environment variable or default
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`,
            {
              refreshToken,
            },
          );
          localStorage.setItem("accessToken", data.accessToken);
          return apiClient(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
```

### Add Environment Variable

Create `.env.local` in frontend:

```
VITE_API_URL=http://localhost:5000/api
```

---

## 2. Authentication Flow

### Login Service

```javascript
// src/services/authService.js
import apiClient from "./api";

export const authService = {
  login: async (email, password) => {
    const { data } = await apiClient.post("/auth/login", { email, password });
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  },

  register: async (email, password, fullName) => {
    const { data } = await apiClient.post("/auth/register", {
      email,
      password,
      fullName,
    });
    return data;
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },

  getProfile: async () => {
    const { data } = await apiClient.get("/auth/profile");
    return data;
  },
};
```

### Update LoginPage Component

```jsx
// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.login(email, password);
      const user = JSON.parse(localStorage.getItem('user'));

      // Redirect based on role
      if (['admin', 'super_admin'].includes(user.role)) {
        navigate('/admin');
      } else if (user.role === 'editor') {
        navigate('/admin/content');
      } else {
        navigate('/explore');
      }

      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Login failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... JSX remains the same, just add loading state to form
  );
}
```

---

## 3. Content Management

### Cycles Service

```javascript
// src/services/cycleService.js
import apiClient from "./api";

export const cycleService = {
  // Get all cycles
  getAllCycles: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({
      page,
      limit,
      ...filters,
    });
    const { data } = await apiClient.get(`/cycles?${params}`);
    return data;
  },

  // Get cycle by slug (public)
  // only published cycles are visible without authentication; drafts
  // and pending_review require a token belonging to the author or an admin.
  getCycleBySlug: async (slug) => {
    const { data } = await apiClient.get(`/cycles/slug/${slug}`);
    return data;
  },

  // Create cycle
  createCycle: async (cycleData) => {
    const { data } = await apiClient.post("/cycles", cycleData);
    return data;
  },

  // Update cycle
  updateCycle: async (cycleId, cycleData) => {
    const { data } = await apiClient.put(`/cycles/${cycleId}`, cycleData);
    return data;
  },

  // Publish cycle (admin)
  publishCycle: async (cycleId) => {
    const { data } = await apiClient.put(`/cycles/${cycleId}/publish`);
    return data;
  },

  // Delete cycle (admin)
  deleteCycle: async (cycleId) => {
    const { data } = await apiClient.delete(`/cycles/${cycleId}`);
    return data;
  },
};
```

### Update AdminContent Component

```jsx
// src/pages/admin/AdminContent.tsx
import { useEffect, useState } from "react";
import { cycleService } from "@/services/cycleService";
import { useQuery } from "@tanstack/react-query";

const AdminContent = () => {
  const { data: cycles, isLoading } = useQuery({
    queryKey: ["cycles"],
    queryFn: () => cycleService.getAllCycles(1, 10),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <h1 className="font-display text-3xl font-bold text-foreground mb-2">
        Content Management
      </h1>
      <p className="text-muted-foreground">Manage your biology cycles.</p>

      <div className="mt-8">
        {cycles?.data?.map((cycle) => (
          <div key={cycle.id} className="p-4 border rounded-lg mb-4">
            <h3>{cycle.title}</h3>
            <p>{cycle.description}</p>
            <span className="badge">{cycle.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminContent;
```

---

## 4. User Management (Admin)

### Users Service

```javascript
// src/services/userService.js
import apiClient from "./api";

export const userService = {
  // Get all users
  getAllUsers: async (page = 1, limit = 10) => {
    const { data } = await apiClient.get(`/users?page=${page}&limit=${limit}`);
    return data;
  },

  // Get pending editors
  getPendingEditors: async () => {
    const { data } = await apiClient.get("/users/pending");
    return data;
  },

  // Approve editor
  approveEditor: async (userId) => {
    const { data } = await apiClient.put(`/users/${userId}/approve`);
    return data;
  },

  // Reject editor
  rejectEditor: async (userId) => {
    const { data } = await apiClient.put(`/users/${userId}/reject`);
    return data;
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    const { data } = await apiClient.get("/users/stats");
    return data;
  },
};
```

### Update AdminUsers Component

```jsx
// src/pages/admin/AdminUsers.tsx
import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import { Button } from "@/components/ui/button";

const AdminUsers = () => {
  const { data: pendingEditors, refetch } = useQuery({
    queryKey: ["pendingEditors"],
    queryFn: () => userService.getPendingEditors(),
  });

  const handleApprove = async (userId) => {
    try {
      await userService.approveEditor(userId);
      refetch();
    } catch (error) {
      console.error("Error approving editor:", error);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <h1 className="font-display text-3xl font-bold text-foreground mb-2">
        Pending Editors
      </h1>

      {pendingEditors?.data?.map((user) => (
        <div
          key={user.id}
          className="flex justify-between items-center p-4 border rounded-lg mb-4"
        >
          <div>
            <h3>{user.fullName}</h3>
            <p className="text-gray-500">{user.email}</p>
          </div>
          <Button onClick={() => handleApprove(user.id)}>Approve</Button>
        </div>
      ))}
    </div>
  );
};

export default AdminUsers;
```

---

## 5. Protected Routes

### Create Protected Route Component

```jsx
// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children, requiredRoles = [] }) {
  const token = localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
}
```

### Update App Routes

```jsx
// src/App.tsx
import { ProtectedRoute } from "./components/ProtectedRoute";

<Routes>
  {/* Public */}
  <Route element={<PublicLayout />}>
    <Route path="/" element={<Index />} />
    <Route path="/explore" element={<ExplorePage />} />
    <Route path="/login" element={<LoginPage />} />
  </Route>

  {/* Admin Protected */}
  <Route
    path="/admin"
    element={
      <ProtectedRoute requiredRoles={["super_admin", "admin", "editor"]}>
        <AdminLayout />
      </ProtectedRoute>
    }
  >
    <Route index element={<AdminDashboard />} />
    <Route path="content" element={<AdminContent />} />
    <Route
      path="users"
      element={
        <ProtectedRoute requiredRoles={["super_admin", "admin"]}>
          <AdminUsers />
        </ProtectedRoute>
      }
    />
  </Route>
</Routes>;
```

---

## 6. Complete Example: Create Cycle Form

```jsx
// src/pages/admin/CreateCycleForm.tsx
import { useState } from "react";
import { cycleService } from "@/services/cycleService";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function CreateCycleForm() {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    categoryId: "",
    difficulty: "Beginner",
    videoUrl: "",
    tags: [],
    steps: [{ title: "", description: "", detail: "", memoryTrick: "" }],
    quickFacts: [{ label: "", value: "" }],
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await cycleService.createCycle(formData);
      toast({
        title: "Success",
        description: "Cycle created successfully!",
      });
      navigate("/admin/content");
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create cycle",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [
        ...formData.steps,
        { title: "", description: "", detail: "", memoryTrick: "" },
      ],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium mb-1">Slug</label>
        <input
          type="text"
          required
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          required
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full px-4 py-2 border rounded-lg h-32"
        />
      </div>

      {/* Steps */}
      <div>
        <label className="block text-sm font-medium mb-2">Steps</label>
        {formData.steps.map((step, idx) => (
          <div key={idx} className="p-4 border rounded-lg mb-2">
            <input
              type="text"
              placeholder="Step Title"
              value={step.title}
              onChange={(e) => {
                const newSteps = [...formData.steps];
                newSteps[idx].title = e.target.value;
                setFormData({ ...formData, steps: newSteps });
              }}
              className="w-full mb-2 px-3 py-2 border rounded"
            />
            <textarea
              placeholder="Step Description"
              value={step.description}
              onChange={(e) => {
                const newSteps = [...formData.steps];
                newSteps[idx].description = e.target.value;
                setFormData({ ...formData, steps: newSteps });
              }}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addStep}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Add Step
        </button>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg"
      >
        {loading ? "Creating..." : "Create Cycle"}
      </button>
    </form>
  );
}
```

---

## 7. Error Handling & Toasts

### Create Error Interceptor

```javascript
// src/services/api.js (update)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle different error types
    if (error.response?.status === 404) {
      console.error("Resource not found");
    } else if (error.response?.status === 403) {
      console.error("Access denied");
    } else if (error.response?.status === 500) {
      console.error("Server error");
    }
    return Promise.reject(error);
  },
);
```

---

## 8. Testing Integration

### Test Checklist

```
✓ User Registration & Login
✓ Token Storage & Refresh
✓ Protected Routes
✓ Admin Dashboard Loading
✓ Cycle Listing
✓ Create Cycle
✓ Update Cycle
✓ Publish Cycle
✓ User Approval
✓ Error Handling
✓ CORS Issues
```

---

## 9. Troubleshooting

### CORS Errors

Update `.env` in backend:

```
CORS_ORIGIN=http://localhost:5173
```

### API Not Responding

Check:

- Backend running? (`npm run dev`)
- Correct API_URL in frontend `.env.local`
- No typos in route names

### Authentication Issues

```javascript
// Check stored tokens
console.log(localStorage.getItem("accessToken"));
console.log(localStorage.getItem("refreshToken"));
```

### Database Connection

Verify `.env` variables match Aiven PostgreSQL credentials

---

## 10. Production Deployment

### Frontend Environment

```
VITE_API_URL=https://api.yourdomain.com
```

### Backend Environment

```
CORS_ORIGIN=https://yourdomain.com
NODE_ENV=production
```

---

**Ready to integrate? Start with the API service and update components one by one!** 🚀
