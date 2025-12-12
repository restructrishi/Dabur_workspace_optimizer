import React, { useRef, useState, useEffect } from 'react';
import { Check, X, User as UserIcon, Lock, Eye, EyeOff } from 'lucide-react';
import axios from '../../api/axios';

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)\S{6,64}$/;

const Navbar = () => {
  return (
    <nav className="header-bar">
      <div className="max-w-6xl mx-auto px-4 py-2 flex justify-between items-center">
        <a href="https://www.dabur.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 no-underline">
          <img src="https://img.etimg.com/thumb/width-1600,height-900,imgsize-34944,resizemode-75,msid-105238348/industry/cons-products/fmcg/140-year-old-dabur-family-hits-trouble-as-it-reinvents-its-business.jpg" alt="Dabur Logo" className="logo-img" />
          <span className="brand-text">Dabur</span>
        </a>
        <a href="/login" className="nav-link-action">Login</a>
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
      <div className="hero">
        <h1 className="mt-3 mb-1 text-[34px] brand-text">Dabur Workspace Optimizer</h1>
        <p className="text-sm text-[#4b4b4b]">Create your account</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="form-shell">
          {success ? (
            <div className="success-box">✓ Registration successful! Redirecting to login...</div>
          ) : (
            <>
              {errMsg && (
                <div ref={errRef} className="error-box">
                  {errMsg}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="username" className="flex items-center gap-2 auth-label">
                    Username
                    {user && (
                      validName ? <Check className="text-green-600" size={14} /> : <X className="text-red-600" size={14} />
                    )}
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-dabur-gold" size={16} />
                    <input
                      type="text"
                      id="username"
                      ref={userRef}
                      autoComplete="off"
                      onChange={(e) => setUser(e.target.value)}
                      value={user}
                      required
                      placeholder="Choose a username"
                      onFocus={() => setUserFocus(true)}
                      onBlur={() => setUserFocus(false)}
                      className={`auth-input ${user ? (validName ? 'border-green-500 focus:border-green-500 focus:ring-green-200' : 'border-red-500 focus:border-red-500 focus:ring-red-200') : 'border-gray-300 focus:border-dabur-gold focus:ring-dabur-gold/20'}`}
                    />
                  </div>
                </div>
                {userFocus && user && !validName && (
                  <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 text-xs text-blue-700">
                    Requirements: 4-24 characters, start with letter, use letters/numbers/-/_
                  </div>
                )}
                <div>
                  <label htmlFor="password" className="flex items-center gap-2 auth-label">
                    Password
                    {pwd && (
                      validPwd ? <Check className="text-green-600" size={14} /> : <X className="text-red-600" size={14} />
                    )}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-dabur-gold" size={16} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      onChange={(e) => setPwd(e.target.value)}
                      value={pwd}
                      required
                      placeholder="Create a strong password"
                      onFocus={() => setPwdFocus(true)}
                      onBlur={() => setPwdFocus(false)}
                      className={`auth-input pr-12 ${pwd ? (validPwd ? 'border-green-500 focus:border-green-500 focus:ring-green-200' : 'border-red-500 focus:border-red-500 focus:ring-red-200') : 'border-gray-300 focus:border-dabur-gold focus:ring-dabur-gold/20'}`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-dabur-gold transition" aria-label="Toggle password visibility">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {pwdFocus && pwd && !validPwd && (
                  <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 text-xs text-blue-700">
                    Requirements: 6-64 characters, at least one letter and one number
                  </div>
                )}
                <div>
                  <label htmlFor="confirm_pwd" className="flex items-center gap-2 auth-label">
                    Confirm Password
                    {matchPwd && (
                      validMatch ? <Check className="text-green-600" size={14} /> : <X className="text-red-600" size={14} />
                    )}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-dabur-gold" size={16} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirm_pwd"
                      onChange={(e) => setMatchPwd(e.target.value)}
                      value={matchPwd}
                      required
                      placeholder="Confirm your password"
                      className={`auth-input pr-12 ${matchPwd ? (validMatch ? 'border-green-500 focus:border-green-500 focus:ring-green-200' : 'border-red-500 focus:border-red-500 focus:ring-red-200') : 'border-gray-300 focus:border-dabur-gold focus:ring-dabur-gold/20'}`}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-dabur-gold transition" aria-label="Toggle confirm password visibility">
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={!validName || !validPwd || !validMatch} className="auth-btn disabled:opacity-60">
                  Create Account
                </button>
                <p className="text-center text-sm text-gray-700">
                  Already have an account? <a href="/login" className="text-dabur-burgundy font-semibold hover:text-dabur-gold transition">Sign In</a>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
      <div className="footer">Powered by Dabur</div>
    </div>
  );
};

export default Register;
