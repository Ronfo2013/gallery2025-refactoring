import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import { isSuperAdmin } from '../../services/platform/platformService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'superadmin' | 'cliente';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isLoading } = useFirebaseAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        setIsAuthorized(false);
        return;
      }

      if (!requiredRole) {
        setIsAuthorized(true);
        return;
      }

      try {
        if (requiredRole === 'superadmin') {
          const isSA = await isSuperAdmin(user.uid);
          setIsAuthorized(isSA);
        } else if (requiredRole === 'cliente') {
          // Check if user exists in superusers collection
          const superUserDoc = await getDoc(doc(db, 'superusers', user.uid));
          setIsAuthorized(superUserDoc.exists());
        }
      } catch (error) {
        console.error('Error checking authorization:', error);
        setIsAuthorized(false);
      }
    };

    if (!isLoading) {
      checkRole();
    }
  }, [user, isLoading, requiredRole]);

  if (isLoading || isAuthorized === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner spinner-lg mb-4 mx-auto border-t-accent-indigo"></div>
          <p className="text-slate-400 animate-pulse">Verifica autorizzazioni...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login but save the current location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAuthorized === false) {
    // User is logged in but not authorized for this role
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
