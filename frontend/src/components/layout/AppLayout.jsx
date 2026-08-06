import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Loader from '@/components/Loader';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="p-6">
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
