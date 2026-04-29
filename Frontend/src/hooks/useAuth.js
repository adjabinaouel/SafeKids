import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook pour accéder au contexte d'authentification
 * @returns {Object} authContext avec les données et fonctions d'authentification
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth doit être utilisé dans un composant qui est enfant de AuthProvider'
    );
  }

  return context;
}

export default useAuth;
