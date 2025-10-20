import { useState } from 'react';
import Footer from './footer';

interface LoginProps {
  onNavigate: (page: 'dashboard' | 'signup' | 'login') => void;
}

export default function Login({ onNavigate }: LoginProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const auth = window.firebaseAuth;
      await window.signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Show success notification
      setShowSuccess(true);
      
      // Auto redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        onNavigate('dashboard');
      }, 1500);

    } catch (err: any) {
      console.error('Login error:', err);
      
      // User-friendly error messages
      switch (err.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;
        default:
          setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const auth = window.firebaseAuth;
      const provider = new window.GoogleAuthProvider();
      await window.signInWithPopup(auth, provider);
      
      setShowSuccess(true);
      setTimeout(() => {
        onNavigate('dashboard');
      }, 1500);
    } catch (err: any) {
      setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const auth = window.firebaseAuth;
      const provider = window.FacebookAuthProvider ? new window.FacebookAuthProvider() : null;
      if (!provider) throw new Error('Facebook login is not enabled.');
      await window.signInWithPopup(auth, provider);
      
      setShowSuccess(true);
      setTimeout(() => {
        onNavigate('dashboard');
      }, 1500);
    } catch (err: any) {
      setError('Facebook login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 opacity-70"></div>
        <div className="absolute inset-0 backdrop-blur-sm"></div>
        
        {/* Floating Glass Bubbles */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full backdrop-blur-md animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-white/15 rounded-full backdrop-blur-md animate-bounce"></div>
        <div className="absolute bottom-40 left-40 w-40 h-40 bg-white/5 rounded-full backdrop-blur-md animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-white/10 rounded-full backdrop-blur-md animate-bounce"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 pb-16 sm:pb-24">
          <div className="w-full max-w-md">
            {/* Back Button */}
            <button
              onClick={() => onNavigate('dashboard')}
              className="mb-6 p-3 rounded-full backdrop-blur-md bg-white/20 border border-white/30 text-white hover:bg-white/30 transition-all duration-300 shadow-lg"
            >
              <i className="bx bx-arrow-back text-xl"></i>
            </button>

            {/* Login Card */}
            <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-white/80">Sign in to continue to your account</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-xl text-red-100 text-center backdrop-blur-sm">
                  {error}
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-white/90 mb-2 font-medium">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="bx bx-envelope text-white/60"></i>
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full pl-10 pr-4 py-3 backdrop-blur-md bg-white/10 border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-white/90 mb-2 font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="bx bx-lock-alt text-white/60"></i>
                    </div>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 backdrop-blur-md bg-white/10 border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-white/30"></div>
                <span className="text-white/70 text-sm">or continue with</span>
                <div className="flex-1 h-px bg-white/30"></div>
              </div>

              {/* Social Login */}
              <div className="flex justify-center gap-4 mb-6">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="p-3 rounded-xl backdrop-blur-md bg-white/10 border border-white/30 text-[#DB4437] hover:bg-white/20 transition-all shadow-lg"
                  disabled={loading}
                  title="Sign in with Google"
                >
                  <i className="bx bxl-google text-2xl"></i>
                </button>
                
                <button
                  type="button"
                  onClick={handleFacebookLogin}
                  className="p-3 rounded-xl backdrop-blur-md bg-white/10 border border-white/30 text-[#4267B2] hover:bg-white/20 transition-all shadow-lg"
                  disabled={loading}
                  title="Sign in with Facebook"
                >
                  <i className="bx bxl-facebook text-2xl"></i>
                </button>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <p className="text-white/80">
                  Don't have an account?{' '}
                  <button 
                    onClick={() => onNavigate('signup')}
                    className="text-white font-semibold hover:underline transition-all"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-8 py-6 rounded-2xl shadow-2xl transform animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <i className="bx bx-check text-xl"></i>
              </div>
              <div>
                <h3 className="font-semibold">Login Successful!</h3>
                <p className="text-sm opacity-90">Redirecting to dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}