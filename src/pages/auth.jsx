import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import 'animate.css';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    registerEmail: '',
    registerPassword: '',
    confirmPassword: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === 'checkbox' ? checked : value
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: formData.email, 
          password: formData.password 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      const userRoles = Array.isArray(data.user.roles) 
  ? data.user.roles 
  : Object.values(data.user.roles || {}); 

console.log('User roles after fix:', userRoles);

if (userRoles.includes('ROLE_ADMIN')) {
  window.location.href = '/admin';
} else {
  window.location.href = '/user-dashboard';
}

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    // Password validation
    if (formData.registerPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {

      console.log('Sending registration request with data:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.registerEmail,
        password: formData.registerPassword
      });

      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.registerEmail,
          password: formData.registerPassword
        }),
      });
      
      // Check if the response is JSON before trying to parse it
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}. Not a JSON response.`);
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).join(', ');
          throw new Error(errorMessages);
        } else {
          throw new Error(data.error || 'Registration failed');
        }
      }
      
      setSuccess('Registration successful! Please wait for admin approval.');
      
      setFormData({
        ...formData,
        firstName: '',
        lastName: '',
        registerEmail: '',
        registerPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => {
        setActiveTab('login');
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen" style={{
      background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)'
    }}>
      {/* Floating animated shapes background */}
      <div className="floating-shapes">
        <div style={{
          width: '100px',
          height: '100px',
          top: '10%',
          left: '10%',
          position: 'absolute',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          pointerEvents: 'none',
          animation: 'float 15s ease-in-out infinite'
        }}></div>
        <div style={{
          width: '150px',
          height: '150px',
          top: '20%',
          left: '70%',
          position: 'absolute',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          pointerEvents: 'none',
          animation: 'float 18s ease-in-out infinite 2s'
        }}></div>
        <div style={{
          width: '80px',
          height: '80px',
          top: '60%',
          left: '30%',
          position: 'absolute',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          pointerEvents: 'none',
          animation: 'float 12s ease-in-out infinite 1s'
        }}></div>
        <div style={{
          width: '120px',
          height: '120px',
          top: '70%',
          left: '80%',
          position: 'absolute',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          pointerEvents: 'none',
          animation: 'float 16s ease-in-out infinite 3s'
        }}></div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8 text-white animate__animated animate__fadeInDown">
            <h1 className="text-4xl font-bold mb-2">Resource Planning and Allocation System</h1>
            <p className="text-lg opacity-80">Manage your resources with ease</p>
          </div>
          
          <div className="flex justify-center mb-6 animate__animated animate__fadeIn animate__delay-1s"> 
            <div className="flex bg-white bg-opacity-20 rounded-lg p-1">
              <button 
                className={`py-2 px-6 text-white rounded-lg font-medium ${activeTab === 'login' ? 'text-indigo-600' : ''}`}
                onClick={() => setActiveTab('login')}
                style={activeTab === 'login' ? { background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' } : {}}
              >
                Sign In
              </button>
              <button 
                className={`py-2 px-6 text-white rounded-lg font-medium ${activeTab === 'register' ? 'text-indigo-600' : ''}`}
                onClick={() => setActiveTab('register')}
                style={activeTab === 'register' ? { background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' } : {}}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Display errors/success messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg animate__animated animate__fadeIn">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg animate__animated animate__fadeIn">
              {success}
            </div>
          )}
          
          {/* Login Form */}
          <div className={`p-8 rounded-lg backdrop-filter backdrop-blur-lg bg-white bg-opacity-90 shadow-2xl transition-all duration-300 transform hover:translate-y-1 hover:shadow-2xl animate__animated
            ${activeTab === 'login' ? 'opacity-100 translate-y-0 animate__fadeInUp' : 'opacity-0 translate-y-4 hidden'}`}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Welcome Back</h2>
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </span>
                  <input 
                    className="appearance-none border border-transparent rounded-lg w-full py-3 px-4 pl-10 text-gray-700 leading-tight focus:outline-none focus:border-indigo-500 focus:shadow-outline transform transition-all duration-300 hover:shadow-md focus:translate-y-1 shadow"
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <FontAwesomeIcon icon={faLock} />
                  </span>
                  <input 
                    className="appearance-none border border-transparent rounded-lg w-full py-3 px-4 pl-10 text-gray-700 leading-tight focus:outline-none focus:border-indigo-500 focus:shadow-outline transform transition-all duration-300 hover:shadow-md focus:translate-y-1 shadow"
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <span 
                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">
                    <input 
                      className="mr-2" 
                      type="checkbox" 
                      id="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                    />
                    <label className="text-sm text-gray-600" htmlFor="rememberMe">Remember me</label>
                  </div>
                  <a className="text-sm text-indigo-600 hover:text-indigo-800" href="#">Forgot password?</a>
                </div>
              </div>
              <button 
                className="w-full text-white font-bold py-3 px-4 rounded-lg focus:outline-none transform transition-all duration-300 hover:translate-y-1 hover:shadow-lg shadow-md"
                type="submit"
                style={{background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'}}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
          
          {/* Register Form */}
          <div className={`p-8 rounded-lg backdrop-filter backdrop-blur-lg bg-white bg-opacity-90 shadow-2xl transition-all duration-300 transform hover:translate-y-1 hover:shadow-2xl animate__animated
            ${activeTab === 'register' ? 'opacity-100 translate-y-0 animate__fadeInUp' : 'opacity-0 translate-y-4 hidden'}`}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create Account</h2>
            <form onSubmit={handleRegisterSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">First Name</label>
                  <input 
                    className="appearance-none border border-transparent rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-indigo-500 focus:shadow-outline transform transition-all duration-300 hover:shadow-md focus:translate-y-1 shadow"
                    id="firstName"
                    type="text"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">Last Name</label>
                  <input 
                    className="appearance-none border border-transparent rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-indigo-500 focus:shadow-outline transform transition-all duration-300 hover:shadow-md focus:translate-y-1 shadow"
                    id="lastName"
                    type="text"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="registerEmail">Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </span>
                  <input 
                    className="appearance-none border border-transparent rounded-lg w-full py-3 px-4 pl-10 text-gray-700 leading-tight focus:outline-none focus:border-indigo-500 focus:shadow-outline transform transition-all duration-300 hover:shadow-md focus:translate-y-1 shadow"
                    id="registerEmail"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.registerEmail}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="registerPassword">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <FontAwesomeIcon icon={faLock} />
                  </span>
                  <input 
                    className="appearance-none border border-transparent rounded-lg w-full py-3 px-4 pl-10 text-gray-700 leading-tight focus:outline-none focus:border-indigo-500 focus:shadow-outline transform transition-all duration-300 hover:shadow-md focus:translate-y-1 shadow"
                    id="registerPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.registerPassword}
                    onChange={handleInputChange}
                    required
                    minLength="6"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">Confirm Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <FontAwesomeIcon icon={faLock} />
                  </span>
                  <input 
                    className="appearance-none border border-transparent rounded-lg w-full py-3 px-4 pl-10 text-gray-700 leading-tight focus:outline-none focus:border-indigo-500 focus:shadow-outline transform transition-all duration-300 hover:shadow-md focus:translate-y-1 shadow"
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <button 
                className="w-full text-white font-bold py-3 px-4 rounded-lg focus:outline-none transform transition-all duration-300 hover:translate-y-1 hover:shadow-lg shadow-md"
                type="submit"
                style={{background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'}}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0) rotate(0); }
          50% { transform: translateY(-20px) translateX(10px) rotate(180deg); }
          100% { transform: translateY(0) translateX(0) rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AuthPage;