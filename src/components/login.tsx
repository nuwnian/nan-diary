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
    <div className="neuro-bg min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 pb-16 sm:pb-24">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="neuro-button rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-4 sm:mb-6 text-[#333]"
          >
            <i className="bx bx-arrow-back text-lg sm:text-xl"></i>
          </button>

          {/* Login Card */}
          <div className="neuro-card rounded-3xl p-6 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-[#333] mb-2">Welcome Back</h2>
              <p className="text-[#666]">Sign in to continue to your account</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center neuro-inset">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-[#333] mb-2">
                  Email Address
                </label>
                <div className="neuro-inset rounded-2xl px-4 py-3">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="bg-transparent outline-none text-[#333] placeholder-[#999] w-full"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-[#333] mb-2">
                  Password
                </label>
                <div className="neuro-inset rounded-2xl px-4 py-3">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="bg-transparent outline-none text-[#333] placeholder-[#999] w-full"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full neuro-button-accent rounded-2xl px-6 py-3 text-white transition-all"
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
              <div className="flex-1 h-px bg-[#ddd]"></div>
              <span className="text-[#666] text-sm">or continue with</span>
              <div className="flex-1 h-px bg-[#ddd]"></div>
            </div>

            {/* Social Login */}
            <div className="flex justify-center gap-4 mb-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="neuro-button rounded-2xl w-16 h-16 flex items-center justify-center text-[#DB4437] hover:text-white hover:bg-[#DB4437] transition-all shadow-lg"
                disabled={loading}
                title="Sign in with Google"
              >
                <i className="bx bxl-google text-3xl"></i>
              </button>
              
              <button
                type="button"
                onClick={handleFacebookLogin}
                className="neuro-button rounded-2xl w-16 h-16 flex items-center justify-center text-[#4267B2] hover:text-white hover:bg-[#4267B2] transition-all shadow-lg"
                disabled={loading}
                title="Sign in with Facebook"
              >
                <i className="bx bxl-facebook text-3xl"></i>
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-[#666]">
                Don't have an account?{' '}
                <button 
                  onClick={() => onNavigate('signup')}
                  className="text-[#8EB69B] hover:underline"
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

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center neuro-bg/80">
          <div className="neuro-card rounded-2xl px-8 py-6 bg-green-50 border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 neuro-button rounded-full flex items-center justify-center text-green-600">
                <i className="bx bx-check text-xl"></i>
              </div>
              <div>
                <h3 className="font-semibold text-[#333]">Login Successful!</h3>
                <p className="text-sm text-[#666]">Redirecting to dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}