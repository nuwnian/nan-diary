/**
 * API Client for backend communication
 * Handles all HTTP requests to the backend API server
 */

const API_BASE_URL = window.ENV?.API_BASE_URL || 'http://localhost:3001';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  /**
   * Set authentication token
   */
  setToken(token) {
    this.token = token;
  }

  /**
   * Get authentication token
   */
  getToken() {
    return this.token;
  }

  /**
   * Make HTTP request
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authentication token if available
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // ========== Authentication Endpoints ==========

  /**
   * Verify Firebase ID token
   */
  async verifyToken(idToken) {
    return this.post('/api/auth/verify', { idToken });
  }

  /**
   * Get current user info
   */
  async getCurrentUser() {
    return this.get('/api/auth/me');
  }

  /**
   * Revoke all user sessions
   */
  async revokeTokens() {
    return this.post('/api/auth/revoke');
  }

  // ========== Projects Endpoints ==========

  /**
   * Get all user projects
   */
  async getProjects() {
    return this.get('/api/projects');
  }

  /**
   * Save all projects (replace existing)
   */
  async saveProjects(projects) {
    return this.post('/api/projects', { projects });
  }

  /**
   * Add a new project
   */
  async addProject(project) {
    return this.post('/api/projects/add', project);
  }

  /**
   * Update a specific project
   */
  async updateProject(index, project) {
    return this.put(`/api/projects/${index}`, project);
  }

  /**
   * Delete a specific project
   */
  async deleteProject(index) {
    return this.delete(`/api/projects/${index}`);
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = apiClient;
} else {
  window.apiClient = apiClient;
}
