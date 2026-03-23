// src/components/AuthPage.js
import React, { useState } from "react";
import { signup, login, saveToken } from "../services/auth";
import styles from "./AuthPage.module.css";

export default function AuthPage({ onAuth }) {
  const [mode, setMode]       = useState("login"); // "login" | "signup"
  const [form, setForm]       = useState({ full_name: "", email: "", enrollment_no: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = mode === "signup" ? await signup(form) : await login(form);
      if (data.success) {
        saveToken(data.token, data.user);
        onAuth(data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>🎓</div>
        <h1 className={styles.title}>AssignmentAI</h1>
        <p className={styles.sub}>Powered by Hugging Face</p>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${mode === "login"  ? styles.active : ""}`} onClick={() => { setMode("login");  setError(""); }}>Login</button>
          <button className={`${styles.tab} ${mode === "signup" ? styles.active : ""}`} onClick={() => { setMode("signup"); setError(""); }}>Sign Up</button>
        </div>

        <form onSubmit={submit} className={styles.form}>
          {mode === "signup" && (
            <div className={styles.field}>
              <label>Full Name</label>
              <input name="full_name" type="text" placeholder="Rahul Sharma" value={form.full_name} onChange={handle} required />
            </div>
          )}

          <div className={styles.field}>
            <label>Email</label>
            <input name="email" type="email" placeholder="you@email.com" value={form.email} onChange={handle} required />
          </div>

          {mode === "signup" && (
            <div className={styles.field}>
              <label>Enrollment / Roll Number</label>
              <input name="enrollment_no" type="text" placeholder="21BCE1234" value={form.enrollment_no} onChange={handle} required />
            </div>
          )}

          <div className={styles.field}>
            <label>Password</label>
            <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle} required />
          </div>

          {error && <div className={styles.error}>❌ {error}</div>}

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>

        <p className={styles.switch}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>
            {mode === "login" ? "Sign Up" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}