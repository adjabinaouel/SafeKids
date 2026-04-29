import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import SessionManager from '../utils/SessionManager';

export const AuthContext = createContext();

const SERVER_URL = 'https://gondola-reattach-relearn.ngrok-free.dev';

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    isLoading: true,
    isSignout: false,
    userToken: null,
    user: null,
    userRole: null,
  });

  const sessionCheckInterval = useRef(null);

  // Initialiser la session au démarrage
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const isActive = await SessionManager.isSessionActive();

        if (isActive) {
          const session = await SessionManager.getSession();
          setAuthState({
            isLoading: false,
            isSignout: false,
            userToken: session?.token,
            user: session?.user,
            userRole: session?.role,
          });
        } else {
          setAuthState({
            isLoading: false,
            isSignout: true,
            userToken: null,
            user: null,
            userRole: null,
          });
        }
      } catch (e) {
        console.error('Failed to restore session:', e);
        setAuthState({
          isLoading: false,
          isSignout: true,
          userToken: null,
          user: null,
          userRole: null,
        });
      }
    };

    bootstrapAsync();
  }, []);

  // Vérifier la session toutes les minutes
  useEffect(() => {
    const checkSession = async () => {
      if (!authState.userToken) return;

      const isExpired = await SessionManager.isTokenExpired();
      if (isExpired) {
        await authLogout();
      }
    };

    sessionCheckInterval.current = setInterval(checkSession, 60000);

    return () => {
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
      }
    };
  }, [authState.userToken]);

  const authContext = {
    signIn: useCallback(async (email, password, role) => {
      try {
        const response = await fetch(`${SERVER_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            motDePasse: password,
            role,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Connexion échouée');
        }

        const data = await response.json();

        // Sauvegarde la session
        await SessionManager.saveSession(data.token, data.user);

        setAuthState({
          isLoading: false,
          isSignout: false,
          userToken: data.token,
          user: data.user,
          userRole: data.user.role,
        });

        return { success: true };
      } catch (error) {
        console.error('SignIn error:', error);
        return { success: false, error: error.message };
      }
    }, []),

    signOut: useCallback(async () => {
      try {
        const token = await SessionManager.getToken();

        // Appelle le backend pour déconnecter
        if (token) {
          try {
            await fetch(`${SERVER_URL}/logout`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
              },
            });
          } catch (e) {
            console.warn('Logout request failed:', e);
            // Continue avec la déconnexion locale même si le serveur a échoué
          }
        }

        // Efface la session
        await SessionManager.clearSession();

        setAuthState({
          isLoading: false,
          isSignout: true,
          userToken: null,
          user: null,
          userRole: null,
        });

        return { success: true };
      } catch (error) {
        console.error('SignOut error:', error);
        return { success: false, error: error.message };
      }
    }, []),

    signUp: useCallback(async (email, password, role, firstName, lastName) => {
      try {
        const response = await fetch(`${SERVER_URL}/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            motDePasse: password,
            role,
            prenom: firstName,
            nom: lastName,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Inscription échouée');
        }

        const data = await response.json();

        // Sauvegarde la session après l'inscription
        await SessionManager.saveSession(data.token, data.user);

        setAuthState({
          isLoading: false,
          isSignout: false,
          userToken: data.token,
          user: data.user,
          userRole: data.user.role,
        });

        return { success: true };
      } catch (error) {
        console.error('SignUp error:', error);
        return { success: false, error: error.message };
      }
    }, []),

    refreshSession: useCallback(async () => {
      try {
        const token = await SessionManager.getToken();
        if (!token) throw new Error('No token found');

        const response = await fetch(`${SERVER_URL}/refresh-token`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
          },
        });

        if (!response.ok) {
          throw new Error('Token refresh failed');
        }

        const data = await response.json();
        await SessionManager.renewToken(data.token);

        setAuthState((prev) => ({
          ...prev,
          userToken: data.token,
        }));

        return { success: true };
      } catch (error) {
        console.error('RefreshSession error:', error);
        // Si le refresh échoue, déconnecter l'utilisateur
        await authContext.signOut();
        return { success: false, error: error.message };
      }
    }, []),

    getSessionInfo: useCallback(async () => {
      return await SessionManager.getSessionInfo();
    }, []),
  };

  // Raccourci pour signOut
  const authLogout = authContext.signOut;

  return (
    <AuthContext.Provider value={{ ...authState, ...authContext }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
