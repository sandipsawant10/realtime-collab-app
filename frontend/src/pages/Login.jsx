import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authApi.js";
import styles from "./Login.module.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!email || !password) {
        setError("All fields are required");
        return;
      }
      const response = await login(email, password);
      if (!response) {
        setError("Login failed");
        return;
      }
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);
      setEmail("");
      setPassword("");
      navigate("/");
    } catch (error) {
      setError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.formContainer}>
        {/* Sign in heading */}
        <h2 className={styles.signInHeading}>Sign in to Colab App</h2>

        {/* Sign up link */}
        <p className={styles.signUpPrompt}>
          Don't have an account?{" "}
          <Link to="/register" className={styles.signUpLink}>
            Sign up
          </Link>
        </p>

        {/* Error message */}
        {error && <div className={styles.errorMessage}>{error}</div>}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              required
              placeholder="hello@example.com"
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div className={styles.passwordInputWrapper}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                required
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                disabled={loading}
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.continueBtn}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
