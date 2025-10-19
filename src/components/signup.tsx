import { useState } from 'react';
import Footer from './footer';

export default function SignUp({ onBackToDashboard }: { onBackToDashboard: () => void }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="neuro-bg min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onBackToDashboard}
          className="neuro-button rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-4 sm:mb-6 text-[#333]"
        >
          <i className="bx bx-arrow-back text-lg sm:text-xl"></i>
        </button>

        {/* Sign Up Card */}
        <div className="neuro-card rounded-3xl p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-[#333] mb-2">Create Account</h2>
            <p className="text-[#666]">Join us today and get started</p>
          </div>

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
            >
              Sign Up
            </button>
          </form>

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
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
