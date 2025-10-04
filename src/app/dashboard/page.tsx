'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import AdminDashboard from '@/components/AdminDashboard';
import ClientPortal from '@/components/ClientPortal';
import { useApiClient } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export default function DashboardPage() {
  const { isLoaded, isSignedIn, orgRole } = useAuth();
  const { user } = useUser();
  const apiClient = useApiClient();

  const { data: userInfo, isLoading } = useQuery({
    queryKey: ['user-info'],
    queryFn: async () => {
      const response = await apiClient.get('/users/info/');
      return response.data;
    },
    enabled: isSignedIn,
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      redirect('/sign-in');
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  // Show admin dashboard for admin users, client portal for regular users
  if (orgRole === 'org:admin') {
    return <AdminDashboard />;
  } else {
    return <ClientPortal />;
  }
}