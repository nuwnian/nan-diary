import { useState } from 'react';
import Footer from './footer';
// Use Firebase Auth from window (initialized via src/platform/config.js)

export default function SignUp() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    setLoading(true);
    try {
      const auth = window.firebaseAuth;
      const userCredential = await window.createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      if (formData.fullName && userCredential.user && userCredential.user.updateProfile) {
        await userCredential.user.updateProfile({ displayName: formData.fullName });
      }
      setSuccess('Account created successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const auth = window.firebaseAuth;
      const provider = new window.GoogleAuthProvider();
      await window.signInWithPopup(auth, provider);
      setSuccess('Signed up with Google!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignUp = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const auth = window.firebaseAuth;
      const provider = window.FacebookAuthProvider ? new window.FacebookAuthProvider() : null;
      if (!provider) throw new Error('Facebook sign-up is not enabled.');
      await window.signInWithPopup(auth, provider);
      setSuccess('Signed up with Facebook!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="neuro-bg min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={() => window.history.back()}
            className="neuro-button rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-4 sm:mb-6 text-[#333]"
          >
            <i className="bx bx-arrow-back text-lg sm:text-xl"></i>
          </button>

          <div className="neuro-card rounded-3xl p-6 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-[#333] mb-2">Create Account</h2>
              <p className="text-[#666]">Join us today and get started</p>
            </div>

            {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
            {success && <div className="text-green-600 mb-4 text-center">{success}</div>}

            {/* OAuth Icons */}
            <div className="flex justify-center gap-4 mb-6">
              <button
                type="button"
                onClick={handleGoogleSignUp}
                className="neuro-button rounded-2xl w-16 h-16 flex items-center justify-center text-[#DB4437] hover:text-white hover:bg-[#DB4437] transition-all shadow-lg"
                disabled={loading}
                title="Sign up with Google"
              >
                <i className="bx bxl-google text-3xl"></i>
              </button>
              
              <button
                type="button"
                onClick={handleFacebookSignUp}
                className="neuro-button rounded-2xl w-16 h-16 flex items-center justify-center text-[#4267B2] hover:text-white hover:bg-[#4267B2] transition-all shadow-lg"
                disabled={loading}
                title="Sign up with Facebook"
              >
                <i className="bx bxl-facebook text-3xl"></i>
              </button>

              <button
                type="button"
                onClick={() => setShowEmailForm(!showEmailForm)}
                className={`neuro-button rounded-2xl w-16 h-16 flex items-center justify-center transition-all shadow-lg ${
                  showEmailForm 
                    ? 'text-white bg-[#8EB69B]' 
                    : 'text-[#8EB69B] hover:text-white hover:bg-[#8EB69B]'
                }`}
                disabled={loading}
                title="Sign up with Email"
              >
                <i className="bx bx-envelope text-3xl"></i>
              </button>
            </div>

            {/* Divider */}
            {showEmailForm && (
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-[#ddd]"></div>
                <span className="text-[#666] text-sm">or sign up with email</span>
                <div className="flex-1 h-px bg-[#ddd]"></div>
              </div>
            )}

            {showEmailForm && (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-[#333] mb-2">
                    Full Name
                  </label>
                  <div className="neuro-inset rounded-2xl px-4 py-3">
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="bg-transparent outline-none text-[#333] placeholder-[#999] w-full"
                      required
                    />
                  </div>
                </div>

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
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-[#333] mb-2">
                    Confirm Password
                  </label>
                  <div className="neuro-inset rounded-2xl px-4 py-3">
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="bg-transparent outline-none text-[#333] placeholder-[#999] w-full"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full neuro-button-accent rounded-2xl px-6 py-3 text-white transition-all"
                  disabled={loading}
                >
                  {loading ? 'Signing Up...' : 'Sign Up'}
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-[#666]">
                Already have an account?{' '}
                <button className="text-[#8EB69B] hover:underline">
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Footer always at the bottom */}
      <Footer />
    </div>
  );
}