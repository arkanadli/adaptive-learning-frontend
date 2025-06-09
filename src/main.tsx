import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Toaster } from 'sonner';

import './index.css';

import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

import { AdminRoutes } from './routes/AdminRoutes';
import { SiswaRoutes } from './routes/SiswaRoutes';
import { GuruRoutes } from './routes/GuruRoutes';
import { KelasRoutes } from './routes/KelasRoutes';

import Profile from './pages/Profile';

import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './components/Layout/DashboardLayout';
import { AuthProvider } from './context/AuthContext';

import { Helmet } from 'react-helmet-async';
import { HelmetProvider } from 'react-helmet-async';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster richColors position="bottom-center" />
          <Routes>
            <Route path="/login" element={
              <>
                <Helmet>
                  <title>Login | Adaptive Learning</title>
                </Helmet>
                <Login />
              </>
            } />
            <Route 
              path="/forgot-password" 
              element={
                <>
                  <Helmet>
                    <title>Forgot Password | Adaptive Learning</title>
                  </Helmet>
                  <ForgotPassword />
                </>
              } 
            />
            <Route 
              path="/reset-password" 
              element={
                <>
                  <Helmet>
                    <title>Reset Password | Adaptive Learning</title>
                  </Helmet>
                  <ResetPassword />
                </>
              } 
            />
            <Route 
              path="/register" 
              element={
                <>
                  <Helmet>
                    <title>Register | Adaptive Learning</title>
                  </Helmet>
                  <Register />
                </>   
              } 
            />

            {AdminRoutes()}
            {SiswaRoutes()}
            {GuruRoutes()}
            {KelasRoutes()}

            <Route
              path="/profile"
              element={
                <PrivateRoute allowedRoles={['guru', 'siswa', 'admin']}>
                  <DashboardLayout>
                    <Helmet>
                      <title>Profile | Adaptive Learning</title>
                      
                    </Helmet>
                    <Profile />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />

            <Route 
              path="/unauthorized" 
              element={
                <>
                  <Helmet>
                    <title>Unauthorized | Adaptive Learning</title>
                    
                  </Helmet>
                  <Unauthorized/>
                </>
              } 
            />
            <Route 
              path="*" 
              element={
                <>
                  <Helmet>
                    <title>Not Found | Adaptive Learning</title>
                  </Helmet>
                  <NotFound />
                </>
              } 
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);