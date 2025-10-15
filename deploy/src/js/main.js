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

async function signInWithGoogle() {
    await waitForFirebase();
    const provider = new window.GoogleAuthProvider();
    try {
        const result = await window.signInWithPopup(window.firebaseAuth, provider);
        userId = result.user.uid;
        loadProjectsFromCloud();
        console.log('Signed in successfully');
    } catch (error) {
        console.error('Sign in failed:', error);
        // Helpful guidance for common Firebase auth error when domain not authorized
        try {
            const code = error && error.code ? error.code : '';
            if (code === 'auth/unauthorized-domain') {
                const origin = window.location.origin || window.location.href;
                const msg = `Sign-in blocked: the domain ${origin} is not authorized for Firebase Authentication.\n\nTo fix: open your Firebase Console -> Authentication -> Settings -> Authorized domains and add:\n${origin}`;
                // Show an alert to the user and log a console link for advanced users
                alert(msg);
                console.info('Open Firebase Console -> Authentication -> Settings and add the domain above.');
            }
        } catch (e) {
            // ignore secondary errors while reporting
        }
    }
}

function signOutUser() {
    window.firebaseAuth.signOut();
}

// Initialize auth state listener when Firebase is ready
waitForFirebase().then(() => {
    console.log('Firebase is ready, setting up auth listener');
    window.onAuthStateChanged(window.firebaseAuth, (user) => {
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
    });
});

async function loadProjectsFromCloud() {
    if (!userId || !isFirebaseReady) {return;}
    try {
        const docRef = window.doc(window.firebaseDb, 'diaryProjects', userId);
        const docSnap = await window.getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.projects) {
                projects.length = 0;
                projects.push(...data.projects);
                renderProjects();
                console.log('Projects loaded from cloud');
            }
        }
    } catch (error) {
        console.error('Error loading from cloud:', error);
    }
}

async function saveProjectsToCloud() {
    if (!userId || !isFirebaseReady) {return;}
    
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
        
        const docRef = window.doc(window.firebaseDb, 'diaryProjects', userId);
        await window.setDoc(docRef, { projects: sanitizedProjects });
        console.log('Projects saved to cloud');
    } catch (error) {
        console.error('Error saving to cloud:', error);
        
        // Show user-friendly error message
        if (error.message.includes('Rate limit')) {
            alert('You are saving too frequently. Please wait a moment before saving again.');
        } else if (error.message.includes('Invalid')) {
            alert('Please check your project content. Some content may contain unsafe characters.');
        } else {
            alert('Failed to save your projects. Please try again.');
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
    picker.addEventListener('click', (e) => e.stopPropagation());
    const grid = document.createElement('div');
    grid.className = 'emoji-grid';
    emojiOptions.forEach((e) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = e;
        btn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            ev.preventDefault();
            selectEmoji(index, e);
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

// hook up confirm modal buttons and event delegation
document.addEventListener('DOMContentLoaded', () => {
    // Font size number input handler
    const fontSizeInput = document.getElementById('fontSizeInput');
    if (fontSizeInput && detailNotes) {
        fontSizeInput.addEventListener('change', (e) => {
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
        fontSizeSelect.addEventListener('change', (e) => {
            document.execCommand('fontSize', false, fontSizeSelect.value);
            detailNotes.focus();
        });
    }
    const cancelBtn = document.getElementById('confirmCancel');
    const okBtn = document.getElementById('confirmOk');
    const confirmView = document.getElementById('confirmView');
    const grid = document.getElementById('projectsGrid');
    
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
    const detailNotes = document.getElementById('detailNotes');
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

function closeDetail() {
    if (currentProjectIndex !== null) {
        projects[currentProjectIndex].title = document.getElementById('detailTitle').value;
        projects[currentProjectIndex].notes = document.getElementById('detailNotes').innerHTML;
        renderProjects();
        saveProjectsToCloud(); // Save to cloud when closing detail (saves title and notes changes)
    }
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