// src/services/auth.js
import axios from "axios";
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export async function signup(data) {
  const res = await axios.post(`${BASE_URL}/auth/signup`, data);
  return res.data;
}

export async function login(data) {
  const res = await axios.post(`${BASE_URL}/auth/login`, data);
  return res.data;
}

export function saveToken(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getUser() {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function isLoggedIn() {
  return !!localStorage.getItem("token");
}