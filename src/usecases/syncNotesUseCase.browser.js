// Browser wrapper that registers a global factory for the sync notes use-case.
(function () {
    async function ensureReady() {
        // no-op placeholder if we need async init in future
    }

    function factory(options) {
        // If options omitted, use window.notesService and window.SecurityUtils by default
        const notesService = options?.notesService || window.notesService;
        const securityUtils = options?.securityUtils || window.SecurityUtils || {};
        const debounceImpl = options?.debounce || undefined;
        const wait = options?.wait || 1000;

        // Require notesService to be present
        if (!notesService) {
            throw new Error('notesService not available. Ensure platform is initialized.');
        }

        // Lazy-load the CJS module via dynamic import of ESM wrapper if available.
        // For simplicity, reuse a local implementation similar to CJS one.
        const createSyncNotesUseCase = function ({ notesService, securityUtils, debounce, wait } = {}) {
            // inline lightweight version mirroring the CJS implementation above
            function defaultDebounce(fn, wait) {
                let timeout = null;
                return function () {
                    const args = arguments;
                    if (timeout) clearTimeout(timeout);
                    timeout = setTimeout(function () {
                        timeout = null;
                        fn.apply(this, args);
                    }, wait);
                };
            }

            debounce = debounce || defaultDebounce;

            async function saveNow(userId, projects) {
                await securityUtils.validateUserSession?.();
                if (!securityUtils.checkRateLimit?.(userId, 'save_projects', 20, 60000)) {
                    securityUtils.logSecurityEvent?.('rate_limit_exceeded', { action: 'save_projects', userId });
                    throw new Error('Rate limit exceeded. Please try again later.');
                }
                const sanitizedProjects = projects.map(project => ({
                    title: securityUtils.sanitizeHTML?.(project.title) || project.title,
                    notes: securityUtils.sanitizeRichText?.(project.notes || '') || project.notes,
                    emoji: project.emoji,
                    date: project.date
                }));
                return notesService.saveProjects(userId, sanitizedProjects);
            }

            function createAutoSave(getSnapshot) {
                const debounced = debounce(async () => {
                    try {
                        const { userId, projects } = getSnapshot();
                        if (!userId || !projects) return;
                        await saveNow(userId, projects);
                    } catch (e) {
                        console.warn('Auto-save failed:', e && e.message ? e.message : e);
                    }
                }, wait);
                return debounced;
            }

            return { saveNow, createAutoSave };
        };

        return createSyncNotesUseCase({ notesService, securityUtils, debounce: debounceImpl, wait });
    }

    window.createSyncNotesUseCase = factory;
})();
