import { useState, useEffect } from 'react';
import CloverIcon from './CloverIcon';
import Footer from './footer';
import ThemeToggle from './ThemeToggle';

interface LandingPageProps {
  onNavigate: (page: 'dashboard' | 'signup' | 'login') => void;
}

type Feature = {
  icon: string;
  title: string;
  description: string;
};

type Step = {
  number: number;
  title: string;
  description: string;
  icon: string;
};

type Testimonial = {
  name: string;
  role: string;
  quote: string;
  avatar: string;
};

const features: Feature[] = [
  {
    icon: 'bx-book-open',
    title: 'Rich Note Editor',
    description: 'Write beautifully with a full-featured rich text editor. Format, embed, and organize your creative projects effortlessly.',
  },
  {
    icon: 'bx-cloud-upload',
    title: 'Cloud Synced',
    description: 'Your notes are safely stored in Firebase. Access them from any device, anywhere, anytime.',
  },
  {
    icon: 'bx-shield-alt-2',
    title: 'Secure & Private',
    description: 'Google-powered authentication keeps your account safe. Your data belongs to you alone.',
  },
  {
    icon: 'bx-palette',
    title: 'Beautiful Design',
    description: 'A soft neumorphic interface that feels gentle on the eyes — light and dark mode included.',
  },
  {
    icon: 'bx-images',
    title: 'Image Support',
    description: 'Add visual inspiration to every project card with built-in image upload and display.',
  },
  {
    icon: 'bx-mobile',
    title: 'Responsive',
    description: 'Works beautifully on desktop, tablet, and mobile. Your diary, always in reach.',
  },
];

const steps: Step[] = [
  {
    number: 1,
    title: 'Create an Account',
    description: 'Sign up with your email or Google account in seconds.',
    icon: 'bx-user-plus',
  },
  {
    number: 2,
    title: 'Create a Project',
    description: 'Hit the + button to start a new creative project card.',
    icon: 'bx-plus-circle',
  },
  {
    number: 3,
    title: 'Write & Organize',
    description: 'Add notes, images, and dates. Your projects stay neatly organized.',
    icon: 'bx-edit',
  },
  {
    number: 4,
    title: 'Access Anywhere',
    description: 'Everything syncs to the cloud — pick up right where you left off.',
    icon: 'bx-globe',
  },
];

