const express = require('express');
const { body, param } = require('express-validator');
const ProjectsService = require('../services/projectsService');
const { authenticate } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/projects
 * Get all projects for the authenticated user
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const result = await ProjectsService.getUserProjects(req.user.uid);
    
    res.json({
      success: true,
      projects: result.projects,
      count: result.projects.length,
    });
  })
);

/**
 * POST /api/projects
 * Save all projects (replaces existing)
 */
router.post(
  '/',
  [
    body('projects').isArray().withMessage('Projects must be an array'),
    body('projects.*.title').notEmpty().withMessage('Project title is required'),
    body('projects.*.emoji').notEmpty().withMessage('Project emoji is required'),
    body('projects.*.date').optional().isString(),
    body('projects.*.notes').optional().isString(),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { projects } = req.body;
    
    const result = await ProjectsService.saveUserProjects(req.user.uid, projects);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
        message: result.message,
      });
    }
    
    res.json({
      success: true,
      projects: result.projects,
      message: result.message,
    });
  })
);

/**
 * POST /api/projects/add
 * Add a new project
 */
router.post(
  '/add',
  [
    body('title').notEmpty().withMessage('Project title is required'),
    body('emoji').notEmpty().withMessage('Project emoji is required'),
    body('date').optional().isString(),
    body('notes').optional().isString(),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const newProject = {
      title: req.body.title,
      emoji: req.body.emoji,
      date: req.body.date || new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      notes: req.body.notes || '',
    };
    
    const result = await ProjectsService.addProject(req.user.uid, newProject);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
        message: result.message,
      });
    }
    
    res.status(201).json({
      success: true,
      project: result.project,
      message: result.message,
    });
  })
);

/**
 * PUT /api/projects/:index
 * Update a specific project by index
 */
router.put(
  '/:index',
  [
    param('index').isInt({ min: 0 }).withMessage('Invalid project index'),
    body('title').notEmpty().withMessage('Project title is required'),
    body('emoji').notEmpty().withMessage('Project emoji is required'),
    body('date').optional().isString(),
    body('notes').optional().isString(),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const projectIndex = parseInt(req.params.index, 10);
    const updatedProject = {
      title: req.body.title,
      emoji: req.body.emoji,
      date: req.body.date,
      notes: req.body.notes || '',
    };
    
    const result = await ProjectsService.updateProject(req.user.uid, projectIndex, updatedProject);
    
    if (!result.success) {
      const statusCode = result.error === 'NotFound' ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        error: result.error,
        message: result.message,
      });
    }
    
    res.json({
      success: true,
      project: result.project,
      message: result.message,
    });
  })
);

/**
 * DELETE /api/projects/:index
 * Delete a specific project by index
 */
router.delete(
  '/:index',
  [
    param('index').isInt({ min: 0 }).withMessage('Invalid project index'),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const projectIndex = parseInt(req.params.index, 10);
    
    const result = await ProjectsService.deleteProject(req.user.uid, projectIndex);
    
    if (!result.success) {
      const statusCode = result.error === 'NotFound' ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        error: result.error,
        message: result.message,
      });
    }
    
    res.json({
      success: true,
      message: result.message,
    });
  })
);

module.exports = router;
