/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from 'react';
import SignUp from './components/signup';
import Login from './components/login';
import Footer from './components/footer';
import { Sheet, SheetContent } from './components/ui/sheet';
import CloverIcon from './components/CloverIcon';
import ThemeToggle from './components/ThemeToggle';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './components/ThemeProvider';
import Card from './components/Card';
import NoteEditor from './components/NoteEditor';
import DigitalClock from './components/DigitalClock';

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

// User type for auth
type AuthUser = {
  displayName?: string;
  email?: string;
  photoURL?: string;
  uid?: string;
};

// Move component outside to prevent re-creation on each render
function CopyEmailField() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2 mb-3">
      <input
        type="text"
        value="yulfa.anni531@gmail.com"
        readOnly
        className="border rounded-lg px-3 py-2 text-[#333] dark:text-[#e0e0e0] flex-1 bg-[#f9f9f9] dark:bg-[#363636] focus:outline-none border-[#ddd] dark:border-[#555]"
        style={{ minWidth: '0' }}
        onFocus={e => e.target.select()}
      />
      <button
        className="neuro-button px-3 py-2 rounded-lg text-[#333] dark:text-[#e0e0e0] border border-[#8EB69B] hover:bg-[#f5f5f5] dark:hover:bg-[#363636]"
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

type NoteCard = {
  id: string | number;
  title: string;
  notes?: string;
  image?: string;
  date?: string;
};



