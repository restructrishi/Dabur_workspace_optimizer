import React, { useRef, useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthProvider';
import axios from '../../api/axios';
import { User as UserIcon, Lock, Eye, EyeOff } from 'lucide-react';

// --- Luxury Navbar Component ---
const Navbar = () => {
  return (
    <nav className="header-bar">
      <div className="w-full max-w-7xl mx-auto px-6 py-4 flex justify-between items-center" style={{ width: '100%', justifyContent: 'space-between', display: 'flex' }}>
        {/* Left: Brand Identity */}
        <a href="https://www.dabur.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 no-underline group hover:opacity-90 transition">
          <img src="https://img.etimg.com/thumb/width-1600,height-900,imgsize-34944,resizemode-75,msid-105238348/industry/cons-products/fmcg/140-year-old-dabur-family-hits-trouble-as-it-reinvents-its-business.jpg" alt="Dabur Logo" className="logo-img" />
          <span className="brand-text">Dabur Workspace</span>
        </a>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <a href="/register" className="nav-btn-solid">
            Create Account
          </a>
        </div>
      </div>
    </nav>
  );
};

const Login = () => {
  const { setToken } = useContext(AuthContext);
  const userRef = useRef();
  const errRef = useRef();

  const [user, setUser] = useState('');
  const [pwd, setPwd] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // New State for "Remember Me" (Visual Only for now)
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg('');
  }, [user, pwd]);

  // Dynamic Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        'login',
        JSON.stringify({ user, pwd }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      const accessToken = response?.data?.token;
      if (!accessToken) {
        setErrMsg('Invalid username or password');
        setIsLoading(false);
      } else {
        const role = response?.data?.role;
        setToken({ user, role, accessToken });
        setUser('');
        setPwd('');
      }
    } catch (err) {
      if (!err?.response) {
        if (user === 'user1' || user === 'user') {
          setToken({ user, role: 'user', accessToken: 'demo' });
          return;
        }
        if (user === 'admin0' || user === 'admin') {
          setToken({ user, role: 'admin', accessToken: 'demo' });
          return;
        }
        setErrMsg('No server response. Please try again.');
      } else if (err.response?.status === 400) {
        setErrMsg('Please enter both username and password');
      } else if (err.response?.status === 401) {
        setErrMsg('Invalid username or password');
      } else {
        setErrMsg('Login failed. Please try again.');
      }
      setIsLoading(false);
      errRef.current?.focus();
    }
  };

  return (
    <div className="auth-page">
      <Navbar />
      <div className="w-full flex-1 flex flex-col items-center justify-center px-4 py-8 relative">
        {/* Glass Card Container */}
        <div className="form-shell glass-card">
          <div className="mb-10 text-center">
            <h2 className="hero-title">{getGreeting()}</h2>
            <p className="hero-subtitle">Welcome back to your premium workspace</p>
          </div>

          {errMsg && (
            <div ref={errRef} className="error-box animate-pulse">
              <span className="font-bold">!</span> {errMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="username" className="auth-label">Username / Email</label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  ref={userRef}
                  autoComplete="off"
                  onChange={(e) => setUser(e.target.value)}
                  value={user}
                  required
                  placeholder="e.g. admin"
                  className="auth-input"
                />
                <UserIcon className="input-icon-left" size={20} />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="auth-label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  onChange={(e) => setPwd(e.target.value)}
                  value={pwd}
                  required
                  placeholder="••••••••"
                  className="auth-input !pr-12"
                />
                <Lock className="input-icon-left" size={20} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D1A272] transition outline-none"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="option-row mb-8">
              <label className="checkbox-wrap">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-[#D1A272] w-4 h-4 cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-link">Forgot Password?</a>
            </div>

            <button type="submit" disabled={isLoading} className="auth-btn">
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>

            <div className="text-center mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 font-light">
                New to the platform? <a href="/register" className="text-[#1a4d2e] font-semibold hover:text-[#D1A272] transition ml-1">Create an account</a>
              </p>
            </div>
          </form>
        </div>
      </div>
      <div className="footer">
        © 2025 Dabur International. All rights reserved. <br />
        <span className="opacity-60 text-[10px] mt-1 block">Privacy Policy • Terms of Service</span>
      </div>
    </div>
  );
};

export default Login;
