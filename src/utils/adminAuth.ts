interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

/**
 * Get admin token from storage
 */
export const getAdminToken = (): string | null => {
  return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
};

/**
 * Get admin user data from storage
 */
export const getAdminUser = (): AdminUser | null => {
  const userStr = localStorage.getItem('admin_user') || sessionStorage.getItem('admin_user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * Check if admin is authenticated
 */
export const isAdminAuthenticated = (): boolean => {
  return !!getAdminToken();
};

/**
 * Logout admin - clear all admin data
 */
export const logoutAdmin = (): void => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  sessionStorage.removeItem('admin_token');
  sessionStorage.removeItem('admin_user');
};

/**
 * Set admin auth data after login
 */
export const setAdminAuth = (token: string, user: AdminUser, remember: boolean = false): void => {
  if (remember) {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(user));
  } else {
    sessionStorage.setItem('admin_token', token);
    sessionStorage.setItem('admin_user', JSON.stringify(user));
  }
};