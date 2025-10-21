// --- Firebase Setup ---
let userId = null;
let isFirebaseReady = false;

// Security utilities will be loaded via script tag
// Import SecurityUtils from './security.js' when using modules

// Wait for Firebase to be loaded
function waitForFirebase() {
    return new Promise((resolve) => {
        const check = () => {
            if (window.firebaseAuth && window.firebaseDb) {
                isFirebaseReady = true;
                resolve();
            } else {
                setTimeout(check, 100);
            }
        };
        check();
    });
}

// Detect mobile device for auth method selection
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
           || window.innerWidth <= 768;
}

async function signInWithGoogle() {
    await waitForFirebase();
    const isMobile = isMobileDevice();
    
    try {
        // Show loading state
        const signInBtn = document.getElementById('signInBtn');
        const mobileSignInBtn = document.getElementById('mobileSignInBtn');
        if (signInBtn) {signInBtn.textContent = 'Signing in...';}
        if (mobileSignInBtn) {mobileSignInBtn.textContent = 'Signing in...';}
        
        if (isMobile) {
            // Mobile: use redirect (better UX, avoids popup blockers)
            console.log('Using mobile redirect authentication');
            if (window.authService) {
                await window.authService.signIn(true);
            } else {
                // Fallback to direct global
                await window.signInWithRedirect(window.firebaseAuth, new window.GoogleAuthProvider());
            }
            // Redirect will handle the rest - no code after this executes
        } else {
            // Desktop: use popup
            console.log('Using desktop popup authentication');
            let result;
            if (window.authService) {
                result = await window.authService.signIn(false);
            } else {
                result = await window.signInWithPopup(window.firebaseAuth, new window.GoogleAuthProvider());
            }
            
            // Get ID token and store in API client
            const user = result.user;
            const idToken = await user.getIdToken();
            if (window.apiClient) {
                window.apiClient.setToken(idToken);
            }
            
            userId = user.uid;
            loadProjectsFromCloud();
            console.log('Signed in successfully');
        }
    } catch (error) {
        console.error('Sign in failed:', error);
        
        // Reset button states
        const signInBtn = document.getElementById('signInBtn');
        const mobileSignInBtn = document.getElementById('mobileSignInBtn');
        if (signInBtn) {signInBtn.textContent = 'Sign In';}
        if (mobileSignInBtn) {mobileSignInBtn.textContent = 'Sign In';}
        
        // Handle popup blocked - try redirect instead
        if (error.code === 'auth/popup-blocked') {
            console.log('Popup blocked, attempting redirect instead...');
            try {
                await window.signInWithRedirect(window.firebaseAuth, new window.GoogleAuthProvider());
                return;
            } catch (redirectError) {
                console.error('Redirect also failed:', redirectError);
                alert('Please allow popups for this site, or use the redirect sign-in option.');
            }
        }
        
        // Handle popup closed by user - don't show error for this
        if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
            console.log('Sign-in popup was closed by user');
            return;
        }
        
        // Helpful guidance for common Firebase auth error when domain not authorized
        try {
            const code = error && error.code ? error.code : '';
            if (code === 'auth/unauthorized-domain') {
                const origin = window.location.origin || window.location.href;
                const msg = `Sign-in blocked: the domain ${origin} is not authorized for Firebase Authentication.\n\nTo fix: open your Firebase Console -> Authentication -> Settings -> Authorized domains and add:\n${origin}`;
                // Show an alert to the user and log a console link for advanced users
                alert(msg);
                console.info('Open Firebase Console -> Authentication -> Settings and add the domain above.');
            } else if (code === 'auth/network-request-failed' && isMobile) {
                alert('Network error. Please check your mobile connection and try again.');
            } else if (code !== 'auth/internal-error') {
                // Show error for other cases (except internal errors which are usually transient)
                const errorMsg = isMobile ? 
                    'Mobile sign-in failed: ' + (error.message || 'Unknown error') :
                    'Sign-in failed: ' + (error.message || 'Unknown error');
                alert(errorMsg);
            }
        } catch (e) {
            // ignore secondary errors while reporting
        }
    }
}

