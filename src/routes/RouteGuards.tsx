import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ClientPortalGuard({
  fallback,
  children,
}: {
  fallback: ReactNode;
  children: ReactNode;
}) {
  const { token, isStaff } = useAuth();
  if (!token) {
    return <>{fallback}</>;
  }
  if (isStaff) {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
}

export function AdminConsoleGuard({
  fallback,
  children,
}: {
  fallback: ReactNode;
  children: ReactNode;
}) {
  const { token, isStaff } = useAuth();
  if (!token || !isStaff) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
