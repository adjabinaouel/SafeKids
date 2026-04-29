import SessionManager from './SessionManager';

const SERVER_URL = 'https://gondola-reattach-relearn.ngrok-free.dev';

/**
 * Wrapper pour les appels API avec gestion automatique des tokens
 */
export class ApiClient {
  static defaultHeaders = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  };

  /**
   * Effectue une requête authentifiée
   */
  static async request(endpoint, options = {}) {
    try {
      const token = await SessionManager.getToken();

      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers = {
        ...this.defaultHeaders,
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      };

      const response = await fetch(`${SERVER_URL}${endpoint}`, {
        ...options,
        headers,
      });

      // Gère les erreurs d'authentification
      if (response.status === 401) {
        // Token expiré - nécessite une reconnexion
        await SessionManager.clearSession();
        throw new Error('UNAUTHORIZED: Session expired. Please login again.');
      }

      if (response.status === 403) {
        throw new Error('FORBIDDEN: You do not have permission to access this resource.');
      }

      // Retourner la réponse brute pour que l'appelant la traite
      return response;
    } catch (error) {
      console.error(`ApiClient.request error for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * GET
   */
  static async get(endpoint) {
    const response = await this.request(endpoint, { method: 'GET' });
    return response.json();
  }

  /**
   * POST
   */
  static async post(endpoint, body = {}) {
    const response = await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return response.json();
  }

  /**
   * PUT
   */
  static async put(endpoint, body = {}) {
    const response = await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return response.json();
  }

  /**
   * DELETE
   */
  static async delete(endpoint) {
    const response = await this.request(endpoint, { method: 'DELETE' });
    return response.json();
  }

  /**
   * POST avec FormData (pour uploads)
   */
  static async postForm(endpoint, formData) {
    const token = await SessionManager.getToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    const headers = {
      'ngrok-skip-browser-warning': 'true',
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(`${SERVER_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (response.status === 401) {
      await SessionManager.clearSession();
      throw new Error('UNAUTHORIZED: Session expired. Please login again.');
    }

    return response.json();
  }
}

export default ApiClient;
