# Gestion des Sessions - Guide d'intégration

## 📋 Vue d'ensemble

Un système complet de gestion des sessions a été mis en place pour SafeKids:

### Composants créés:

1. **SessionManager** (`Frontend/src/utils/SessionManager.js`)
   - Gestion du stockage des tokens et données de session
   - Suivi de l'expiration des tokens
   - Récupération des infos de session

2. **AuthContext** (`Frontend/src/context/AuthContext.js`)
   - Contexte global d'authentification
   - Fonctions: `signIn`, `signOut`, `signUp`, `refreshSession`
   - Vérification automatique de l'expiration toutes les minutes

3. **useAuth Hook** (`Frontend/src/hooks/useAuth.js`)
   - Hook personnalisé pour accéder au contexte d'authentification
   - Utilisable dans n'importe quel composant

4. **ApiClient** (`Frontend/src/utils/ApiClient.js`)
   - Wrapper pour les appels API authentifiés
   - Gestion automatique des tokens
   - Gestion des erreurs 401

5. **Endpoints Backend**
   - `POST /logout` - Déconnexion sécurisée
   - `POST /refresh-token` - Renouvellement du token

---

## 🚀 Intégration dans App.js

Envelopper l'application avec `AuthProvider`:

```jsx
import { AuthProvider } from './src/context/AuthContext';
import App from './src/App';

export default function RootApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
```

---

## 💻 Utilisation dans les composants

### Exemple 1: Connexion (LoginPage)

```jsx
import { useAuth } from '../hooks/useAuth';

export default function LoginPage({ navigation }) {
  const { signIn, isLoading } = useAuth();

  const handleLogin = async () => {
    const result = await signIn(email, password, role);
    
    if (result.success) {
      navigation.reset({
        index: 0,
        routes: [{ name: ROLE_SCREENS[role] }],
      });
    } else {
      Alert.alert('Erreur', result.error);
    }
  };

  return (
    // ... votre UI
  );
}
```

### Exemple 2: Déconnexion (SettingsScreen)

```jsx
import { useAuth } from '../hooks/useAuth';

export default function SettingsScreen({ navigation }) {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    const result = await signOut();
    
    if (result.success) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  return (
    <TouchableOpacity onPress={handleLogout}>
      <Text>Se déconnecter</Text>
    </TouchableOpacity>
  );
}
```

### Exemple 3: Appels API avec ApiClient

```jsx
import { ApiClient } from '../utils/ApiClient';

async function fetchChildren() {
  try {
    const data = await ApiClient.get('/api/enfants');
    setChildren(data);
  } catch (error) {
    if (error.message.includes('UNAUTHORIZED')) {
      // Rediriger vers login
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } else {
      Alert.alert('Erreur', error.message);
    }
  }
}
```

### Exemple 4: Récupérer les infos de session

```jsx
import { useAuth } from '../hooks/useAuth';

export default function ProfileScreen() {
  const { user, userRole, userToken, getSessionInfo } = useAuth();

  useEffect(() => {
    const logSessionInfo = async () => {
      const info = await getSessionInfo();
      console.log('Session:', info);
      // {
      //   isActive: true,
      //   role: 'Medecin',
      //   user: { _id, email, prenom, ... },
      //   tokenExpiry: '2026-04-30T15:30:00.000Z',
      //   durationRemaining: '6d 23h'
      // }
    };

    logSessionInfo();
  }, []);

  return (
    // ... votre UI avec user, userRole, etc.
  );
}
```

---

## 🔐 Caractéristiques de sécurité

### ✅ Tokens JWT
- Expire après 7 jours
- Signé avec `JWT_SECRET` (à changer en production)
- Contient: `userId`, `email`, `role`

### ✅ Gestion d'expiration
- Vérification automatique toutes les minutes
- Buffer de 5 minutes avant expiration réelle
- Affichage de la durée restante

