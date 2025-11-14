// Lightweight notes service wrapper. Attaches to window.notesService for non-module compatibility.
(function () {
    function ensureDb() {
        if (!window.firebaseDb) {
            throw new Error('Firestore not initialized. Call initFirebase() first.');
        }
    }

    async function loadProjects(userId) {
        ensureDb();
        const docRef = window.doc(window.firebaseDb, 'diaryProjects', userId);
        const docSnap = await window.getDoc(docRef);
        if (docSnap && docSnap.exists()) {
            return docSnap.data().projects || [];
        }
        return [];
    }

    async function saveProjects(userId, projects) {
        ensureDb();
        const docRef = window.doc(window.firebaseDb, 'diaryProjects', userId);
        return window.setDoc(docRef, { projects });
    }

    window.notesService = {
        loadProjects,
        saveProjects
    };
})();
