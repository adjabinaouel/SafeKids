# 🔐 Gestion des Sessions - Résumé Rapide

## 📦 Fichiers créés

```
Frontend/
├── src/
│   ├── utils/
│   │   ├── SessionManager.js          ← Gestion du stockage de session
│   │   └── ApiClient.js               ← Wrapper pour appels API authentifiés
│   ├── context/
│   │   └── AuthContext.js             ← Contexte d'authentification global
│   ├── hooks/
│   │   └── useAuth.js                 ← Hook personnalisé pour accéder au contexte
│   ├── components/Auth/
│   │   ├── LogoutButton.example.js    ← Exemple de bouton déconnexion
│   │   └── ExampleApiUsage.js         ← Exemples d'utilisation d'ApiClient
│   └── App.example.js                 ← App.js avec AuthProvider intégré
│
Backend/
├── server.js
│   ├── POST /logout                   ← Nouvelle route de déconnexion
│   └── POST /refresh-token            ← Nouvelle route de renouvellement
│
└── GESTION_SESSIONS.md                ← Documentation complète
```

---

## 🚀 3 étapes pour intégrer

### 1️⃣ Envelopper App.js avec AuthProvider

```jsx
// App.js
import { AuthProvider } from './src/context/AuthContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          {/* Stack Navigator */}
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
```

### 2️⃣ Utiliser useAuth dans vos composants

```jsx
import { useAuth } from './src/hooks/useAuth';

function MyComponent({ navigation }) {
  const { user, userRole, signOut, getSessionInfo } = useAuth();

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  };

  return <TouchableOpacity onPress={handleLogout}><Text>Logout</Text></TouchableOpacity>;
}
```

### 3️⃣ Remplacer fetch par ApiClient

```jsx
// ❌ AVANT
const response = await fetch(`${SERVER_URL}/api/enfants`);
const data = await response.json();

// ✅ APRÈS
import { ApiClient } from '../utils/ApiClient';
const data = await ApiClient.get('/api/enfants');
```

---

## 📊 Fonctionnalités

| Fonctionnalité | Détail |
|---|---|
| **Authentification** | Login, Signup avec JWT |
| **Stockage sécurisé** | AsyncStorage chiffré |
| **Auto-refresh** | Token automatique tous les 7 jours |
| **Vérification expiration** | Check toutes les minutes |
| **Gestion d'erreur 401** | Redirection vers login |
| **Logs de session** | Traces des déconnexions |
| **Info de session** | Durée restante, expiration |
| **Déconnexion** | Nettoyage complet du stockage |

---

## 🔑 Clés de stockage

| Clé | Valeur |
|---|---|
| `userToken` | JWT Bearer token |
| `refreshToken` | Token de renouvellement (optionnel) |
| `userRole` | Admin / Parent / Medecin |
| `userData` | Objet utilisateur JSON |
| `tokenExpiry` | ISO timestamp d'expiration |
| `loginTimestamp` | ISO timestamp de connexion |

---

## 📱 Exemple complet: Écran Enfants

```jsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { ApiClient } from '../../utils/ApiClient';

export default function ChildrenScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      // ✅ ApiClient injecte automatiquement le token
      const data = await ApiClient.get('/api/enfants');
      setChildren(data);
    } catch (error) {
      if (error.message.includes('UNAUTHORIZED')) {
        // ✅ Redirection auto vers login
        await signOut();
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text>Mes enfants ({children.length})</Text>
      <FlatList
        data={children}
        renderItem={({ item }) => <Text>{item.prenom}</Text>}
        keyExtractor={(item) => item._id}
      />
    </View>
  );
}
```

---

## 🛡️ Sécurité

### ✅ Token JWT
```
Header.Payload.Signature
│      │       └─ Signé avec JWT_SECRET
│      └─ { userId, email, role }
└─ HS256
```

### ✅ Expiration
```
Créé: 2026-04-23 12:00
Expire: 2026-04-30 12:00 (7 jours)
Check: Toutes les minutes
Buffer: 5 minutes avant expiration réelle
```