// Handle mobile redirect authentication result
async function handleMobileRedirectResult() {
    // Check for redirect results (works for both mobile and desktop)
    try {
        console.log('Checking for redirect result...');
        let result;
        if (window.authService) {
            result = await window.authService.getRedirectResult();
        } else {
            result = await window.getRedirectResult(window.firebaseAuth);
        }

        if (result && result.user) {
            console.log('Redirect sign-in successful:', result.user.email);
            
            // Get ID token and store in API client
            const idToken = await result.user.getIdToken();
            if (window.apiClient) {
                window.apiClient.setToken(idToken);
            }
            
            userId = result.user.uid;
            loadProjectsFromCloud();
            
            // Show success feedback
            const signInBtn = document.getElementById('signInBtn');
            const mobileSignInBtn = document.getElementById('mobileSignInBtn');
            if (signInBtn) {
                signInBtn.textContent = 'Welcome back!';
            }
            if (mobileSignInBtn) {
                mobileSignInBtn.textContent = 'Welcome back!';
            }
            // Auth state listener will update the buttons properly
        } else {
            console.log('No redirect result found');
        }
    } catch (error) {
        console.error('Mobile redirect result error:', error);
        
        // Reset mobile button if there was an error
        const mobileSignInBtn = document.getElementById('mobileSignInBtn');
        if (mobileSignInBtn && mobileSignInBtn.textContent === 'Signing in...') {
            mobileSignInBtn.textContent = 'Sign In';
        }
        
        // Show user-friendly error for mobile
        if (error.code === 'auth/network-request-failed') {
            alert('Network error during sign-in. Please check your connection and try again.');
        } else if (error.code !== 'auth/internal-error') {
            alert('Mobile sign-in failed: ' + (error.message || 'Unknown error'));
        }
    }
}

// Initialize auth state listener when Firebase is ready
waitForFirebase().then(() => {
    console.log('Firebase is ready, setting up auth listener');
    
    // Handle mobile redirect result if user returned from OAuth
    handleMobileRedirectResult();
    
    const authListener = async (user) => {
        console.log('Auth state changed. User:', user ? 'signed in' : 'signed out');
        const signInBtn = document.getElementById('signInBtn');
        const signOutBtn = document.getElementById('signOutBtn');
        const mobileSignInBtn = document.getElementById('mobileSignInBtn');
        const mobileSignOutBtn = document.getElementById('mobileSignOutBtn');
        console.log('Sign in button found:', !!signInBtn, 'Sign out button found:', !!signOutBtn);
        console.log('Mobile sign in button found:', !!mobileSignInBtn, 'Mobile sign out button found:', !!mobileSignOutBtn);
        
        if (user) {
            // Get ID token and store in API client
            const idToken = await user.getIdToken();
            if (window.apiClient) {
                window.apiClient.setToken(idToken);
            }
            
            userId = user.uid;
            console.log('User signed in:', user.email);
            loadProjectsFromCloud();
            
            const displayName = user.displayName || user.email || 'User';
            
            // Update desktop buttons - Show user info (make it non-clickable) and show sign out button
            if (signInBtn) {
                signInBtn.textContent = displayName;
                signInBtn.onclick = null; // Remove click handler
                signInBtn.classList.add('signed-in'); // Add signed-in styling
                signInBtn.style.display = 'block';
            }
            if (signOutBtn) {
                signOutBtn.style.display = 'block';
            }
            
            // Update mobile buttons - Show user info and show sign out button
            if (mobileSignInBtn) {
                mobileSignInBtn.textContent = displayName;
                mobileSignInBtn.onclick = null; // Remove click handler
                mobileSignInBtn.classList.add('signed-in'); // Add signed-in styling
                mobileSignInBtn.style.display = 'block';
            }
            if (mobileSignOutBtn) {
                mobileSignOutBtn.style.display = 'block';
            }
        } else {
            userId = null;
            if (window.apiClient) {
                window.apiClient.setToken(null);
            }
            console.log('User signed out');
            
            // Update desktop buttons - Show active sign in button, hide sign out button
            if (signInBtn) {
                signInBtn.textContent = 'Sign In';
                signInBtn.onclick = signInWithGoogle;
                signInBtn.classList.remove('signed-in'); // Remove signed-in styling
                signInBtn.style.display = 'block';
            }
            if (signOutBtn) {
                signOutBtn.style.display = 'none';
            }
            
            // Update mobile buttons - Show active sign in button, hide sign out button
            if (mobileSignInBtn) {
                mobileSignInBtn.textContent = 'Sign In';
                mobileSignInBtn.onclick = signInWithGoogle;
                mobileSignInBtn.classList.remove('signed-in'); // Remove signed-in styling
                mobileSignInBtn.style.display = 'block';
            }
            if (mobileSignOutBtn) {
                mobileSignOutBtn.style.display = 'none';
            }
        }
    };

    if (window.authService) {
        window.authService.onAuthStateChanged(authListener);
    } else {
        window.onAuthStateChanged(window.firebaseAuth, authListener);
    }
});

