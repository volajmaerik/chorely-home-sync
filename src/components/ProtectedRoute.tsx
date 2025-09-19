import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';
import { HouseholdSetup } from './HouseholdSetup';
import { SidebarInset } from './ui/sidebar';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { household, loading: householdLoading, createHousehold, joinHousehold } = useHousehold();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center animate-pulse">
          <div className="w-8 h-8 bg-primary/20 rounded-full mx-auto mb-4 animate-bounce"></div>
          <h1 className="text-xl font-medium text-foreground">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (householdLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center animate-pulse">
          <div className="w-8 h-8 bg-primary/20 rounded-full mx-auto mb-4 animate-bounce"></div>
          <h1 className="text-xl font-medium text-foreground">Setting up household...</h1>
        </div>
      </div>
    );
  }

  if (!household) {
    return (
      <HouseholdSetup 
        onCreateHousehold={createHousehold} 
        onJoinHousehold={joinHousehold}
        loading={false}
      />
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <SidebarInset className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
};