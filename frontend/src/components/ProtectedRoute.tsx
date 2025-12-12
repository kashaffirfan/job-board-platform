import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[]; // Optional: if we want to restrict by specific role (e.g. 'client')
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const loading = authContext?.loading;

  // 1. Wait for Auth Check to finish (prevents kicking you out while refreshing)
  if (loading) {
    return <div className="p-10 text-center">Loading...</div>; 
  }

  // 2. Not Logged In? -> Go to Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Logged In but Wrong Role? -> Go to Home
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    alert("You are not authorized to view this page."); // Optional feedback
    return <Navigate to="/" replace />;
  }

  // 4. Authorized? -> Render the requested page (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;