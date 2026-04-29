import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEYS = {
  USER_TOKEN: 'userToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_ROLE: 'userRole',
  USER_DATA: 'userData',
  TOKEN_EXPIRY: 'tokenExpiry',
  LOGIN_TIMESTAMP: 'loginTimestamp',
  CURRENT_ROUTE: 'currentRoute',
};

export class SessionManager {
  /**
   * Sauvegarde les données de session
   */
  static async saveSession(token, user, refreshToken = null, expiresIn = 7 * 24 * 60 * 60) {
    try {
      const now = new Date();
      const expiryTime = new Date(now.getTime() + expiresIn * 1000);

      await AsyncStorage.multiSet([
        [SESSION_KEYS.USER_TOKEN, token],
        [SESSION_KEYS.USER_ROLE, user.role || ''],
        [SESSION_KEYS.USER_DATA, JSON.stringify(user)],
        [SESSION_KEYS.TOKEN_EXPIRY, expiryTime.toISOString()],
        [SESSION_KEYS.LOGIN_TIMESTAMP, now.toISOString()],
        ...(refreshToken ? [[SESSION_KEYS.REFRESH_TOKEN, refreshToken]] : []),
      ]);

      return true;
    } catch (error) {
      console.error('SessionManager.saveSession error:', error);
      throw error;
    }
  }

  /**
   * Récupère la session actuelle
   */
  static async getSession() {
    try {
      const values = await AsyncStorage.multiGet([
        SESSION_KEYS.USER_TOKEN,
        SESSION_KEYS.USER_ROLE,
        SESSION_KEYS.USER_DATA,
        SESSION_KEYS.TOKEN_EXPIRY,
        SESSION_KEYS.REFRESH_TOKEN,
      ]);

      const session = {
        token: values[0][1],
        role: values[1][1],
        user: values[2][1] ? JSON.parse(values[2][1]) : null,
        tokenExpiry: values[3][1],
        refreshToken: values[4][1],
      };

      return session;
    } catch (error) {
      console.error('SessionManager.getSession error:', error);
      return null;
    }
  }

  /**
   * Récupère le token actuel
   */
  static async getToken() {
    try {
      return await AsyncStorage.getItem(SESSION_KEYS.USER_TOKEN);
    } catch (error) {
      console.error('SessionManager.getToken error:', error);
      return null;
    }
  }

  /**
   * Récupère le rôle de l'utilisateur
   */
  static async getUserRole() {
    try {
      return await AsyncStorage.getItem(SESSION_KEYS.USER_ROLE);
    } catch (error) {
      console.error('SessionManager.getUserRole error:', error);
      return null;
    }
  }

  /**
   * Récupère les données de l'utilisateur
   */
  static async getUserData() {
    try {
      const data = await AsyncStorage.getItem(SESSION_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('SessionManager.getUserData error:', error);
      return null;
    }
  }

  /**
   * Vérifie si le token est expiré
   */
  static async isTokenExpired() {
    try {
      const expiry = await AsyncStorage.getItem(SESSION_KEYS.TOKEN_EXPIRY);
      if (!expiry) return true;

      const expiryTime = new Date(expiry);
      const now = new Date();

      // Ajoute 5 minutes de buffer pour renouveller avant l'expiration
      return now > new Date(expiryTime.getTime() - 5 * 60 * 1000);
    } catch (error) {
      console.error('SessionManager.isTokenExpired error:', error);
      return true;
    }
  }

  /**
   * Détruit complètement la session
   */
  static async clearSession() {
    try {
      await AsyncStorage.multiRemove([
        SESSION_KEYS.USER_TOKEN,
        SESSION_KEYS.REFRESH_TOKEN,
        SESSION_KEYS.USER_ROLE,
        SESSION_KEYS.USER_DATA,
        SESSION_KEYS.TOKEN_EXPIRY,
        SESSION_KEYS.LOGIN_TIMESTAMP,
      ]);
      return true;
    } catch (error) {
      console.error('SessionManager.clearSession error:', error);
      throw error;
    }
  }

  /**
   * Récupère la durée restante de la session (en secondes)
   */
  static async getSessionDurationRemaining() {
    try {
      const expiry = await AsyncStorage.getItem(SESSION_KEYS.TOKEN_EXPIRY);
      if (!expiry) return 0;

      const expiryTime = new Date(expiry);
      const now = new Date();
      const remaining = Math.floor((expiryTime.getTime() - now.getTime()) / 1000);

      return remaining > 0 ? remaining : 0;
    } catch (error) {
      console.error('SessionManager.getSessionDurationRemaining error:', error);
      return 0;
    }
  }

  /**
   * Vérifie si une session est active
   */
  static async isSessionActive() {
    try {
      const token = await AsyncStorage.getItem(SESSION_KEYS.USER_TOKEN);
      if (!token) return false;

      const isExpired = await this.isTokenExpired();
      return !isExpired;
    } catch (error) {
      console.error('SessionManager.isSessionActive error:', error);
      return false;
    }
  }

  /**
   * Renouvelle le token (à utiliser quand on reçoit un refreshToken du backend)
   */
  static async renewToken(newToken, expiresIn = 7 * 24 * 60 * 60) {
    try {
      const now = new Date();
      const expiryTime = new Date(now.getTime() + expiresIn * 1000);

      await AsyncStorage.multiSet([
        [SESSION_KEYS.USER_TOKEN, newToken],
        [SESSION_KEYS.TOKEN_EXPIRY, expiryTime.toISOString()],
      ]);

      return true;
    } catch (error) {
      console.error('SessionManager.renewToken error:', error);
      throw error;
    }
  }

  /**
   * Sauvegarde la route actuelle
   */
  static async saveCurrentRoute(routeName, routeParams = null) {
    try {
      const routeData = {
        name: routeName,
        params: routeParams,
        timestamp: new Date().toISOString(),
      };
      await AsyncStorage.setItem(SESSION_KEYS.CURRENT_ROUTE, JSON.stringify(routeData));
      return true;
    } catch (error) {
      console.error('SessionManager.saveCurrentRoute error:', error);
      return false;
    }
  }

  /**
   * Récupère la route sauvegardée
   */
  static async getSavedRoute() {
    try {
      const routeData = await AsyncStorage.getItem(SESSION_KEYS.CURRENT_ROUTE);
      return routeData ? JSON.parse(routeData) : null;
    } catch (error) {
      console.error('SessionManager.getSavedRoute error:', error);
      return null;
    }
  }

  /**
   * Efface la route sauvegardée
   */
  static async clearSavedRoute() {
    try {
      await AsyncStorage.removeItem(SESSION_KEYS.CURRENT_ROUTE);
      return true;
    } catch (error) {
      console.error('SessionManager.clearSavedRoute error:', error);
      return false;
    }
  }
}

export default SessionManager;