async function loadProjectsFromCloud() {
    if (!userId) {return;}
    
    try {
        // Try API client first if available
        if (window.apiClient) {
            try {
                const response = await window.apiClient.getProjects();
                
                if (response.success && response.projects) {
                    projects.length = 0;
                    projects.push(...response.projects);
                    renderProjects();
                    console.log('Projects loaded from API');
                    return; // Success, exit early
                }
            } catch (apiError) {
                console.warn('API request failed, falling back to Firestore:', apiError.message);
                // Fall through to Firestore fallback
            }
        }
        
        // Fallback to direct Firestore
        if (!isFirebaseReady) {
            console.log('Firebase not ready, skipping fallback');
            return;
        }
        
        let data = [];
        if (window.notesService) {
            data = await window.notesService.loadProjects(userId);
        } else {
            const docRef = window.doc(window.firebaseDb, 'diaryProjects', userId);
            const docSnap = await window.getDoc(docRef);
            if (docSnap.exists()) {
                data = docSnap.data().projects || [];
            }
        }
        if (data && data.length) {
            projects.length = 0;
            projects.push(...data);
            renderProjects();
            console.log('Projects loaded from Firestore (fallback)');
        } else {
            console.log('No projects found');
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        // Don't alert for load errors, just log them
    }
}

async function saveProjectsToCloud() {
    // Silently skip if not signed in
    if (!userId) {
        console.log('Skipping cloud save: User not signed in');
        return;
    }
    
    try {
        // Try API client first if available
        if (window.apiClient) {
            try {
                const response = await window.apiClient.saveProjects(projects);
                
                if (response.success) {
                    console.log('Projects saved to API');
                    return; // Success, exit early
                }
            } catch (apiError) {
                console.warn('API save failed, falling back to Firestore:', apiError.message);
                // Fall through to Firestore fallback
            }
        }
        
        // Fallback to direct Firestore
        if (!isFirebaseReady) {
            console.log('Skipping cloud save: Firebase not ready');
            return;
        }
            
            // Validate user session
            await window.SecurityUtils?.validateUserSession(window.firebaseAuth);
            
            // Rate limiting check
            if (!window.SecurityUtils?.checkRateLimit(userId, 'save_projects', 20, 60000)) {
                window.SecurityUtils?.logSecurityEvent('rate_limit_exceeded', { action: 'save_projects', userId });
                throw new Error('Rate limit exceeded. Please try again later.');
            }
            
            // Validate and sanitize all projects before saving
            const sanitizedProjects = projects.map(project => {
                // Validate title
                if (!window.SecurityUtils?.validateTitle(project.title)) {
                    window.SecurityUtils?.logSecurityEvent('invalid_title', { title: project.title, userId });
                    throw new Error('Invalid project title detected');
                }
                
                // Validate notes  
                if (!window.SecurityUtils?.validateNotes(project.notes || '')) {
                    window.SecurityUtils?.logSecurityEvent('invalid_notes', { userId });
                    throw new Error('Invalid project notes detected');
                }
                
                return {
                    title: window.SecurityUtils?.sanitizeHTML(project.title) || project.title,
                    notes: window.SecurityUtils?.sanitizeRichText(project.notes || '') || project.notes,
                    emoji: project.emoji, // Emojis are safe
                    date: project.date
                };
            });
            
            if (window.notesService) {
                await window.notesService.saveProjects(userId, sanitizedProjects);
            } else {
                const docRef = window.doc(window.firebaseDb, 'diaryProjects', userId);
                await window.setDoc(docRef, { projects: sanitizedProjects });
            }
            console.log('Projects saved to Firestore (fallback)');
    } catch (error) {
        console.error('Error saving to cloud:', error);
        console.warn('Failed to save, but changes are saved locally');
        // Don't show alerts for save errors, just log them
    }
}

const projects = [
    { title: 'Spring Collection', date: 'October 10, 2025', emoji: '🌸', notes: '' },
    { title: 'Autumn Curriculum', date: 'October 8, 2025', emoji: '🍂', notes: '' },
    { title: 'Dream Project', date: 'October 5, 2025', emoji: '☁️', notes: '' }
];

let currentProjectIndex = null;

function renderProjects() {
    const grid = document.getElementById('projectsGrid');
    grid.innerHTML = projects.map((project, index) => `
        <div class="project-card" onclick="openDetail(${index})">
            <div class="card-image">${project.emoji}</div>
            <div class="card-content">
                <div class="card-title">${project.title}</div>
                <div class="card-date">${project.date}</div>
            </div>
            <button class="card-trash" onclick="deleteProject(event, ${index})" aria-label="Delete project">🗑️</button>
        </div>
    `).join('');
}

document.getElementById('searchBar').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.project-card');
    cards.forEach((card, index) => {
        const title = projects[index].title.toLowerCase();
        card.style.display = title.includes(searchTerm) ? 'block' : 'none';
    });
});

