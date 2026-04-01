import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dna,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import FloatingParticles from "@/components/FloatingParticles";
import { authService } from "@/services/authService";

const LoginPage = () => {
  // Mode state
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Login state
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Register state
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerFullName, setRegisterFullName] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerValidationError, setRegisterValidationError] = useState("");

  const navigate = useNavigate();

  // redirect if already logged in
  const currentUser = authService.getCurrentUser();
  if (currentUser) {
    navigate(currentUser.role === "editor" ? "/admin/content" : "/admin");
    return null;
  }

  // Validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate password requirements (8+ chars, uppercase, lowercase, number)
  const isValidPassword = (pwd: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(pwd);
  };

  // LOGIN HANDLERS
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !isValidEmail(value)) {
      setValidationError("Please enter a valid email address");
    } else {
      setValidationError("");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (value && value.length < 8) {
      setValidationError("Password must be at least 8 characters");
    } else {
      setValidationError("");
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setError("");
    setIsLocked(false);
    setLoading(true);

    try {
      const response = await authService.login({ email, password });

      if (response.user) {
        if (
          response.user.role === "admin" ||
          response.user.role === "super_admin"
        ) {
          navigate("/admin");
        } else if (response.user.role === "editor") {
          navigate("/admin/content");
        } else {
          navigate("/");
        }
      }
    } catch (err: any) {
      if (err.isLocked) {
        setIsLocked(true);
        setError(
          err.lockMessage ||
            "Account temporarily locked. Try again in 30 minutes.",
        );
      } else if (err.response?.status === 429) {
        setError("Too many login attempts. Please try again later.");
      } else if (err.response?.status === 403) {
        setError(
          err.response?.data?.message ||
            "Account not active or pending approval",
        );
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || "Invalid email or password");
      } else {
        setError(
          err.response?.data?.message || "Login failed. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // REGISTER HANDLERS
  const handleRegisterFullNameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setRegisterFullName(value);
    if (value && (value.length < 2 || value.length > 100)) {
      setRegisterValidationError("Name must be between 2 and 100 characters");
    } else {
      setRegisterValidationError("");
    }
  };

  const handleRegisterEmailChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setRegisterEmail(value);
    if (value && !isValidEmail(value)) {
      setRegisterValidationError("Please enter a valid email address");
    } else {
      setRegisterValidationError("");
    }
  };

  const handleRegisterPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setRegisterPassword(value);
    if (value && !isValidPassword(value)) {
      setRegisterValidationError(
        "Password needs: 8+ chars, uppercase, lowercase, number",
      );
    } else {
      setRegisterValidationError("");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerFullName || !registerEmail || !registerPassword) {
      setRegisterError("All fields are required");
      return;
    }

    if (registerFullName.length < 2 || registerFullName.length > 100) {
      setRegisterError("Name must be between 2 and 100 characters");
      return;
    }

    if (!isValidEmail(registerEmail)) {
      setRegisterError("Please enter a valid email address");
      return;
    }

    if (!isValidPassword(registerPassword)) {
      setRegisterError(
        "Password needs: 8+ chars, 1 uppercase, 1 lowercase, 1 number",
      );
      return;
    }

    setRegisterError("");
    setRegisterLoading(true);

    try {
      const response = await authService.register({
        email: registerEmail,
        password: registerPassword,
        fullName: registerFullName,
      });

      setRegisterSuccess(true);
      // Reset form
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterFullName("");
      setRegisterValidationError("");

      // Switch back to login after 3 seconds
      setTimeout(() => {
        setIsRegisterMode(false);
        setRegisterSuccess(false);
      }, 3000);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setRegisterError("Email already registered");
      } else if (err.response?.status === 400) {
        setRegisterError(err.response?.data?.message || "Invalid input");
      } else {
        setRegisterError(
          err.response?.data?.message || "Registration failed. Try again.",
        );
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Illustration */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden gradient-hero items-center justify-center">
        <FloatingParticles count={20} />
        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl gradient-accent flex items-center justify-center glow-emerald">
            <Dna className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="font-display text-4xl font-bold gradient-text-hero mb-4">
            ByoBridge Admin
          </h2>
          <p className="text-muted-foreground text-lg">
            Manage biology cycles, users, and content from your dashboard.
          </p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg gradient-accent flex items-center justify-center">
              <Dna className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">
              ByoBridge
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-muted p-1 rounded-lg">
            <button
              onClick={() => {
                setIsRegisterMode(false);
                setError("");
                setRegisterError("");
                setRegisterSuccess(false);
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                !isRegisterMode
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsRegisterMode(true);
                setError("");
                setRegisterError("");
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                isRegisterMode
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Register
            </button>
          </div>

          {/* LOGIN FORM */}
          {!isRegisterMode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Welcome back
              </h1>
              <p className="text-muted-foreground mb-8">
                Sign in to access the admin dashboard.
              </p>

              {/* Error Messages */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-4 rounded-lg flex gap-3 items-start ${
                    isLocked
                      ? "bg-orange-500/10 border border-orange-500/20"
                      : "bg-red-500/10 border border-red-500/20"
                  }`}
                >
                  <AlertCircle
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      isLocked ? "text-orange-600" : "text-red-600"
                    }`}
                  />
                  <p
                    className={`text-sm ${
                      isLocked ? "text-orange-600" : "text-red-600"
                    }`}
                  >
                    {error}
                  </p>
                </motion.div>
              )}

              {/* Validation Error */}
              {validationError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-amber-600 mb-4"
                >
                  {validationError}
                </motion.p>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      disabled={isLocked || loading}
                      placeholder="admin@byobridge.com"
                      autoComplete="email"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 outline-none transition-all ${
                        email && !isValidEmail(email)
                          ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                          : "border-border focus:border-emerald focus:ring-emerald/20"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={handlePasswordChange}
                      disabled={isLocked || loading}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className={`w-full pl-11 pr-11 py-3 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 outline-none transition-all ${
                        password && password.length < 8
                          ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                          : "border-border focus:border-emerald focus:ring-emerald/20"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLocked || loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    isLocked ||
                    !email ||
                    !password ||
                    validationError !== ""
                  }
                  className="w-full py-3 rounded-xl gradient-accent text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow-emerald disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Signing in..."
                    : isLocked
                      ? "Account Locked"
                      : "Sign In"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back to Home
                </Link>
              </div>

              {/* Info Message */}
              {isLocked && (
                <motion.p
                  className="mt-4 text-xs text-muted-foreground text-center p-3 bg-muted rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Your account is temporarily locked for security. This protects
                  against unauthorized access. Please try again in 30 minutes.
                </motion.p>
              )}
            </motion.div>
          )}

          {/* REGISTER FORM */}
          {isRegisterMode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {registerSuccess ? (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center"
                  >
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </motion.div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Registration Successful!
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Your account has been created and is awaiting admin
                    approval.
                  </p>
                  <p className="text-sm text-emerald-600 font-medium">
                    You'll be able to sign in once approved.
                  </p>
                </div>
              ) : (
                <>
                  <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                    Create Account
                  </h1>
                  <p className="text-muted-foreground mb-8">
                    Register to get started. Your account will be reviewed by an
                    admin.
                  </p>

                  {/* Error Messages */}
                  {registerError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 rounded-lg flex gap-3 items-start bg-red-500/10 border border-red-500/20"
                    >
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
                      <p className="text-sm text-red-600">{registerError}</p>
                    </motion.div>
                  )}

                  {/* Validation Error */}
                  {registerValidationError && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-amber-600 mb-4"
                    >
                      {registerValidationError}
                    </motion.p>
                  )}

                  <form onSubmit={handleRegisterSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="text"
                          value={registerFullName}
                          onChange={handleRegisterFullNameChange}
                          disabled={registerLoading}
                          placeholder="John Doe"
                          autoComplete="name"
                          className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 outline-none transition-all ${
                            registerFullName &&
                            (registerFullName.length < 2 ||
                              registerFullName.length > 100)
                              ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                              : "border-border focus:border-emerald focus:ring-emerald/20"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="email"
                          value={registerEmail}
                          onChange={handleRegisterEmailChange}
                          disabled={registerLoading}
                          placeholder="student@university.edu"
                          autoComplete="email"
                          className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 outline-none transition-all ${
                            registerEmail && !isValidEmail(registerEmail)
                              ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                              : "border-border focus:border-emerald focus:ring-emerald/20"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Password
                      </label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Must contain: 8+ chars, uppercase, lowercase, number
                      </p>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type={showRegisterPassword ? "text" : "password"}
                          value={registerPassword}
                          onChange={handleRegisterPasswordChange}
                          disabled={registerLoading}
                          placeholder="MyPassword123"
                          autoComplete="new-password"
                          className={`w-full pl-11 pr-11 py-3 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 outline-none transition-all ${
                            registerPassword &&
                            !isValidPassword(registerPassword)
                              ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                              : "border-border focus:border-emerald focus:ring-emerald/20"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowRegisterPassword(!showRegisterPassword)
                          }
                          disabled={registerLoading}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {showRegisterPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={
                        registerLoading ||
                        !registerFullName ||
                        !registerEmail ||
                        !registerPassword ||
                        registerValidationError !== ""
                      }
                      className="w-full py-3 rounded-xl gradient-accent text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow-emerald disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {registerLoading ? "Creating account..." : "Register"}
                    </button>
                  </form>

                  <p className="mt-4 text-xs text-muted-foreground text-center p-3 bg-muted rounded-lg">
                    By registering, you agree that an admin must approve your
                    account before you can access the dashboard.
                  </p>
                </>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;

