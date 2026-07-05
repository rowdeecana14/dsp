/**
 * Backend Service
 * Handles all API calls to the backend for state persistence and measurements
 */

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

export class BackendService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  /**
   * Login to get JWT token
   */
  async login(email: string, password: string) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      this.token = data.token;
      localStorage.setItem('authToken', data.token);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout and clear token
   */
  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  /**
   * Get viewer state for a study
   */
  async getViewerState(studyInstanceUID: string) {
    return this.request('GET', `/api/viewer-state?studyInstanceUID=${studyInstanceUID}`);
  }

  /**
   * Save viewer state
   */
  async saveViewerState(state: any) {
    return this.request('POST', '/api/viewer-state', state);
  }

  /**
   * Get measurements for a study
   */
  async getMeasurements(studyInstanceUID: string) {
    return this.request('GET', `/api/measurements?studyInstanceUID=${studyInstanceUID}`);
  }

  /**
   * Save measurements
   */
  async saveMeasurements(studyInstanceUID: string, measurements: any[]) {
    return this.request('POST', '/api/measurements', {
      studyInstanceUID,
      measurements,
    });
  }

  /**
   * Delete a measurement
   */
  async deleteMeasurement(id: string) {
    return this.request('DELETE', `/api/measurements/${id}`);
  }

  /**
   * Generic request helper
   */
  private async request(method: string, endpoint: string, body?: any) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const options: RequestInit = {
        method,
        headers,
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${BACKEND_URL}${endpoint}`, options);

      if (response.status === 401) {
        // Token expired, redirect to login
        this.logout();
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        throw new Error(`Request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed (${method} ${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export default new BackendService();