function AppContent() {
  // Google sign-in implementation
  const handleGoogleSignIn = async () => {
    if (window.authService && window.authService.signIn) {
      try {
        await window.authService.signIn(false);
      } catch (e) {
        console.error('Sign-in error:', e);
        alert('Sign-in failed. Please try again.');
      }
    } else {
      alert('Sign-in service unavailable. Please refresh the page.');
    }
  };
  const [user, setUser] = useState<AuthUser | null>(null);
  const [cards, setCards] = useState<NoteCard[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | number | undefined>(undefined);

  // Load notes from Firestore
  const loadUserNotes = useCallback(async (uid?: string) => {
    if (!uid || !window.notesService?.loadProjects) {

      return;
    }
    try {
      const projects = await window.notesService.loadProjects(uid);
      const mappedCards = projects.map((note: any, idx: number) => ({
        id: note.id || idx,
        title: note.title || 'Untitled',
        notes: note.notes || '',
        image: note.image,
        date: note.date,
      }));

      setCards(mappedCards);
    } catch (e) {
      console.error('Error loading projects:', e);
      setCards([]);
    }
  }, []);
  

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
          // Set Sentry user context for error tracking
          if (typeof window !== 'undefined' && (window as any).Sentry) {
            (window as any).Sentry.setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              username: firebaseUser.displayName || firebaseUser.email,
            });
          }
          loadUserNotes(firebaseUser.uid);
        } else {
          setUser(null);
          setCards([]);
          // Clear Sentry user context on sign out
          if (typeof window !== 'undefined' && (window as any).Sentry) {
            (window as any).Sentry.setUser(null);
          }
        }
      });
    }
  }, [loadUserNotes]);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'signup' | 'login' | 'support'>('dashboard');


  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Reload notes when window regains focus or when a note is added
  useEffect(() => {
    const onFocus = () => {
      if (user?.uid) loadUserNotes(user.uid);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'nan-diary-note-added' && user?.uid) {
        loadUserNotes(user.uid);
      }
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
    };
  }, [user, loadUserNotes]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isProfileMenuOpen && !target.closest('.profile-menu-container')) {
        setIsProfileMenuOpen(false);
      }
    };
    
    if (isProfileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

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
        <div className="bg-white dark:bg-[#2a2a2a] rounded-2xl shadow-lg p-8 max-w-md w-full relative">
          <button
            className="absolute top-3 right-3 text-[#666] dark:text-[#999] hover:text-[#333] dark:hover:text-[#e0e0e0] text-2xl"
            onClick={() => setIsSupportModalOpen(false)}
            aria-label="Close"
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold mb-4 text-[#333] dark:text-[#e0e0e0]">Support</h2>
          <p className="mb-4 text-[#666] dark:text-[#ccc]">If you need help or have questions, please contact me for support service.</p>
          <CopyEmailField />
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=yulfa.anni531@gmail.com"
            className="neuro-button px-6 py-3 rounded-xl text-[#333] dark:text-[#e0e0e0] font-semibold block text-center border border-[#8EB69B] hover:bg-[#f5f5f5] dark:hover:bg-[#363636]"
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
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[#333] dark:text-[#e0e0e0] transition-all ${
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
      
      {/* Note Editor Modal */}
      {isEditorOpen && user?.uid && (
        <NoteEditor
          noteId={editingNoteId}
          userId={user.uid}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingNoteId(undefined);
          }}
          onSave={() => {
            // Reload notes after save
            if (user?.uid) {
              loadUserNotes(user.uid);
            }
          }}
        />
      )}
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 p-6 neuro-bg flex-shrink-0">
        <div className="mb-8 flex items-center justify-center gap-2">
          <CloverIcon size={28} className="text-[#8EB69B]" />
          <h1 className="text-[#333] dark:text-[#e0e0e0]">Dashboard</h1>
        </div>
        <NavigationMenu />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="neuro-bg border-0 p-6">
          <div className="mb-8 flex items-center justify-center gap-2">
            <CloverIcon size={28} className="text-[#8EB69B]" />
            <h1 className="text-[#333] dark:text-[#e0e0e0]">Dashboard</h1>
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
              <i className="bx bx-menu text-xl text-[#333] dark:text-[#e0e0e0]"></i>
            </button>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="neuro-inset rounded-2xl px-3 py-2 lg:px-4 lg:py-3 flex items-center gap-2">
                <i className="bx bx-search text-lg lg:text-xl text-[#666]"></i>
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent outline-none text-[#333] dark:text-[#e0e0e0] placeholder-[#999] dark:placeholder-[#666] w-full"
                />
              </div>
            </div>

            {/* Digital Clock */}
            <div className="hidden lg:block">
              <DigitalClock />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3 ml-auto">
              {/* Welcome Message with Profile Picture */}
              <div className="hidden lg:flex items-center gap-2">
                {user && user.photoURL && (
                  <div className="w-8 h-8 rounded-full overflow-hidden neuro-inset">
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <span className="text-[#333] dark:text-[#e0e0e0]">
                  {user ? `Welcome back, ${user.displayName || user.email || 'User'}` : 'Welcome back, User'}
                </span>
              </div>
              
              {/* Login Button */}
              {!user && (
                <button 
                  onClick={handleGoogleSignIn}
                  className="neuro-button rounded-2xl px-4 py-2 lg:px-6 lg:py-3 text-[#333] dark:text-[#e0e0e0] flex items-center gap-2"
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

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Profile Menu */}
              {user && (
                <div className="relative profile-menu-container">
                  <button
                    className="neuro-card rounded-full w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsProfileMenuOpen(!isProfileMenuOpen);
                    }}
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User Avatar'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          (e.currentTarget.nextElementSibling as HTMLElement)?.style.setProperty('display', 'flex');
                        }}
                      />
                    ) : null}
                    <i className={`bx bx-user text-xl lg:text-2xl text-[#666] dark:text-[#999] ${user.photoURL ? 'hidden' : 'flex'}`}></i>
                  </button>
                  
                  {/* Profile Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#2a2a2a] rounded-2xl shadow-lg border border-[#e0e0e0] dark:border-[#555] z-50">
                      {/* User Info */}
                      <div className="p-4 border-b border-[#e0e0e0] dark:border-[#555]">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden">
                            {user.photoURL ? (
                              <img 
                                src={user.photoURL} 
                                alt="Profile" 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  (e.currentTarget.nextElementSibling as HTMLElement)?.style.setProperty('display', 'flex');
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full bg-[#8EB69B] flex items-center justify-center ${user.photoURL ? 'hidden' : 'flex'}`}>
                              <i className="bx bx-user text-white text-xl"></i>
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-[#333] dark:text-[#e0e0e0] truncate">
                              {user.displayName || 'User'}
                            </p>
                            <p className="text-sm text-[#666] dark:text-[#999] truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu Options */}
                      <div className="p-2">
                        <button
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#333] dark:text-[#e0e0e0] hover:bg-[#f5f5f5] dark:hover:bg-[#363636] transition-colors"
                          onClick={() => {
                            // Add account switching logic here
                            alert('Switch account feature - integrate with Google Account Chooser');
                            setIsProfileMenuOpen(false);
                          }}
                        >
                          <i className="bx bx-user-circle text-xl"></i>
                          <span>Switch Account</span>
                        </button>
                        
                        <button
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#333] dark:text-[#e0e0e0] hover:bg-[#f5f5f5] dark:hover:bg-[#363636] transition-colors"
                          onClick={async () => {
                            try {
                              if (window.authService?.signOut) {
                                await window.authService.signOut();
                              }
                            } catch (e) {
                              console.error('Sign out failed:', e);
                            }
                            setIsProfileMenuOpen(false);
                          }}
                        >
                          <i className="bx bx-log-out text-xl"></i>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6">
          <main className="max-w-7xl mx-auto mb-16">
            {/* Header with New Button */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[#333] dark:text-[#e0e0e0]">Projects</h2>
              <button
                className="neuro-button rounded-2xl px-4 py-2 lg:px-6 lg:py-3 text-[#333] dark:text-[#e0e0e0] flex items-center gap-2"
                onClick={() => {
                  setEditingNoteId(undefined);
                  setIsEditorOpen(true);
                }}
              >
                <i className="bx bx-plus text-lg lg:text-xl text-[#8EB69B]"></i>
                <span>New</span>
              </button>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {cards.map((card, idx) => (
                <Card
                  key={card.id}
                  title={card.title}
                  date={card.date || ''}
                  image={card.image}
                  onClick={() => {
                    setEditingNoteId(card.id);
                    setIsEditorOpen(true);
                  }}
                  onDelete={async (e) => {
                    e.stopPropagation();
                    const updated = cards.filter((_, i) => i !== idx);
                    setCards(updated);
                    
                    // Save to Firestore
                    if (user?.uid && window.notesService?.saveProjects) {
                      try {
                        await window.notesService.saveProjects(user.uid, updated);
                      } catch (e) {
                        console.error('Failed to delete note:', e);
                      }
                    }
                  }}
                  onImageChange={async (imageData) => {
                    // Update local state
                    const updatedCards = cards.map((c, i) => 
                      i === idx ? { ...c, image: imageData } : c
                    );
                    setCards(updatedCards);
                    
                    // Save to Firestore
                    if (user?.uid && window.notesService?.saveProjects) {
                      try {
                        await window.notesService.saveProjects(user.uid, updatedCards);
                      } catch (e) {
                        console.error('Failed to save image:', e);
                      }
                    }
                  }}
                />
              ))}
            </div>
            
            {/* Empty state */}
            {cards.length === 0 && (
              <div className="text-center py-12">
                <p className="text-[#666] dark:text-[#ccc] text-lg">No cards to display</p>
              </div>
            )}
          </main>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
