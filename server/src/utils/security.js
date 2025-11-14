const config = require('../config');

/**
 * Security utilities for server-side validation and sanitization
 */
class SecurityUtils {
  /**
   * Sanitize HTML to prevent XSS attacks
   */
  static sanitizeHTML(input) {
    if (typeof input !== 'string') return '';
    
    // Basic HTML escaping
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Sanitize rich text (preserve some formatting but escape dangerous content)
   */
  static sanitizeRichText(html) {
    if (typeof html !== 'string') return '';
    
    // Allow basic formatting tags but escape everything else
    const allowedTags = ['b', 'i', 'u', 'strong', 'em', 'br', 'p', 'ul', 'ol', 'li', 'span'];
    
    // This is a simplified implementation
    // In production, consider using a library like DOMPurify (jsdom) or sanitize-html
    let sanitized = html;
    
    // Remove script tags and their content
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove event handlers
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
    
    // Remove javascript: protocol
    sanitized = sanitized.replace(/javascript:/gi, '');
    
    return sanitized;
  }

  /**
   * Validate project title
   */
  static validateTitle(title) {
    if (!title || typeof title !== 'string') {
      return { valid: false, error: 'Title is required and must be a string' };
    }
    
    const trimmed = title.trim();
    
    if (trimmed.length === 0) {
      return { valid: false, error: 'Title cannot be empty' };
    }
    
    if (trimmed.length > config.security.maxProjectTitleLength) {
      return { valid: false, error: `Title exceeds maximum length of ${config.security.maxProjectTitleLength} characters` };
    }
    
    return { valid: true, value: trimmed };
  }

  /**
   * Validate project notes
   */
  static validateNotes(notes) {
    if (notes === null || notes === undefined) {
      return { valid: true, value: '' };
    }
    
    if (typeof notes !== 'string') {
      return { valid: false, error: 'Notes must be a string' };
    }
    
    if (notes.length > config.security.maxProjectNotesLength) {
      return { valid: false, error: `Notes exceed maximum length of ${config.security.maxProjectNotesLength} characters` };
    }
    
    return { valid: true, value: notes };
  }

  /**
   * Validate project emoji
   */
  static validateEmoji(emoji) {
    if (!emoji || typeof emoji !== 'string') {
      return { valid: false, error: 'Emoji is required' };
    }
    
    // Simple emoji validation (single character or emoji sequence)
    if (emoji.length > 10) {
      return { valid: false, error: 'Invalid emoji format' };
    }
    
    return { valid: true, value: emoji };
  }

  /**
   * Validate and sanitize a complete project object
   */
  static validateProject(project) {
    const errors = [];
    const sanitized = {};

    // Validate title
    const titleValidation = this.validateTitle(project.title);
    if (!titleValidation.valid) {
      errors.push(titleValidation.error);
    } else {
      sanitized.title = this.sanitizeHTML(titleValidation.value);
    }

    // Validate notes
    const notesValidation = this.validateNotes(project.notes);
    if (!notesValidation.valid) {
      errors.push(notesValidation.error);
    } else {
      sanitized.notes = this.sanitizeRichText(notesValidation.value);
    }

    // Validate emoji
    const emojiValidation = this.validateEmoji(project.emoji);
    if (!emojiValidation.valid) {
      errors.push(emojiValidation.error);
    } else {
      sanitized.emoji = emojiValidation.value;
    }

    // Validate date (should be ISO string)
    if (project.date && typeof project.date === 'string') {
      sanitized.date = project.date;
    } else {
      sanitized.date = new Date().toISOString();
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true, project: sanitized };
  }

  /**
   * Validate array of projects
   */
  static validateProjects(projects) {
    if (!Array.isArray(projects)) {
      return { valid: false, error: 'Projects must be an array' };
    }

    if (projects.length > config.security.maxProjectsPerUser) {
      return { valid: false, error: `Cannot save more than ${config.security.maxProjectsPerUser} projects` };
    }

    const sanitizedProjects = [];
    const errors = [];

    for (let i = 0; i < projects.length; i++) {
      const validation = this.validateProject(projects[i]);
      if (!validation.valid) {
        errors.push(`Project ${i + 1}: ${validation.errors.join(', ')}`);
      } else {
        sanitizedProjects.push(validation.project);
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true, projects: sanitizedProjects };
  }
}

module.exports = SecurityUtils;
