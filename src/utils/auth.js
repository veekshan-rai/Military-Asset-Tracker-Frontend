// src/utils/auth.js
// Utility functions to manage authentication state in LocalStorage

const TOKEN_KEY = 'mat_token';
const USER_KEY = 'mat_user';

/**
 * Save login response data (JWT token and user info) to LocalStorage
 */
export const setSession = (authData) => {
  if (authData.token) {
    localStorage.setItem(TOKEN_KEY, authData.token);
  }
  
  const userInfo = {
    userId: authData.userId,
    username: authData.username,
    role: authData.role,
    assignedBaseId: authData.assignedBaseId,
    assignedBaseName: authData.assignedBaseName,
  };
  
  localStorage.setItem(USER_KEY, JSON.stringify(userInfo));
};

/**
 * Get stored JWT token
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Get stored user information (username, role, assignedBaseId, etc.)
 */
export const getUser = () => {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch (e) {
    return null;
  }
};

/**
 * Check if user is currently authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Clear session storage and log out
 */
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = '/login';
};
