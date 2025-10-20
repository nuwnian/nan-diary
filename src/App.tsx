import { useState, useEffect } from 'react';
import SignUp from './components/signup';
import Login from './components/login';
import Footer from './components/footer';
import { Sheet, SheetContent } from './components/ui/sheet';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'signup' | 'login'>('dashboard');

  // Simple URL-based routing
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/signup') {
      setCurrentPage('signup');
    } else if (path === '/login') {
      setCurrentPage('login');
    } else {
      setCurrentPage('dashboard');
    }

    // Listen for browser navigation
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      if (currentPath === '/signup') {
        setCurrentPage('signup');
      } else if (currentPath === '/login') {
        setCurrentPage('login');
      } else {
        setCurrentPage('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (page: 'dashboard' | 'signup' | 'login') => {
    const paths = {
      dashboard: '/',
      signup: '/signup', 
      login: '/login'
    };
    
    window.history.pushState({}, '', paths[page]);
    setCurrentPage(page);
  };
  const [activeLink, setActiveLink] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home', icon: 'bx-home' },
    { id: 'tasks', label: 'Tasks', icon: 'bx-task' },
    { id: 'files', label: 'Files', icon: 'bx-file' },
    { id: 'analytics', label: 'Analytics', icon: 'bx-bar-chart' },
    { id: 'support', label: 'Support', icon: 'bx-support' },
  ];

  const cards = [
    {
      id: 1,
      title: 'Modern Architecture',
      description: 'Explore contemporary design and structural innovation in urban spaces.',
      image: 'https://images.unsplash.com/photo-1519662978799-2f05096d3636?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzYwODA1NTk2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: 2,
      title: 'Nature Landscape',
      description: 'Discover serene natural environments and breathtaking vistas.',
      image: 'https://images.unsplash.com/photo-1617634667039-8e4cb277ab46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmUlMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzYwODYwNzkxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: 3,
      title: 'Interior Design',
      description: 'Curated spaces that blend functionality with aesthetic beauty.',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnRlcmlvciUyMGRlc2lnbnxlbnwxfHx8fDE3NjA4MzUxMDJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: 4,
      title: 'Minimal Workspace',
      description: 'Clean and organized environments for productivity and focus.',
      image: 'https://images.unsplash.com/photo-1542435503-956c469947f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwd29ya3NwYWNlfGVufDF8fHx8MTc2MDgwNDMyMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
  ];

  if (currentPage === 'signup') {
    return <SignUp onNavigate={navigateTo} />;
  }

  if (currentPage === 'login') {
    return <Login onNavigate={navigateTo} />;
  }

  const NavigationMenu = () => (
    <nav className="space-y-4">
      {navLinks.map((link) => (
        <button
          key={link.id}
          onClick={() => {
            setActiveLink(link.id);
            setIsMobileMenuOpen(false);
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[#333] transition-all ${
            activeLink === link.id ? 'neuro-button active' : 'neuro-button'
          }`}
        >
          <i className={`bx ${link.icon} text-xl`}></i>
          <span>{link.label}</span>
        </button>
      ))}
    </nav>
  );



  return (
    <div className="neuro-bg min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 p-6 neuro-bg flex-shrink-0">
        <div className="mb-8">
          <h1 className="text-[#333] text-center">Dashboard</h1>
        </div>
        <NavigationMenu />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="neuro-bg border-0 p-6">
          <div className="mb-8">
            <h1 className="text-[#333] text-center">Dashboard</h1>
          </div>
          <NavigationMenu />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="neuro-bg p-4 lg:p-6">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden neuro-button rounded-xl w-10 h-10 flex items-center justify-center flex-shrink-0"
            >
              <i className="bx bx-menu text-xl text-[#333]"></i>
            </button>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="neuro-inset rounded-2xl px-3 py-2 lg:px-4 lg:py-3 flex items-center gap-2">
                <i className="bx bx-search text-lg lg:text-xl text-[#666]"></i>
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent outline-none text-[#333] placeholder-[#999] w-full"
                />
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-[#333] hidden lg:block">Welcome back, User</span>
              
              {/* Login Button */}
              <button 
                onClick={() => navigateTo('login')}
                className="neuro-button rounded-2xl px-4 py-2 lg:px-6 lg:py-3 text-[#333] flex items-center gap-2"
              >
                <i className="bx bx-log-in text-lg lg:text-xl"></i>
                <span className="hidden sm:inline">Login</span>
              </button>

              {/* Sign Up Button */}
              <button 
                onClick={() => navigateTo('signup')}
                className="neuro-button-accent rounded-2xl px-4 py-2 lg:px-6 lg:py-3 text-white flex items-center gap-2"
              >
                <i className="bx bx-user-plus text-lg lg:text-xl"></i>
                <span className="hidden sm:inline">Sign Up</span>
              </button>

              {/* User Icon */}
              <div className="neuro-card rounded-full w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center overflow-hidden">
                <i className="bx bx-user text-xl lg:text-2xl text-[#666]"></i>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6">
          <main className="max-w-7xl mx-auto">
            {/* Header with New Button */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[#333]">Projects</h2>
              <button className="neuro-button rounded-2xl px-4 py-2 lg:px-6 lg:py-3 text-[#333] flex items-center gap-2">
                <i className="bx bx-plus text-lg lg:text-xl text-[#8EB69B]"></i>
                <span>New</span>
              </button>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="neuro-card rounded-3xl overflow-hidden cursor-pointer"
                >
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 lg:p-6">
                    <h3 className="text-[#333] mb-2">{card.title}</h3>
                    <p className="text-[#666]">{card.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
