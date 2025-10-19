// CommonJS implementation of the sync notes use-case for testing.
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

function createSyncNotesUseCase({ notesService, securityUtils, debounce = defaultDebounce, wait = 1000 } = {}) {
  if (!notesService) throw new Error('notesService is required');
  if (!securityUtils) throw new Error('securityUtils is required');

  async function saveNow(userId, projects) {
    // Basic validation + sanitize as in main.js
    await securityUtils.validateUserSession?.();

    if (!securityUtils.checkRateLimit?.(userId, 'save_projects', 20, 60000)) {
      securityUtils.logSecurityEvent?.('rate_limit_exceeded', { action: 'save_projects', userId });
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    const sanitizedProjects = projects.map(project => {
      if (!securityUtils.validateTitle?.(project.title)) {
        securityUtils.logSecurityEvent?.('invalid_title', { title: project.title, userId });
        throw new Error('Invalid project title detected');
      }
      if (!securityUtils.validateNotes?.(project.notes || '')) {
        securityUtils.logSecurityEvent?.('invalid_notes', { userId });
        throw new Error('Invalid project notes detected');
      }
      return {
        title: securityUtils.sanitizeHTML?.(project.title) || project.title,
        notes: securityUtils.sanitizeRichText?.(project.notes || '') || project.notes,
        emoji: project.emoji,
        date: project.date
      };
    });

    return notesService.saveProjects(userId, sanitizedProjects);
  }

  function createAutoSave(getSnapshot) {
    if (typeof getSnapshot !== 'function') throw new Error('getSnapshot function required');

    const debounced = debounce(async () => {
      try {
        const { userId, projects } = getSnapshot();
        if (!userId || !projects) return;
        await saveNow(userId, projects);
      } catch (e) {
        // propagate or log
        console.warn('Auto-save failed:', e && e.message ? e.message : e);
      }
    }, wait);

    return debounced;
  }

  return { saveNow, createAutoSave };
}

module.exports = { createSyncNotesUseCase };
