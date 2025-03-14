import React, { useState } from 'react';
import AdminLogin from '../components/Admin/AdminLogin';
import AdminDashboard from '../components/Admin/AdminDashboard';
import { useRouter } from 'next/router';

export default function Admin() {
  const router = useRouter();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  if (!isAdminLoggedIn) {
    return <AdminLogin onLogin={setIsAdminLoggedIn} />;
  }

  return (
    <AdminDashboard 
      onLogout={() => {
        setIsAdminLoggedIn(false);
        router.push('/');
      }} 
    />
  );
} 