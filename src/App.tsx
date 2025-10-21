// Extend window type for authService
declare global {
  interface Window {
    authService?: {
      signIn?: (useRedirect: boolean) => Promise<any>;
      getRedirectResult?: () => Promise<any>;
      onAuthStateChanged?: (cb: (user: any) => void) => void;
      signOut?: () => Promise<void>;
    };
    notesService?: {
      loadProjects?: (userId: string) => Promise<any[]>;
      saveProjects?: (userId: string, projects: any[]) => Promise<any>;
    };
  }
}
import { useState, useEffect } from 'react';

function CopyEmailField() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2 mb-3">
      <input
        type="text"
        value="yulfa.anni531@gmail.com"
        readOnly
        className="border rounded-lg px-3 py-2 text-[#333] flex-1 bg-[#f9f9f9] focus:outline-none"
        style={{ minWidth: '0' }}
        onFocus={e => e.target.select()}
      />
      <button
        className="neuro-button px-3 py-2 rounded-lg text-[#333] border border-[#8EB69B] hover:bg-[#f5f5f5]"
        onClick={() => {
          navigator.clipboard.writeText('yulfa.anni531@gmail.com');
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        title="Copy email address"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}
// User type for auth
type AuthUser = {
  displayName?: string;
  email?: string;
  photoURL?: string;
  uid?: string;
};
import SignUp from './components/signup';
import Login from './components/login';
import Footer from './components/footer';
import { Sheet, SheetContent } from './components/ui/sheet';
import CloverIcon from './components/CloverIcon';

// Card type for Firestore notes
type NoteCard = {
  id: string | number;
  title: string;
  description: string;
  image?: string;
  date?: string;
};

export default function App() {
  // Google sign-in implementation
  const handleGoogleSignIn = async () => {
    if (window.authService && window.authService.signIn) {
      try {
        await window.authService.signIn(false);
      } catch (e) {
        alert('Google sign-in failed.');
      }
    } else {
      alert('Google sign-in not available.');
    }
  };
  const [user, setUser] = useState<AuthUser | null>(null);
  const defaultImage = '/src/assets/note-default.svg';
  const [cards, setCards] = useState<NoteCard[]>([]);

  // Load notes from Firestore
  const loadUserNotes = async (uid?: string) => {
    if (!uid || !window.notesService || !window.notesService.loadProjects) return;
    try {
      const projects = await window.notesService.loadProjects(uid);
      setCards(
        projects.map((note: any, idx: number) => ({
          id: note.id || idx,
          title: note.title || 'Untitled',
          description: note.notes || '',
          image: note.image || defaultImage,
          date: note.date,
        }))
      );
    } catch (e) {
      setCards([]);
    }
  };
  // Listen for auth state changes (Google/Facebook) and load notes
  useEffect(() => {
    if (window.authService && window.authService.onAuthStateChanged) {
      window.authService.onAuthStateChanged((firebaseUser: any) => {
        if (firebaseUser) {
          setUser({
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            uid: firebaseUser.uid,
          });
          loadUserNotes(firebaseUser.uid);
        } else {
          setUser(null);
          setCards([]);
        }
      });
    }
  }, []);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'signup' | 'login' | 'support'>('dashboard');

  // Reload notes when window regains focus (e.g. after closing note editor tab)
  useEffect(() => {
    const onFocus = () => {
      if (user && user.uid) loadUserNotes(user.uid);
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [user]);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

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
    { id: 'gallery', label: 'Gallery', icon: 'bx-images' },
    { id: 'support', label: 'Support', icon: 'bx-support', onClick: () => setIsSupportModalOpen(true) },
  ];

  // (removed duplicate cards state)

  // Handle image upload for a card
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, cardId: string | number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const newCards = cards.map(card =>
        card.id === cardId ? { ...card, image: ev.target?.result as string } : card
      );
      setCards(newCards);
    };
    reader.readAsDataURL(file);
  };

  if (currentPage === 'signup') {
    return <SignUp onNavigate={navigateTo} />;
  }

  if (currentPage === 'login') {
    return <Login onNavigate={navigateTo} />;
  }

  // Remove the support page route, support is now a modal
  // Support Modal Dialog
  const SupportModal = () => (
    isSupportModalOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full relative">
          <button
            className="absolute top-3 right-3 text-[#666] hover:text-[#333] text-2xl"
            onClick={() => setIsSupportModalOpen(false)}
            aria-label="Close"
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold mb-4 text-[#333]">Support</h2>
          <p className="mb-4 text-[#666]">If you need help or have questions, please contact me for support service.</p>
          <CopyEmailField />
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=yulfa.anni531@gmail.com"
            className="neuro-button px-6 py-3 rounded-xl text-[#333] font-semibold block text-center border border-[#8EB69B] hover:bg-[#f5f5f5]"
            target="_blank"
            rel="noopener noreferrer"
          >
            Send via Gmail
          </a>
        </div>
      </div>
    ) : null
  );

  const NavigationMenu = () => (
    <nav className="space-y-4">
      {navLinks.map((link) => (
        <button
          key={link.id}
          onClick={() => {
            setActiveLink(link.id);
            setIsMobileMenuOpen(false);
            if (link.onClick) link.onClick();
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
      <SupportModal />
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 p-6 neuro-bg flex-shrink-0">
        <div className="mb-8 flex items-center justify-center gap-2">
          <CloverIcon size={28} className="text-[#8EB69B]" />
          <h1 className="text-[#333]">Dashboard</h1>
        </div>
        <NavigationMenu />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="neuro-bg border-0 p-6">
          <div className="mb-8 flex items-center justify-center gap-2">
            <CloverIcon size={28} className="text-[#8EB69B]" />
            <h1 className="text-[#333]">Dashboard</h1>
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
              <span className="text-[#333] hidden lg:block">
                {user ? `Welcome back, ${user.displayName || user.email || 'User'}` : 'Welcome back, User'}
              </span>
              
              {/* Login Button */}
              {!user && (
                <button 
                  onClick={handleGoogleSignIn}
                  className="neuro-button rounded-2xl px-4 py-2 lg:px-6 lg:py-3 text-[#333] flex items-center gap-2"
                >
                  <i className="bx bx-log-in text-lg lg:text-xl"></i>
                  <span className="hidden sm:inline">Sign In with Google</span>
                </button>
              )}

              {/* Sign Up Button */}
              {!user && (
                <button 
                  onClick={() => navigateTo('signup')}
                  className="neuro-button-accent rounded-2xl px-4 py-2 lg:px-6 lg:py-3 text-white flex items-center gap-2"
                >
                  <i className="bx bx-user-plus text-lg lg:text-xl"></i>
                  <span className="hidden sm:inline">Sign Up</span>
                </button>
              )}

              {/* User Icon */}
              {user && (
                <div className="neuro-card rounded-full w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center overflow-hidden">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User Avatar'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <i className="bx bx-user text-xl lg:text-2xl text-[#666]"></i>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6">
          <main className="max-w-7xl mx-auto">
            {/* Header with New Button */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[#333]">Projects</h2>
              <button
                className="neuro-button rounded-2xl px-4 py-2 lg:px-6 lg:py-3 text-[#333] flex items-center gap-2"
                onClick={() => window.open('/public/user-note.html', '_blank')}
              >
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
                  <div className="aspect-[16/9] overflow-hidden flex flex-col items-center justify-center relative group">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover"
                      style={{ maxHeight: '180px', background: '#faf8f3' }}
                    />
                    <label
                      className="absolute inset-0 flex items-center justify-center text-base text-white bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer font-semibold z-10"
                      style={{ pointerEvents: 'auto', marginTop: 0 }}
                    >
                      Change Image
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleImageUpload(e, card.id)}
                      />
                    </label>
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