### ✅ Stockage
```
AsyncStorage
└─ Chiffré automatiquement par React Native
   (utilise Keychain sur iOS, Keystore sur Android)
```

---

## 🧪 Tester

### Test 1: Vérifier la session au démarrage
```jsx
const { userToken, user, userRole } = useAuth();
console.log('Token:', userToken);
console.log('User:', user);
console.log('Role:', userRole);
```

### Test 2: Obtenir les infos de session
```jsx
const { getSessionInfo } = useAuth();
const info = await getSessionInfo();
console.log(info);
// {
//   isActive: true,
//   role: 'Medecin',
//   durationRemaining: '6d 23h 45m'
// }
```

### Test 3: Tester la déconnexion
```jsx
const { signOut } = useAuth();
const result = await signOut();
console.log(result); // { success: true }
```

### Test 4: Tester erreur 401
```jsx
// Supprimer manuellement le token dans AsyncStorage
await AsyncStorage.removeItem('userToken');

// Faire un appel API
await ApiClient.get('/api/enfants');
// → Erreur UNAUTHORIZED
// → Redirection vers login
```

---

## ⚙️ Configuration (à faire avant la production)

### Backend (server.js)
```javascript
// ❌ ACTUELLEMENT (DEV)
const JWT_SECRET = 'safekids_jwt_secret_2026_changez_moi_en_production';

// ✅ EN PRODUCTION
const JWT_SECRET = process.env.JWT_SECRET || generateSecureSecret();
```

### Frontend (variables d'environnement)
```javascript
// Créer un fichier config.js
export const CONFIG = {
  DEV: {
    SERVER_URL: 'https://gondola-reattach-relearn.ngrok-free.dev',
    JWT_EXPIRES_IN: '7d', // Local only
  },
  PROD: {
    SERVER_URL: 'https://api.safekids.app',
    JWT_EXPIRES_IN: '7d',
  },
};

// Utiliser partout
import { CONFIG } from '../config';
const API_URL = __DEV__ ? CONFIG.DEV.SERVER_URL : CONFIG.PROD.SERVER_URL;
```

---

## 🐛 Debugging

### Logs disponibles
```javascript
// Voir tous les logs liés à la session
AsyncStorage.getAllKeys().then(keys => {
  AsyncStorage.multiGet(keys).then(result => {
    console.log('AsyncStorage contents:', result);
  });
});
```

### Erreurs courantes

| Erreur | Cause | Solution |
|---|---|---|
| useAuth outside AuthProvider | AuthProvider manquant | Vérifier App.js |
| Token expired, redirect to login | Session expirée | Normal, redirection attendue |
| UNAUTHORIZED: No token | Pas de token | L'utilisateur doit se connecter |
| FORBIDDEN: No permission | Rôle insuffisant | Vérifier les permissions |

---

## 📚 Fichiers de référence

- `GESTION_SESSIONS.md` - Documentation complète avec exemples
- `Frontend/src/utils/SessionManager.js` - Toutes les méthodes de gestion de session
- `Frontend/src/context/AuthContext.js` - Logique d'authentification
- `Frontend/src/utils/ApiClient.js` - Gestion des appels API
- `Frontend/src/components/Auth/LogoutButton.example.js` - Exemple de déconnexion
- `Frontend/src/components/Auth/ExampleApiUsage.js` - Exemples d'appels API

---

## ✅ Checklist d'intégration

- [ ] Envelopper App.js avec `<AuthProvider>`
- [ ] Tester la connexion
- [ ] Remplacer les `fetch` directs par `ApiClient`
- [ ] Ajouter la déconnexion dans Settings
- [ ] Tester la redirection 401
- [ ] Tester l'expiration du token (7 jours)
- [ ] Vérifier les logs de session au backend
- [ ] Mettre à jour JWT_SECRET en production
- [ ] Configurer les URLs de serveur (dev/prod)
- [ ] Documenter les permissions par rôle

---

**🎉 Gestion des sessions prête à l'emploi!**
