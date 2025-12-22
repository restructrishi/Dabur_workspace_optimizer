import React, { useRef, useState, useEffect } from 'react';
import { Check, X, User as UserIcon, Lock, Eye, EyeOff } from 'lucide-react';
import axios from '../../api/axios';

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)\S{6,64}$/;

// --- Luxury Navbar Component (Shared) ---
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
          <a href="/login" className="nav-btn-solid">
            Sign In
          </a>
        </div>
      </div>
    </nav>
  );
};

const Register = () => {
  const userRef = useRef();
  const errRef = useRef();

  const [user, setUser] = useState('');
  const [validName, setValidName] = useState(false);
  const [userFocus, setUserFocus] = useState(false);

  const [pwd, setPwd] = useState('');
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);

  const [matchPwd, setMatchPwd] = useState('');
  const [validMatch, setValidMatch] = useState(false);

  const [errMsg, setErrMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setValidName(USER_REGEX.test(user));
  }, [user]);

  useEffect(() => {
    setValidPwd(PWD_REGEX.test(pwd));
    setValidMatch(pwd === matchPwd);
  }, [pwd, matchPwd]);

  useEffect(() => {
    setErrMsg('');
  }, [user, pwd, matchPwd]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validName || !validPwd || !validMatch) {
      setErrMsg('Please ensure all requirements are met');
      return;
    }

    try {
      const response = await axios.post('register', { user, pwd });
      console.log(response.data);
      setSuccess(true);

      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);

    } catch (error) {
      if (!error?.response) {
        setErrMsg('No server response. Please try again.');
      } else if (error.response?.status === 409) {
        setErrMsg('Username already taken. Please choose another.');
      } else {
        setErrMsg('Registration failed. Please try again.');
      }
      errRef.current?.focus();
    }
  };


  return (
    <div className="auth-page">
      <Navbar />
      <div className="w-full flex-1 flex flex-col items-center justify-center px-4 py-8 relative">
        <div className="form-shell glass-card">
          <div className="text-center mb-8">
            <h2 className="hero-title">Join The Team</h2>
            <p className="hero-subtitle">Create your premium account today</p>
          </div>

          {success ? (
            <div className="success-box animate-bounce">✓ Registration successful! Redirecting...</div>
          ) : (
            <>
              {errMsg && (
                <div ref={errRef} className="error-box animate-pulse">
                  <span className="font-bold">!</span> {errMsg}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="username" className="auth-label flex justify-between">
                    <span>Username</span>
                    <span className="opacity-80">
                      {user && (
                        validName ? <Check className="text-[#1a4d2e]" size={16} /> : <X className="text-red-500" size={16} />
                      )}
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="username"
                      ref={userRef}
                      autoComplete="off"
                      onChange={(e) => setUser(e.target.value)}
                      value={user}
                      required
                      placeholder="Username"
                      onFocus={() => setUserFocus(true)}
                      onBlur={() => setUserFocus(false)}
                      className={`auth-input ${user && !validName ? 'border-red-300 focus:border-red-400' : ''
                        } ${user && validName ? 'border-[#1a4d2e]' : ''}`}
                    />
                    <UserIcon className="input-icon-left" size={20} />
                  </div>
                  {userFocus && user && !validName && (
                    <p className="text-xs text-red-500 mt-2 pl-1 font-medium">
                      • 4-24 characters<br />
                      • Must start with a letter
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="auth-label flex justify-between">
                    <span>Password</span>
                    <span className="opacity-80">
                      {pwd && (
                        validPwd ? <Check className="text-[#1a4d2e]" size={16} /> : <X className="text-red-500" size={16} />
                      )}
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      onChange={(e) => setPwd(e.target.value)}
                      value={pwd}
                      required
                      placeholder="Strong Password"
                      onFocus={() => setPwdFocus(true)}
                      onBlur={() => setPwdFocus(false)}
                      className="auth-input !pr-12"
                    />
                    <Lock className="input-icon-left" size={20} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D1A272] transition outline-none" aria-label="Toggle password visibility" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {pwdFocus && pwd && !validPwd && (
                    <p className="text-xs text-red-500 mt-2 pl-1 font-medium">
                      • 8-24 characters<br />
                      • Uppercase, Lowercase, Number & Special Char
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirm_pwd" className="auth-label flex justify-between">
                    <span>Confirm Password</span>
                    <span className="opacity-80">
                      {matchPwd && (
                        validMatch ? <Check className="text-[#1a4d2e]" size={16} /> : <X className="text-red-500" size={16} />
                      )}
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirm_pwd"
                      onChange={(e) => setMatchPwd(e.target.value)}
                      value={matchPwd}
                      required
                      placeholder="Confirm Password"
                      className="auth-input !pr-12"
                    />
                    <Lock className="input-icon-left" size={20} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D1A272] transition outline-none" aria-label="Toggle confirm password visibility" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {matchPwd && !validMatch && (
                    <p className="text-xs text-red-500 mt-2 pl-1 font-medium">
                      Passwords do not match.
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={!validName || !validPwd || !validMatch} className="auth-btn disabled:opacity-50 disabled:cursor-not-allowed">
                    Create My Account
                  </button>
                </div>

                <div className="text-center mt-8 pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-500 font-light">
                    Already have an account? <a href="/login" className="text-[#1a4d2e] font-semibold hover:text-[#D1A272] transition ml-1">Sign In</a>
                  </p>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
      <div className="footer">
        © 2025 Dabur International. All rights reserved. <br />
        <span className="opacity-60 text-[10px] mt-1 block">Privacy Policy • Terms of Service</span>
      </div>
    </div>
  );
};

export default Register;