const testimonials: Testimonial[] = [
  {
    name: 'Sarah K.',
    role: 'Freelance Designer',
    quote: 'Nan Diary is the perfect place to keep all my creative project ideas in one spot. The design is so calming!',
    avatar: 'SK',
  },
  {
    name: 'Marcus T.',
    role: 'Content Writer',
    quote: 'I love how simple and clean it is. No distractions — just me and my notes. Cloud sync is a lifesaver.',
    avatar: 'MT',
  },
  {
    name: 'Aiko N.',
    role: 'Student',
    quote: 'Finally, a diary app that feels cozy. The neumorphic design makes me actually want to open it every day.',
    avatar: 'AN',
  },
];

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="neuro-bg min-h-screen">
      {/* Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'shadow-lg' : ''
      }`}>
        <div className={`neuro-bg border-b border-[#d0d0d0] dark:border-[#444]`}>
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2">
              <div className="neuro-card rounded-xl w-10 h-10 flex items-center justify-center">
                <CloverIcon size={24} className="text-[#8EB69B]" />
              </div>
              <span className="text-lg font-semibold text-[#333] dark:text-[#e0e0e0]">Nan Diary</span>
            </a>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => onNavigate('login')}
                className="neuro-button rounded-2xl px-4 py-2 text-[#333] dark:text-[#e0e0e0] hidden sm:block"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('signup')}
                className="neuro-button-accent rounded-2xl px-5 py-2 text-white font-semibold"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Badge */}
          <div className="inline-flex items-center gap-2 neuro-inset rounded-full px-4 py-2 mb-8">
            <CloverIcon size={16} className="text-[#8EB69B]" />
            <span className="text-sm text-[#666] dark:text-[#ccc]">Your creative workspace, reimagined</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#333] dark:text-[#e0e0e0] mb-6 leading-tight">
            A Cozy Diary for<br />
            <span className="text-[#8EB69B]">Creative Projects</span>
          </h1>

          <p className="text-lg sm:text-xl text-[#666] dark:text-[#ccc] max-w-2xl mx-auto mb-10">
            Capture ideas, plan projects, and organize your creative life — all in a beautiful, soft-designed space that feels like home.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('signup')}
              className="neuro-button-accent rounded-2xl px-8 py-4 text-white text-lg font-semibold w-full sm:w-auto"
            >
              Start Writing — It's Free
              <i className="bx bx-right-arrow-alt ml-2"></i>
            </button>
            <button
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="neuro-button rounded-2xl px-8 py-4 text-[#333] dark:text-[#e0e0e0] text-lg w-full sm:w-auto"
            >
              Learn More
              <i className="bx bx-chevron-down ml-1"></i>
            </button>
          </div>

          {/* Hero Visual - Mock Card */}
          <div className="mt-16 max-w-md mx-auto">
            <div className="neuro-card rounded-3xl p-6 transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 neuro-inset rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🌸</span>
                </div>
                <div>
                  <p className="font-semibold text-[#333] dark:text-[#e0e0e0]">Spring Collection</p>
                  <p className="text-xs text-[#999] dark:text-[#777]">October 10, 2025</p>
                </div>
              </div>
              <div className="neuro-inset rounded-xl p-4">
                <p className="text-sm text-[#666] dark:text-[#ccc]">
                  Design sketches for the new spring line. Pastel tones, floral patterns...
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 lg:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-semibold text-[#333] dark:text-[#e0e0e0] mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-[#666] dark:text-[#ccc] max-w-xl mx-auto">
              Built for creatives who want a simple, beautiful space to organize their projects.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="neuro-card rounded-3xl p-6 lg:p-8 hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="neuro-inset rounded-2xl w-14 h-14 flex items-center justify-center mb-5">
                  <i className={`bx ${feature.icon} text-2xl text-[#8EB69B]`}></i>
                </div>
                <h3 className="text-xl font-semibold text-[#333] dark:text-[#e0e0e0] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#666] dark:text-[#ccc] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 lg:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-semibold text-[#333] dark:text-[#e0e0e0] mb-4">
              How It Works
            </h2>
            <p className="text-lg text-[#666] dark:text-[#ccc]">
              Get started in four simple steps.
            </p>
          </div>

          <div className="space-y-8">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-6">
                {/* Step Number */}
                <div className="flex-shrink-0">
                  <div className="neuro-button-accent rounded-full w-14 h-14 flex items-center justify-center text-white font-bold text-lg">
                    {step.number}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="w-px h-12 bg-[#ccc] dark:bg-[#555] mx-auto mt-2"></div>
                  )}
                </div>

                {/* Step Content */}
                <div className="neuro-card rounded-2xl p-5 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <i className={`bx ${step.icon} text-xl text-[#8EB69B]`}></i>
                    <h3 className="text-lg font-semibold text-[#333] dark:text-[#e0e0e0]">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-[#666] dark:text-[#ccc]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 lg:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-semibold text-[#333] dark:text-[#e0e0e0] mb-4">
              Loved by Creatives
            </h2>
            <p className="text-lg text-[#666] dark:text-[#ccc]">
              Here's what people are saying about Nan Diary.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="neuro-card rounded-3xl p-6 lg:p-8"
              >
                {/* Quote Icon */}
                <i className="bx bxs-quote-alt-left text-3xl text-[#8EB69B] mb-4 block"></i>

                <p className="text-[#666] dark:text-[#ccc] mb-6 italic leading-relaxed">
                  "{t.quote}"
                </p>

                <div className="flex items-center gap-3">
                  <div className="neuro-button rounded-full w-12 h-12 flex items-center justify-center font-semibold text-[#8EB69B]">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-[#333] dark:text-[#e0e0e0]">{t.name}</p>
                    <p className="text-sm text-[#999] dark:text-[#777]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="neuro-card rounded-3xl p-8 lg:p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="neuro-inset rounded-full w-20 h-20 flex items-center justify-center">
                <CloverIcon size={40} className="text-[#8EB69B]" />
              </div>
            </div>

            <h2 className="text-3xl lg:text-4xl font-semibold text-[#333] dark:text-[#e0e0e0] mb-4">
              Ready to Start Your Diary?
            </h2>

            <p className="text-lg text-[#666] dark:text-[#ccc] mb-8 max-w-xl mx-auto">
              Join thousands of creatives who use Nan Diary to capture ideas and plan projects every day.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('signup')}
                className="neuro-button-accent rounded-2xl px-8 py-4 text-white text-lg font-semibold w-full sm:w-auto"
              >
                Create Free Account
                <i className="bx bx-right-arrow-alt ml-2"></i>
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="neuro-button rounded-2xl px-8 py-4 text-[#333] dark:text-[#e0e0e0] text-lg w-full sm:w-auto"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
