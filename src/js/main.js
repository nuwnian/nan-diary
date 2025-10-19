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
        if (signInBtn) signInBtn.textContent = 'Signing in...';
        if (mobileSignInBtn) mobileSignInBtn.textContent = 'Signing in...';
        
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
            userId = result.user.uid;
            loadProjectsFromCloud();
            console.log('Signed in successfully');
        }
    } catch (error) {
        console.error('Sign in failed:', error);
        
        // Reset button states
        const signInBtn = document.getElementById('signInBtn');
        const mobileSignInBtn = document.getElementById('mobileSignInBtn');
        if (signInBtn) signInBtn.textContent = 'Sign In';
        if (mobileSignInBtn) mobileSignInBtn.textContent = 'Sign In';
        
        // Handle mobile-specific errors
        if (isMobile && error.code === 'auth/popup-blocked') {
            console.log('Popup blocked on mobile, attempting redirect...');
            try {
                await window.signInWithRedirect(window.firebaseAuth, provider);
                return;
            } catch (redirectError) {
                console.error('Redirect also failed:', redirectError);
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

function signOutUser() {
    window.firebaseAuth.signOut();
}

// Handle mobile redirect authentication result
async function handleMobileRedirectResult() {
    const isMobile = isMobileDevice();
    if (!isMobile) return; // Only process on mobile devices
    
    try {
        console.log('Checking for mobile redirect result...');
        let result;
        if (window.authService) {
            result = await window.authService.getRedirectResult();
        } else {
            result = await window.getRedirectResult(window.firebaseAuth);
        }

        if (result && result.user) {
            console.log('Mobile redirect sign-in successful:', result.user.email);
            userId = result.user.uid;
            loadProjectsFromCloud();
            
            // Show success feedback
            const mobileSignInBtn = document.getElementById('mobileSignInBtn');
            if (mobileSignInBtn) {
                mobileSignInBtn.textContent = 'Welcome back!';
                setTimeout(() => {
                    // Auth state listener will update the button properly
                }, 2000);
            }
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
    
    const authListener = (user) => {
        console.log('Auth state changed. User:', user ? 'signed in' : 'signed out');
        const signInBtn = document.getElementById('signInBtn');
        const signOutBtn = document.getElementById('signOutBtn');
        const mobileSignInBtn = document.getElementById('mobileSignInBtn');
        const mobileSignOutBtn = document.getElementById('mobileSignOutBtn');
        console.log('Sign in button found:', !!signInBtn, 'Sign out button found:', !!signOutBtn);
        console.log('Mobile sign in button found:', !!mobileSignInBtn, 'Mobile sign out button found:', !!mobileSignOutBtn);
        
        if (user) {
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
    if (!userId || !isFirebaseReady) {return;}
    try {
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
            console.log('Projects loaded from cloud');
        }
    } catch (error) {
        console.error('Error loading from cloud:', error);
    }
}

async function saveProjectsToCloud() {
    // Silently skip if not signed in or Firebase not ready
    if (!userId || !isFirebaseReady) {
        console.log('Skipping cloud save: User not signed in or Firebase not ready');
        return;
    }
    
    try {
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
        console.log('Projects saved to cloud');
    } catch (error) {
        console.error('Error saving to cloud:', error);
        console.error('Error details:', error.message, error.code);
        
        // Show user-friendly error message based on error type
        if (error.message.includes('Session expired') || error.message.includes('not authenticated')) {
            // Authentication error - show a helpful message with option to sign in
            const shouldSignIn = confirm('Your session has expired. Sign in again to save your changes to the cloud?\n\nClick OK to sign in, or Cancel to continue working offline.');
            if (shouldSignIn) {
                signInWithGoogle();
            }
        } else if (error.message.includes('Rate limit')) {
            alert('You are saving too frequently. Please wait a moment before saving again.');
        } else if (error.message.includes('Invalid')) {
            alert('Please check your project content. Some content may contain unsafe characters.');
        } else if (error.message.includes('Missing or insufficient permissions')) {
            // Firestore permission error
            alert('You don\'t have permission to save to the cloud. Please sign in first.');
        } else {
            // For other errors, show detailed error in console but friendly message to user
            console.warn('Failed to save to cloud, but your changes are saved locally.');
            console.warn('Error reason:', error.message);
            // Only show alert for critical errors that need user attention
            if (error.code === 'permission-denied' || error.code === 'unauthenticated') {
                alert('Please sign in to save your changes to the cloud.');
            }
        }
    }
}
const emojis = ['🌸', '🍂', '☁️', '✨', '🌙', '🌿', '🎨', '📖', '🕊️', '🦋'];

const projects = [
    { title: 'Spring Collection', date: 'October 10, 2025', emoji: '🌸', notes: '' },
    { title: 'Autumn Curriculum', date: 'October 8, 2025', emoji: '🍂', notes: '' },
    { title: 'Dream Project', date: 'October 5, 2025', emoji: '☁️', notes: '' }
];

let currentProjectIndex = null;
let pendingDeleteIndex = null;

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

// Emoji set used for picker (expanded options)
const emojiOptions = ['🌸','🍂','☁️','✨','🌙','🌿','🎨','📖','🕊️','🦋','📌','⭐','🔥','🍀','🍎','🎵','🌺','🌻','🌷','🌹','🌼','🍃','🌱','🌳','🎯','🏆','💡','🎪','🎭','🎪','🎡','🎢'];

function buildEmojiPicker(index) {
    // builds a small emoji picker element
    const picker = document.createElement('div');
    picker.className = 'emoji-picker';
    picker.addEventListener('click', (evt) => evt.stopPropagation());
    const grid = document.createElement('div');
    grid.className = 'emoji-grid';
    emojiOptions.forEach((emoji) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = emoji;
        btn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            ev.preventDefault();
            selectEmoji(index, emoji);
        });
        grid.appendChild(btn);
    });
    picker.appendChild(grid);
    return picker;
}

function toggleDetailEmojiPicker() {
    const picker = document.getElementById('detailEmojiPicker');
    if (!picker) {return;}
    
    if (picker.style.display === 'none') {
        // Show picker
        picker.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'emoji-grid';
        
        emojiOptions.forEach((emoji) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = emoji;
            btn.addEventListener('click', () => {
                selectDetailEmoji(emoji);
            });
            grid.appendChild(btn);
        });
        
        picker.appendChild(grid);
        picker.style.display = 'block';
    } else {
        // Hide picker
        picker.style.display = 'none';
    }
}

function selectDetailEmoji(emoji) {
    if (currentProjectIndex !== null && currentProjectIndex >= 0 && currentProjectIndex < projects.length) {
        projects[currentProjectIndex].emoji = emoji;
        
        // Update the emoji button in detail view
        const emojiBtn = document.getElementById('detailEmojiBtn');
        if (emojiBtn) {
            emojiBtn.textContent = emoji;
        }
        
        // Hide picker
        const picker = document.getElementById('detailEmojiPicker');
        if (picker) {
            picker.style.display = 'none';
        }
        
        // Update the main grid (this will be visible when user closes detail)
        renderProjects();
        saveProjectsToCloud(); // Save to cloud after emoji change
    }
}

function selectEmoji(index, emoji) {
    if (index >= 0 && index < projects.length) {
        projects[index].emoji = emoji;
        // close all pickers
        document.querySelectorAll('.emoji-picker').forEach(p => p.remove());
        renderProjects();
    }
}

function deleteProject(event, index) {
    // stop the card click from firing (which would open the detail)
    event.stopPropagation();
    event.preventDefault();
    // show confirmation modal instead of deleting immediately
    pendingDeleteIndex = index;
    const confirmView = document.getElementById('confirmView');
    if (confirmView) {
        confirmView.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } else {
        // fallback: immediate delete
        performDelete(index);
    }
}

function performDelete(index) {
    if (index >= 0 && index < projects.length) {
        projects.splice(index, 1);
        renderProjects();
        saveProjectsToCloud(); // Save to cloud after deletion
        if (currentProjectIndex === index) {
            document.getElementById('detailView').style.display = 'none';
            document.body.style.overflow = 'auto';
            currentProjectIndex = null;
        }
    }
}

// Make functions available globally for HTML onclick handlers
window.addNewProject = addNewProject;
window.openDetail = openDetail;
window.closeDetail = closeDetail;
window.deleteProject = deleteProject;
window.signInWithGoogle = signInWithGoogle;
window.signOutUser = signOutUser;
window.buildEmojiPicker = buildEmojiPicker;
window.saveCurrentProject = saveCurrentProject;

// hook up confirm modal buttons and event delegation
document.addEventListener('DOMContentLoaded', () => {
    // Initialize detailNotes at the top so it's available for all handlers
    const detailNotes = document.getElementById('detailNotes');
    // Font size number input handler
    const fontSizeInput = document.getElementById('fontSizeInput');
    if (fontSizeInput && detailNotes) {
        fontSizeInput.addEventListener('change', () => {
            const size = fontSizeInput.value;
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
                const range = sel.getRangeAt(0);
                if (!range.collapsed) {
                    // Create a span with the desired font size
                    const span = document.createElement('span');
                    span.style.fontSize = size + 'px';
                    span.appendChild(range.extractContents());
                    range.insertNode(span);
                    // Move selection to after the span
                    sel.removeAllRanges();
                    const newRange = document.createRange();
                    newRange.selectNodeContents(span);
                    newRange.collapse(false);
                    sel.addRange(newRange);
                }
            }
            detailNotes.focus();
        });
    }
    // Font size dropdown handler
    const fontSizeSelect = document.getElementById('fontSizeSelect');
    if (fontSizeSelect && detailNotes) {
        fontSizeSelect.addEventListener('change', () => {
            document.execCommand('fontSize', false, fontSizeSelect.value);
            detailNotes.focus();
        });
    }
    const cancelBtn = document.getElementById('confirmCancel');
    const okBtn = document.getElementById('confirmOk');
    const confirmView = document.getElementById('confirmView');
    
    // Confirm modal handlers
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            pendingDeleteIndex = null;
            if (confirmView) {
                confirmView.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    if (okBtn) {
        okBtn.addEventListener('click', () => {
            if (pendingDeleteIndex !== null) {
                performDelete(pendingDeleteIndex);
            }
            pendingDeleteIndex = null;
            if (confirmView) {
                confirmView.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Detail view emoji picker handler
    const detailEmojiBtn = document.getElementById('detailEmojiBtn');
    if (detailEmojiBtn) {
        detailEmojiBtn.addEventListener('click', toggleDetailEmojiPicker);
    }
    // Rich text toolbar handlers
    const boldBtn = document.getElementById('boldBtn');
    const bulletBtn = document.getElementById('bulletBtn');
    function updateToolbarState() {
        if (!detailNotes) {return;}
        // Bold button
        if (document.queryCommandState('bold')) {
            boldBtn.classList.add('active');
        } else {
            boldBtn.classList.remove('active');
        }
        // Bullet button
        if (document.queryCommandState('insertUnorderedList')) {
            bulletBtn.classList.add('active');
        } else {
            bulletBtn.classList.remove('active');
        }
    }
    if (boldBtn && detailNotes) {
        boldBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.execCommand('bold', false, null);
            detailNotes.focus();
            updateToolbarState();
        });
    }
    if (bulletBtn && detailNotes) {
        bulletBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.execCommand('insertUnorderedList', false, null);
            detailNotes.focus();
            updateToolbarState();
        });
    }
    if (detailNotes) {
        detailNotes.addEventListener('keyup', updateToolbarState);
        detailNotes.addEventListener('mouseup', updateToolbarState);
        detailNotes.addEventListener('focus', updateToolbarState);
        detailNotes.addEventListener('blur', updateToolbarState);
        
        // Auto-save functionality: save notes as user types (with debouncing)
        let saveTimeout = null;
        const autoSaveNotes = () => {
            if (currentProjectIndex !== null && currentProjectIndex >= 0 && currentProjectIndex < projects.length) {
                // Save the current content
                const currentTitle = document.getElementById('detailTitle').value;
                const currentNotes = detailNotes.innerHTML;
                
                projects[currentProjectIndex].title = currentTitle;
                projects[currentProjectIndex].notes = currentNotes;
                
                // Update the main grid and save to cloud
                renderProjects();
                saveProjectsToCloud();
                
                console.log('Auto-saved notes for project:', projects[currentProjectIndex].title);
            }
        };
        
        const debouncedAutoSave = () => {
            if (saveTimeout) {
                clearTimeout(saveTimeout);
            }
            saveTimeout = setTimeout(autoSaveNotes, 1000); // Save 1 second after user stops typing
        };
        
        // Add auto-save listeners
        detailNotes.addEventListener('input', debouncedAutoSave);
        detailNotes.addEventListener('paste', debouncedAutoSave);
        
        // Also auto-save when title changes
        const detailTitle = document.getElementById('detailTitle');
        if (detailTitle) {
            detailTitle.addEventListener('input', debouncedAutoSave);
        }
    }
});

function openDetail(index) {
    currentProjectIndex = index;
    const project = projects[index];
    document.getElementById('detailTitle').value = project.title;
    document.getElementById('detailDate').textContent = project.date;
    document.getElementById('detailNotes').innerHTML = project.notes || '';
    document.getElementById('detailView').style.display = 'block';
    document.body.style.overflow = 'hidden';
    // Update emoji button to show current project emoji
    const emojiBtn = document.getElementById('detailEmojiBtn');
    if (emojiBtn) {
        emojiBtn.textContent = project.emoji;
    }
}

function saveCurrentProject() {
    if (currentProjectIndex !== null && currentProjectIndex >= 0 && currentProjectIndex < projects.length) {
        const titleElement = document.getElementById('detailTitle');
        const notesElement = document.getElementById('detailNotes');
        
        if (titleElement && notesElement) {
            projects[currentProjectIndex].title = titleElement.value;
            projects[currentProjectIndex].notes = notesElement.innerHTML;
            renderProjects();
            saveProjectsToCloud();
            console.log('Manually saved project:', projects[currentProjectIndex].title);
        }
    }
}

function closeDetail() {
    // Always save before closing
    saveCurrentProject();
    
    document.getElementById('detailView').style.display = 'none';
    document.body.style.overflow = 'auto';
    currentProjectIndex = null;
}

function addNewProject() {
    const newProject = {
        title: 'New Project',
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        notes: ''
    };
    projects.unshift(newProject);
    renderProjects();
    saveProjectsToCloud(); // Save to cloud after adding new project
    openDetail(0);
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