document.getElementById('detailView').addEventListener('click', (e) => {
    if (e.target.id === 'detailView') {
        closeDetail();
    }
});

// Add keyboard shortcut for saving (Ctrl+S or Cmd+S)
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault(); // Prevent browser's save dialog
        if (currentProjectIndex !== null) {
            saveCurrentProject();
            // Show a brief save indicator
            const indicator = document.createElement('div');
            indicator.textContent = '💾 Saved!';
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 8px 16px;
                border-radius: 4px;
                z-index: 10000;
                font-size: 14px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            `;
            document.body.appendChild(indicator);
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
            }, 2000);
        }
    }
});

// Initial render
renderProjects();
// Toggle mobile menu open/close
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const backdrop = document.getElementById('mobileMenuBackdrop');
    if (!menu || !backdrop) {return;}
    const isOpen = menu.classList.contains('open');
    if (isOpen) {
        menu.classList.remove('open');
        backdrop.classList.remove('visible');
        // hide inline styles for display (keeps initial state)
        setTimeout(() => {
            menu.style.display = 'none';
            backdrop.style.display = 'none';
        }, 220);
    } else {
        menu.style.display = 'flex';
        backdrop.style.display = 'block';
        // Allow layout then open
        requestAnimationFrame(() => menu.classList.add('open'));
        backdrop.classList.add('visible');
    }
}
// Expose to global so inline onclick in HTML can find it
window.toggleMobileMenu = toggleMobileMenu;