### ✅ Nettoyage de session
- Suppression complète des données de session à la déconnexion
- Logs des déconnexions au backend
- Gestion des erreurs 401 avec redirection

### ✅ Stockage sécurisé
- Tokens stockés dans `AsyncStorage` (chiffré automatiquement)
- Pas de stockage en variables globales
- Effacement complet à la déconnexion

---

## ⚙️ Configuration

### 1. Variables d'environnement (Backend)

Dans `Backend/server.js`, changez la clé JWT en production:

```js
// ❌ ACTUELLEMENT:
const JWT_SECRET = 'safekids_jwt_secret_2026_changez_moi_en_production';

// ✅ EN PRODUCTION:
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_tres_long_et_aleatoire';
```

### 2. URL du serveur

Dans les fichiers, changez l'URL ngrok:

```js
// Actuellement:
const SERVER_URL = 'https://gondola-reattach-relearn.ngrok-free.dev';

// Utilisez une variable d'environnement ou une config:
const SERVER_URL = process.env.SERVER_URL || 'https://...';
```

---

## 📊 Schéma de la session

```
┌─────────────────────────────────────────────────┐
│           AuthProvider (App.js)                 │
│  - Initialise la session au démarrage           │
│  - Vérifie l'expiration toutes les minutes      │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────┴──────────┬──────────┐
        │                     │          │
   useAuth()          SessionManager  ApiClient
   - signIn()         - getToken()    - get()
   - signOut()        - saveSession() - post()
   - signUp()         - clearSession()- put()
   - user             - isTokenExpired()
   - userRole         - getSessionInfo()
```

---

## 🐛 Dépannage

### Erreur: "useAuth doit être utilisé dans AuthProvider"
**Solution:** Assurez-vous que `AuthProvider` enveloppe votre `App.js`:

```jsx
<AuthProvider>
  <NavigationContainer>
    {/* Stack Navigator */}
  </NavigationContainer>
</AuthProvider>
```

### Erreur: "No authentication token found"
**Solution:** L'utilisateur est déconnecté. Rediriger vers le login:

```jsx
if (error.message.includes('No authentication token')) {
  navigation.navigate('Login');
}
```

### Token expiré mais l'utilisateur reste connecté
**Solution:** Le système vérifie automatiquement toutes les minutes, mais vous pouvez forcer un renouvellement:

```jsx
const { refreshSession } = useAuth();
const result = await refreshSession();
```

---

## 📝 Checklist d'intégration

- [ ] Vérifier que `AuthProvider` enveloppe `App.js`
- [ ] Remplacer les appels `AsyncStorage` directs par `SessionManager`
- [ ] Remplacer les appels `fetch` directs par `ApiClient`
- [ ] Utiliser `useAuth()` au lieu de `AsyncStorage` dans les composants
- [ ] Tester la déconnexion automatique après 7 jours
- [ ] Tester l'erreur 401 et redirection vers login
- [ ] Mettre à jour la clé JWT en production
- [ ] Configurer des URL de serveur pour dev/prod

---

## 🔄 Flux d'authentification

```
1. Utilisateur se connecte
   ↓
2. LoginPage appelle signIn()
   ↓
3. AuthContext appelle POST /login
   ↓
4. Backend retourne token + user
   ↓
5. SessionManager sauvegarde la session
   ↓
6. AuthContext met à jour l'état global
   ↓
7. Navigation vers le dashboard
   ↓
8. ApiClient injecte le token dans chaque requête
   ↓
9. AuthContext vérifie l'expiration toutes les minutes
   ↓
10. Si expiré → signOut() et redirection vers login
```

---

## 📞 Support

Pour toute question sur la gestion des sessions, consultez:
- `Frontend/src/utils/SessionManager.js` - Documentation détaillée
- `Frontend/src/context/AuthContext.js` - Logique d'authentification
- `Frontend/src/utils/ApiClient.js` - Gestion des appels API
