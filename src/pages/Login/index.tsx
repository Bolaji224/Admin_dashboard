import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosAdmin from '../../utils/axios';
import logoUrl from "@/assets/images/logo.svg";
import illustrationUrl from "@/assets/images/illustration.svg";
import { FormInput, FormCheck } from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import clsx from "clsx";

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosAdmin.post('/v1/admin/login', {
        email,
        password,
      });

      if (response?.data?.status === 'success') {
        // Store admin token and info
        const { token, admin } = response.data.data;
        
        if (rememberMe) {
          localStorage.setItem('admin_token', token);
          localStorage.setItem('admin_user', JSON.stringify(admin));
        } else {
          sessionStorage.setItem('admin_token', token);
          sessionStorage.setItem('admin_user', JSON.stringify(admin));
        }

        // Redirect to admin dashboard
        navigate('/admin/dashboard');
      } else {
        setError(response?.data?.error || 'Login failed');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err?.response?.data?.error || 
        err?.response?.data?.message || 
        'Invalid credentials. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={clsx([
          "p-3 sm:px-8 relative h-screen lg:overflow-hidden bg-primary xl:bg-white dark:bg-darkmode-800 xl:dark:bg-darkmode-600",
          "before:hidden before:xl:block before:content-[''] before:w-[57%] before:-mt-[28%] before:-mb-[16%] before:-ml-[13%] before:absolute before:inset-y-0 before:left-0 before:transform before:rotate-[-4.5deg] before:bg-primary/20 before:rounded-[100%] before:dark:bg-darkmode-400",
          "after:hidden after:xl:block after:content-[''] after:w-[57%] after:-mt-[20%] after:-mb-[13%] after:-ml-[13%] after:absolute after:inset-y-0 after:left-0 after:transform after:rotate-[-4.5deg] after:bg-primary after:rounded-[100%] after:dark:bg-darkmode-700",
        ])}
      >
        <div className="container relative z-10 sm:px-10">
          <div className="block grid-cols-2 gap-4 xl:grid">
            {/* BEGIN: Login Info */}
            <div className="flex-col hidden min-h-screen xl:flex">
              <a href="" className="flex items-center pt-5 -intro-x">
                <img
                  alt="Admin Panel"
                  className="w-6"
                  src={logoUrl}
                />
                <span className="ml-3 text-lg text-white"> Admin Panel </span>
              </a>
              <div className="my-auto">
                <img
                  alt="Admin Panel"
                  className="w-1/2 -mt-16 -intro-x"
                  src={illustrationUrl}
                />
                <div className="mt-10 text-4xl font-medium leading-tight text-white -intro-x">
                  Welcome Back <br />
                  Admin Portal
                </div>
                <div className="mt-5 text-lg text-white -intro-x text-opacity-70 dark:text-slate-400">
                  Manage payments, withdrawals, users, and jobs
                </div>
              </div>
            </div>
            {/* END: Login Info */}

            {/* BEGIN: Login Form */}
            <div className="flex h-screen py-5 my-10 xl:h-auto xl:py-0 xl:my-0">
              <div className="w-full px-5 py-8 mx-auto my-auto bg-white rounded-md shadow-md xl:ml-20 dark:bg-darkmode-600 xl:bg-transparent sm:px-8 xl:p-0 xl:shadow-none sm:w-3/4 lg:w-2/4 xl:w-auto">
                <h2 className="text-2xl font-bold text-center intro-x xl:text-3xl xl:text-left">
                  Admin Sign In
                </h2>
                <div className="mt-2 text-center intro-x text-slate-400 xl:hidden">
                  Sign in to access the admin dashboard
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <form onSubmit={handleLogin} className="mt-8 intro-x">
                  <FormInput
                    type="email"
                    className="block px-4 py-3 intro-x min-w-full xl:min-w-[350px]"
                    placeholder="Admin Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <FormInput
                    type="password"
                    className="block px-4 py-3 mt-4 intro-x min-w-full xl:min-w-[350px]"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />

                  <div className="flex mt-4 text-xs intro-x text-slate-600 dark:text-slate-500 sm:text-sm">
                    <div className="flex items-center mr-auto">
                      <FormCheck.Input
                        id="remember-me"
                        type="checkbox"
                        className="mr-2 border"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={loading}
                      />
                      <label
                        className="cursor-pointer select-none"
                        htmlFor="remember-me"
                      >
                        Remember me
                      </label>
                    </div>
                  </div>

                  <div className="mt-5 text-center intro-x xl:mt-8 xl:text-left">
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full px-4 py-3 align-top xl:w-32"
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Login'}
                    </Button>
                  </div>
                </form>

                <div className="mt-10 text-center intro-x xl:mt-24 text-slate-600 dark:text-slate-500 xl:text-left">
                  <p className="text-xs">
                    Admin access only. Unauthorized access is prohibited.
                  </p>
                </div>
              </div>
            </div>
            {/* END: Login Form */}
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminLogin;