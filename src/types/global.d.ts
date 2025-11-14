// Global TypeScript declarations for Firebase on window object

declare global {
  interface Window {
    firebaseAuth: any;
    firebaseDb: any;
    GoogleAuthProvider: any;
    FacebookAuthProvider: any;
    signInWithPopup: any;
    signInWithRedirect: any;
    getRedirectResult: any;
    onAuthStateChanged: any;
    createUserWithEmailAndPassword: any;
    signInWithEmailAndPassword: any;
    doc: any;
    setDoc: any;
    getDoc: any;
    collection: any;
  }
}

// Module declarations
declare module './platform/config.js' {
  export function initFirebase(): any;
}

export {};