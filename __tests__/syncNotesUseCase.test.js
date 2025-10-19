const { createSyncNotesUseCase } = require('../src/usecases/syncNotesUseCase.cjs');

jest.useFakeTimers();

test('createAutoSave debounces and calls notesService.saveProjects once', async () => {
  const saved = { called: 0 };
  const notesService = {
    saveProjects: jest.fn(async () => { saved.called++; })
  };
  const securityUtils = {
    validateUserSession: jest.fn(async () => {}),
    checkRateLimit: jest.fn(() => true),
    sanitizeHTML: (s) => s,
    sanitizeRichText: (s) => s,
    validateTitle: () => true,
    validateNotes: () => true,
    logSecurityEvent: jest.fn()
  };

  const usecase = createSyncNotesUseCase({ notesService, securityUtils, wait: 1000 });
  let userId = 'user-1';
  let projects = [{ title: 'A', notes: '' }];

  const getSnapshot = () => ({ userId, projects });
  const autoSave = usecase.createAutoSave(getSnapshot);

  // Trigger multiple autosave events quickly
  autoSave();
  autoSave();
  autoSave();

  // Fast-forward timers to trigger debounce
  jest.advanceTimersByTime(1000);

  // Wait for promises to settle
  await Promise.resolve();
  expect(notesService.saveProjects).toHaveBeenCalledTimes(1);
});

test('saveNow validates and calls notesService.saveProjects with sanitized projects', async () => {
  const notesService = {
    saveProjects: jest.fn(async () => true)
  };
  const securityUtils = {
    validateUserSession: jest.fn(async () => {}),
    checkRateLimit: jest.fn(() => true),
    sanitizeHTML: (s) => `san:${s}`,
    sanitizeRichText: (s) => `san:${s}`,
    validateTitle: () => true,
    validateNotes: () => true,
    logSecurityEvent: jest.fn()
  };

  const usecase = createSyncNotesUseCase({ notesService, securityUtils });
  const projects = [{ title: 'T', notes: 'N', emoji: 'e', date: 'd' }];
  await usecase.saveNow('u1', projects);
  expect(notesService.saveProjects).toHaveBeenCalledWith('u1', [{ title: 'san:T', notes: 'san:N', emoji: 'e', date: 'd' }]);
});
