import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAdminAuthenticated } from '../../utils/adminAuth';

interface ProtectedAdminRouteProps {
  children?: React.ReactNode;
}

/**
 * Protects admin routes - redirects to login if not authenticated
 */
const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const isAuthenticated = isAdminAuthenticated();

  if (!isAuthenticated) {
    // Redirect to admin login if not authenticated
    return <Navigate to="/admin/login" replace />;
  }

  // Render children if provided, otherwise render outlet for nested routes
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedAdminRoute;