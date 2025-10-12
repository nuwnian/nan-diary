// --- Firebase Setup ---
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let userId = null;

function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then((result) => {
        userId = result.user.uid;
        loadProjectsFromCloud();
    });
}

auth.onAuthStateChanged((user) => {
    if (user) {
        userId = user.uid;
        loadProjectsFromCloud();
    } else {
        userId = null;
        // Show sign-in button or prompt
        // Optionally: signInWithGoogle();
    }
});

function loadProjectsFromCloud() {
    if (!userId) return;
    db.collection('diaryProjects').doc(userId).get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            if (data.projects) {
                projects.length = 0;
                projects.push(...data.projects);
                renderProjects();
            }
        }
    });
}

function saveProjectsToCloud() {
    if (!userId) return;
    db.collection('diaryProjects').doc(userId).set({ projects });
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
    if (!picker) return;
    
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
        if (!detailNotes) return;
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