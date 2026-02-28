import { useState } from "react";
import { register } from "../services/authApi.js";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Register.module.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!username || !email || !password) {
        setError("All fields are required");
        setLoading(false);
        return;
      }
      const response = await register(username, email, password);
      if (!response) {
        setError("Registration failed");
        setLoading(false);
        return;
      }
      setUsername("");
      setEmail("");
      setPassword("");
      navigate("/login");
    } catch (error) {
      setError(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.formContainer}>
        {/* Sign up heading */}
        <h2 className={styles.signUpHeading}>Create your account</h2>

        {/* Sign in link */}
        <p className={styles.signInPrompt}>
          Already have an account?{" "}
          <Link to="/login" className={styles.signInLink}>
            Sign in
          </Link>
        </p>

        {/* Error message */}
        {error && <div className={styles.errorMessage}>{error}</div>}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              required
              placeholder="Choose a username"
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              disabled={loading}
            />
          </div>

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
                placeholder="Create a strong password"
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

          <button type="submit" className={styles.signUpBtn} disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
