const { getFirestore } = require('../config/firebase');
const SecurityUtils = require('../utils/security');
const logger = require('../utils/logger');
const config = require('../config');

/**
 * Projects Service
 * Handles all business logic related to diary projects
 */
class ProjectsService {
  /**
   * Get all projects for a user
   */
  static async getUserProjects(userId) {
    try {
      const db = getFirestore();
      const docRef = db.collection('diaryProjects').doc(userId);
      const docSnap = await docRef.get();
      
      if (!docSnap.exists) {
        logger.info('No projects found for user', { userId });
        return {
          success: true,
          projects: [],
        };
      }
      
      const data = docSnap.data();
      const projects = data.projects || [];
      
      logger.info('Projects retrieved', { userId, count: projects.length });
      return {
        success: true,
        projects,
      };
    } catch (error) {
      logger.error('Failed to get projects', { userId, error: error.message });
      throw new Error('Failed to retrieve projects');
    }
  }

  /**
   * Save all projects for a user (replaces existing)
   */
  static async saveUserProjects(userId, projects) {
    try {
      // Validate projects array
      const validation = SecurityUtils.validateProjects(projects);
      if (!validation.valid) {
        return {
          success: false,
          error: 'ValidationError',
          message: validation.error || validation.errors.join('; '),
        };
      }

      const sanitizedProjects = validation.projects;
      
      // Save to Firestore
      const db = getFirestore();
      const docRef = db.collection('diaryProjects').doc(userId);
      
      await docRef.set({
        projects: sanitizedProjects,
        updatedAt: new Date().toISOString(),
      });
      
      logger.info('Projects saved', { userId, count: sanitizedProjects.length });
      return {
        success: true,
        projects: sanitizedProjects,
        message: 'Projects saved successfully',
      };
    } catch (error) {
      logger.error('Failed to save projects', { userId, error: error.message });
      throw new Error('Failed to save projects');
    }
  }

  /**
   * Update a single project
   */
  static async updateProject(userId, projectIndex, updatedProject) {
    try {
      // Get existing projects
      const result = await this.getUserProjects(userId);
      const projects = result.projects;
      
      if (projectIndex < 0 || projectIndex >= projects.length) {
        return {
          success: false,
          error: 'NotFound',
          message: 'Project not found',
        };
      }

      // Validate the updated project
      const validation = SecurityUtils.validateProject(updatedProject);
      if (!validation.valid) {
        return {
          success: false,
          error: 'ValidationError',
          message: validation.errors.join('; '),
        };
      }

      // Update the project
      projects[projectIndex] = validation.project;
      
      // Save back to Firestore
      const db = getFirestore();
      const docRef = db.collection('diaryProjects').doc(userId);
      
      await docRef.set({
        projects,
        updatedAt: new Date().toISOString(),
      });
      
      logger.info('Project updated', { userId, projectIndex });
      return {
        success: true,
        project: validation.project,
        message: 'Project updated successfully',
      };
    } catch (error) {
      logger.error('Failed to update project', { userId, projectIndex, error: error.message });
      throw new Error('Failed to update project');
    }
  }

  /**
   * Delete a single project
   */
  static async deleteProject(userId, projectIndex) {
    try {
      // Get existing projects
      const result = await this.getUserProjects(userId);
      const projects = result.projects;
      
      if (projectIndex < 0 || projectIndex >= projects.length) {
        return {
          success: false,
          error: 'NotFound',
          message: 'Project not found',
        };
      }

      // Remove the project
      projects.splice(projectIndex, 1);
      
      // Save back to Firestore
      const db = getFirestore();
      const docRef = db.collection('diaryProjects').doc(userId);
      
      await docRef.set({
        projects,
        updatedAt: new Date().toISOString(),
      });
      
      logger.info('Project deleted', { userId, projectIndex });
      return {
        success: true,
        message: 'Project deleted successfully',
      };
    } catch (error) {
      logger.error('Failed to delete project', { userId, projectIndex, error: error.message });
      throw new Error('Failed to delete project');
    }
  }

  /**
   * Add a new project
   */
  static async addProject(userId, newProject) {
    try {
      // Get existing projects
      const result = await this.getUserProjects(userId);
      const projects = result.projects;
      
      // Check max projects limit
      if (projects.length >= config.security.maxProjectsPerUser) {
        return {
          success: false,
          error: 'LimitExceeded',
          message: `Cannot create more than ${config.security.maxProjectsPerUser} projects`,
        };
      }

      // Validate the new project
      const validation = SecurityUtils.validateProject(newProject);
      if (!validation.valid) {
        return {
          success: false,
          error: 'ValidationError',
          message: validation.errors.join('; '),
        };
      }

      // Add the project at the beginning
      projects.unshift(validation.project);
      
      // Save back to Firestore
      const db = getFirestore();
      const docRef = db.collection('diaryProjects').doc(userId);
      
      await docRef.set({
        projects,
        updatedAt: new Date().toISOString(),
      });
      
      logger.info('Project added', { userId, totalProjects: projects.length });
      return {
        success: true,
        project: validation.project,
        message: 'Project created successfully',
      };
    } catch (error) {
      logger.error('Failed to add project', { userId, error: error.message });
      throw new Error('Failed to create project');
    }
  }
}

module.exports = ProjectsService;
