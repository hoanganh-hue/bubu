import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { MainLayout } from '@/components/layouts/main-layout'

import { Dashboard } from '@/pages/Dashboard';
import { JobsList } from '@/pages/JobsList';
import { Companies } from '@/pages/Companies';

import { useAuthStore } from '@/stores/auth-store'
import './index.css'



import { Login } from '@/pages/Login';

function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, user, setUser } = useAuthStore()

  React.useEffect(() => {
    // If a token exists, try to fetch user data
    if (token && !user) {
        // You would typically have a /api/auth/me or /api/auth/user endpoint
        // to get the user data from the token.
        // For now, we'll just set a placeholder user.
        // setUser({ id: '1', email: 'test@example.com', role: 'admin', is_active: true });
    }
  }, [token, user, setUser]);

  return <>{children}</>
}

function App() {
  const { token } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              {token ? (
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="jobs" element={<JobsList />} />
                  <Route path="companies" element={<Companies />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="export" element={<Export />} />
                  <Route path="admin/proxies" element={<AdminProxies />} />
                  <Route path="admin/captcha" element={<AdminCaptcha />} />
                  <Route path="admin/settings" element={<AdminSettings />} />
                </Route>
              ) : (
                <Route path="/login" element={<Login />} />
              )}
              <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  )
}

export default App