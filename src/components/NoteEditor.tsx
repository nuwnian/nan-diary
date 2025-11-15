import { useState, useEffect, useCallback, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

type NoteEditorProps = {
  noteId?: string | number;
  userId: string;
  onClose: () => void;
  onSave: () => void;
};

// Extend window type for notesService
declare global {
  interface Window {
    notesService?: {
      loadProjects?: (userId: string) => Promise<any[]>;
      saveProjects?: (userId: string, projects: any[]) => Promise<any>;
    };
  }
}

export default function NoteEditor({ noteId, userId, onClose, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [showSaveNotif, setShowSaveNotif] = useState(false);
  const quillRef = useRef<ReactQuill>(null);

  // Load existing note if editing
  useEffect(() => {
    if (noteId && userId && window.notesService?.loadProjects) {
      window.notesService.loadProjects(userId)
        .then((projects) => {
          const note = projects.find(p => p.id == noteId);
          if (note) {
            const noteTitle = note.title || '';
            const noteContent = note.notes || '';
            setTitle(noteTitle);
            setContent(noteContent);
            setOriginalTitle(noteTitle);
            setOriginalContent(noteContent);
          }
        })
        .catch((e) => {
          console.error('Error loading note:', e);
        });
    }
  }, [noteId, userId]);

  // Auto-save function
  const autoSave = useCallback(async () => {
    // Check if content changed
    if (noteId && title === originalTitle && content === originalContent) {
      return false; // No changes
    }

    if (!title.trim() && !content.replace(/<(.|\n)*?>/g, '').trim()) {
      return false; // Empty note
    }

    if (!userId || !window.notesService?.loadProjects || !window.notesService?.saveProjects) {
      return false;
    }

    try {
      let projects = await window.notesService.loadProjects(userId);

      if (noteId) {
        // Update existing note
        const noteIndex = projects.findIndex(p => p.id == noteId);
        if (noteIndex !== -1) {
          projects[noteIndex] = {
            ...projects[noteIndex],
            title: title || 'Untitled Note',
            notes: content,
            date: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
          };
        }
      } else {
        // Create new note
        projects.unshift({
          id: Date.now(),
          title: title || 'Untitled Note',
          notes: content,
          image: '/src/assets/note-default.svg',
          date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
        });
      }

      await window.notesService.saveProjects(userId, projects);
      localStorage.setItem('nan-diary-note-added', Date.now().toString());
      return true;
    } catch (e) {
      console.error('Auto-save failed:', e);
      return false;
    }
  }, [noteId, title, content, originalTitle, originalContent, userId]);

  // Handle close with auto-save
  const handleClose = async () => {
    await autoSave();
    onSave();
    onClose();
  };

  // Handle manual save
  const handleSave = async () => {
    const saved = await autoSave();
    if (saved) {
      setShowSaveNotif(true);
      setTimeout(() => setShowSaveNotif(false), 2000);
    }
  };

  // Add undo/redo handlers after Quill mounts
  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      
      // Add undo button handler
      const undoButton = document.querySelector('.ql-undo');
      if (undoButton) {
        undoButton.addEventListener('click', () => {
          quill.history.undo();
        });
      }
      
      // Add redo button handler
      const redoButton = document.querySelector('.ql-redo');
      if (redoButton) {
        redoButton.addEventListener('click', () => {
          quill.history.redo();
        });
      }
    }
  }, []);

  // Quill modules configuration
  const modules = {
    toolbar: {
      container: [
        ['bold', 'italic', 'strike'],
        ['link', { 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'color': [] }],
      ],
    },
    history: {
      delay: 1000,
      maxStack: 100,
      userOnly: true
    }
  };

  const formats = [
    'bold', 'italic', 'strike',
    'link', 'list', 'bullet', 'indent',
    'size', 'color'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-[#2a2a2a] rounded-2xl shadow-lg w-[90vw] h-[85vh] max-w-[1200px] flex flex-col relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-8 text-[#8EB69B] hover:bg-[#f9f9f9] dark:hover:bg-[#363636] text-3xl font-bold px-2 rounded transition-colors z-10"
          title="Close"
        >
          &times;
        </button>

        {/* Title Input */}
        <div className="px-10 pt-10 pb-0">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="w-full border-none text-lg text-[#333] dark:text-[#e0e0e0] bg-transparent outline-none placeholder-[#d1d1d1] dark:placeholder-[#666]"
          />
        </div>

        {/* Editor Section */}
        <div className="flex-1 px-10 pb-10 pt-8 flex flex-col overflow-hidden relative">
          <div className="flex-1 flex flex-col">
            {/* Custom toolbar container with undo/redo */}
            <div id="toolbar">
              <span className="ql-formats">
                <button className="ql-bold"></button>
                <button className="ql-italic"></button>
                <button className="ql-strike"></button>
              </span>
              <span className="ql-formats">
                <button className="ql-link"></button>
                <button className="ql-list" value="ordered"></button>
                <button className="ql-list" value="bullet"></button>
                <button className="ql-indent" value="-1"></button>
                <button className="ql-indent" value="+1"></button>
              </span>
              <span className="ql-formats">
                <select className="ql-size">
                  <option value="small">Small</option>
                  <option selected>Normal</option>
                  <option value="large">Large</option>
                  <option value="huge">Huge</option>
                </select>
              </span>
              <span className="ql-formats">
                <select className="ql-color"></select>
              </span>
              <span className="ql-formats">
                <button className="ql-undo">
                  <svg viewBox="0 0 18 18">
                    <polygon className="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10"></polygon>
                    <path className="ql-stroke" d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"></path>
                  </svg>
                </button>
                <button className="ql-redo">
                  <svg viewBox="0 0 18 18">
                    <polygon className="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10"></polygon>
                    <path className="ql-stroke" d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"></path>
                  </svg>
                </button>
              </span>
            </div>
            
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={{ ...modules, toolbar: '#toolbar' }}
              formats={formats}
              placeholder="Start writing..."
              style={{ height: '100%' }}
            />
          </div>
          
          {/* Save button - bottom right */}
          <button
            onClick={handleSave}
            className="absolute bottom-8 right-12 neuro-button-accent px-3 py-1.5 rounded-lg text-white flex items-center gap-1.5 text-xs font-medium shadow-lg hover:shadow-xl transition-all z-10"
            title="Save note"
          >
            <i className="bx bx-save text-base"></i>
            <span>Save</span>
          </button>
          
          {/* Save notification toast */}
          {showSaveNotif && (
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-[#8EB69B] text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-slide-up z-50">
              <i className="bx bx-check-circle text-xl"></i>
              <span className="font-medium">Note saved successfully!</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .quill {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        #toolbar {
          border: 1px solid #e5e5e5;
          border-radius: 8px 8px 0 0;
          background: white;
          padding: 8px;
        }
        
        .dark #toolbar {
          background: #2a2a2a;
          border-color: #555;
        }
        
        .ql-container {
          border: 1px solid #e5e5e5;
          border-top: none;
          border-radius: 0 0 8px 8px;
          background: white;
          font-size: 14px;
          flex: 1;
        }
        
        .dark .ql-container {
          border-color: #555;
          background: #2a2a2a;
        }
        
        .ql-editor {
          min-height: 100%;
        }
        
        .dark .ql-editor {
          color: #e0e0e0;
        }

        /* Toolbar button styles */
        #toolbar button {
          width: 28px;
          height: 28px;
        }
        
        #toolbar button:hover {
          background-color: #f5f5f5;
          border-radius: 4px;
        }
        
        .dark #toolbar button:hover {
          background-color: #363636;
        }
        
        #toolbar button.ql-active {
          background-color: #8EB69B;
          border-radius: 4px;
        }
        
        #toolbar .ql-stroke {
          stroke: #666;
        }
        
        .dark #toolbar .ql-stroke {
          stroke: #e0e0e0;
        }
        
        #toolbar .ql-fill {
          fill: #666;
        }
        
        .dark #toolbar .ql-fill {
          fill: #e0e0e0;
        }
        
        #toolbar .ql-picker-label {
          color: #666;
        }
        
        .dark #toolbar .ql-picker-label {
          color: #e0e0e0;
        }
        
        #toolbar .ql-undo,
        #toolbar .ql-redo {
          width: 28px;
          height: 28px;
        }
        
        /* Toast notification animation */
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
