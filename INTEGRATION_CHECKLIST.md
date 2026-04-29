# ✅ CHECKLIST D'INTÉGRATION - Gestion des Sessions

## Phase 1: Préparation (5 minutes)

- [ ] Lire `SESSIONS_QUICK_START.md` (vue d'ensemble)
- [ ] Lire `GESTION_SESSIONS.md` (documentation détaillée)
- [ ] Lire `ARCHITECTURE_SESSIONS.md` (flux et architecture)
- [ ] Avoir `package.json` à jour avec:
  - `@react-native-async-storage/async-storage`
  - `@react-navigation/native`
  - `jwt-decode` (optionnel)

---

## Phase 2: Backend (10 minutes)

### ✓ Étape 1: Vérifier les endpoints du login

```bash
# Dans Backend/server.js, vérifier que POST /login existe
# Lignes ~218
grep -n "app.post('/login'" Backend/server.js
```

**Vérifier que:**
- [ ] JWT_SECRET est défini
- [ ] Token retourne `{ success, token, user }`
- [ ] User ne contient pas le mot de passe

### ✓ Étape 2: Ajouter les nouveaux endpoints

```bash
# Vérifier que POST /logout existe
# Vérifier que POST /refresh-token existe
# Ils devraient avoir été ajoutés automatiquement
grep -n "app.post('/logout'" Backend/server.js
grep -n "app.post('/refresh-token'" Backend/server.js
```

**Vérifier que:**
- [ ] `/logout` - avec authenticateToken middleware
- [ ] `/refresh-token` - retourne nouveau token

### ✓ Étape 3: Tester les endpoints

```bash
# 1. Test login
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","motDePasse":"password","role":"Medecin"}'

# Réponse attendue:
# { "success": true, "token": "...", "user": {...} }

# 2. Test refresh (remplacer <TOKEN> par le vrai token)
curl -X POST http://localhost:5000/refresh-token \
  -H "Authorization: Bearer <TOKEN>"

# Réponse attendue:
# { "success": true, "token": "..." }

# 3. Test logout (remplacer <TOKEN> par le vrai token)
curl -X POST http://localhost:5000/logout \
  -H "Authorization: Bearer <TOKEN>"

# Réponse attendue:
# { "success": true, "message": "..." }
```

---

## Phase 3: Frontend - Structure (5 minutes)

### ✓ Étape 1: Créer les dossiers

```bash
# Dans Frontend/src/
mkdir -p utils
mkdir -p context
mkdir -p hooks
mkdir -p components/Auth

# Vérifier les fichiers créés
ls -la Frontend/src/utils/SessionManager.js
ls -la Frontend/src/context/AuthContext.js
ls -la Frontend/src/hooks/useAuth.js
ls -la Frontend/src/utils/ApiClient.js
```

**Vérifier que:**
- [ ] `Frontend/src/utils/SessionManager.js` existe
- [ ] `Frontend/src/context/AuthContext.js` existe
- [ ] `Frontend/src/hooks/useAuth.js` existe
- [ ] `Frontend/src/utils/ApiClient.js` existe

### ✓ Étape 2: Vérifier le contenu des fichiers

```bash
# Chaque fichier doit avoir au minimum:
grep -c "export" Frontend/src/utils/SessionManager.js    # Doit retourner > 0
grep -c "export" Frontend/src/context/AuthContext.js     # Doit retourner > 0
grep -c "export" Frontend/src/hooks/useAuth.js           # Doit retourner > 0
grep -c "export" Frontend/src/utils/ApiClient.js         # Doit retourner > 0
```

---

## Phase 4: Frontend - App.js (5 minutes)

### ✓ Étape 1: Sauvegarder la version actuelle

```bash
cp Frontend/src/App.js Frontend/src/App.js.backup
```

### ✓ Étape 2: Ajouter l'import AuthProvider

```javascript
// En haut du fichier
import { AuthProvider } from './src/context/AuthContext';
```

### ✓ Étape 3: Envelopper avec AuthProvider

**Avant:**
```jsx
export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {/* ... */}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
```

**Après:**
```jsx
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator>
            {/* ... */}
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
```

**Vérifier que:**
- [ ] `<AuthProvider>` enveloppe `<NavigationContainer>`
- [ ] App.js compile sans erreur
- [ ] Pas de warning "useAuth outside AuthProvider"

---

## Phase 5: Intégration LoginPage (10 minutes)

### ✓ Étape 1: Ajouter l'import useAuth

```javascript
import { useAuth } from '../../hooks/useAuth';
```

### ✓ Étape 2: Utiliser useAuth au lieu d'AsyncStorage

**Avant:**
```javascript
const handleLogin = async () => {
  const response = await fetch(`${SERVER_URL}/login`, {...});
  const data = await response.json();
  
  await AsyncStorage.setItem('userToken', data.token);
  await AsyncStorage.setItem('userRole', data.user.role);
  await AsyncStorage.setItem('userData', JSON.stringify(data.user));
  
  navigation.reset({...});
};
```

**Après:**
```javascript
const { signIn } = useAuth();

const handleLogin = async () => {
  const result = await signIn(email, password, role);
  
  if (result.success) {
    navigation.reset({
      index: 0,
      routes: [{ name: ROLE_SCREENS[role] }],
    });
  } else {
    setErrorMsg(result.error);
  }
};
```

**Vérifier que:**
- [ ] Import `useAuth` fonctionne
- [ ] `signIn()` retourne `{ success, error }`
- [ ] LoginPage compile sans erreur
- [ ] Test de connexion fonctionne

---

## Phase 6: Intégration SettingsScreen (10 minutes)

### ✓ Étape 1: Ajouter le bouton de déconnexion

Voir `Frontend/src/components/Auth/LogoutButton.example.js`

```javascript
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

export function LogoutButton({ navigation }) {
  const { signOut } = useAuth();
  
  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            const result = await signOut();
            if (result.success) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          },
        },
      ]
    );
  };
  
  return (
    <TouchableOpacity
      style={styles.logoutButton}
      onPress={handleLogout}
    >
      <Ionicons name="log-out-outline" size={20} color="#FFF" />
      <Text style={styles.logoutButtonText}>Se déconnecter</Text>
    </TouchableOpacity>
  );
}
```

**Vérifier que:**
- [ ] Bouton "Se déconnecter" apparaît
- [ ] Clic redirige vers Login
- [ ] AsyncStorage est vide après déconnexion

---

## Phase 7: Intégration ApiClient (15 minutes)

### ✓ Étape 1: Remplacer les appels fetch simples

**Avant:** (n'importe quel écran)
```javascript
const response = await fetch(`${SERVER_URL}/api/enfants`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();
```

**Après:**
```javascript
import { ApiClient } from '../../utils/ApiClient';

const data = await ApiClient.get('/api/enfants');
```

### ✓ Étape 2: Ajouter la gestion d'erreur 401

```javascript
const loadData = async () => {
  try {
    const data = await ApiClient.get('/api/enfants');
    setData(data);
  } catch (error) {
    if (error.message.includes('UNAUTHORIZED')) {
      // Token expiré - redirection auto au login
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } else {
      Alert.alert('Erreur', error.message);
    }
  }
};
```

**Fichiers à mettre à jour:**
- [ ] `PatientsScreen.js` - Récupère la liste des enfants
- [ ] `DashboardMedecin.js` - Appels au dashboard
- [ ] `ChildProfile.js` - Récupère/met à jour les données
- [ ] `AddChildren.js` - Crée un enfant
- [ ] `NotificationsMedecin.js` - Récupère les notifications
- [ ] (Tous les écrans qui font des appels API)

### ✓ Étape 3: Tester les appels API

```bash
# 1. Se connecter d'abord
# 2. Naviguer vers PatientsScreen
# 3. Vérifier que la liste des enfants s'affiche
# 4. Vérifier dans les logs qu'il n'y a pas d'erreur d'authentification
```

---

## Phase 8: Tests de sécurité (15 minutes)

### ✓ Test 1: Vérifier la session au démarrage

```javascript
// Dans App.js ou n'importe quel écran
import { useAuth } from './hooks/useAuth';

function TestScreen() {
  const { userToken, user, userRole, isLoading } = useAuth();
  
  useEffect(() => {
    console.log('=== Session Info ===');
    console.log('isLoading:', isLoading);
    console.log('userToken:', userToken);
    console.log('user:', user);
    console.log('userRole:', userRole);
  }, [userToken]);
  
  return <Text>Check console</Text>;
}
```

**Vérifier que:**
- [ ] Au démarrage: `isLoading: true` → `isLoading: false`
- [ ] Après login: `userToken` contient un JWT
- [ ] `user` contient les données d'utilisateur
- [ ] `userRole` contient Admin/Parent/Medecin

### ✓ Test 2: Vérifier la sauvegarde AsyncStorage

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

async function testStorage() {
  const keys = await AsyncStorage.getAllKeys();
  const values = await AsyncStorage.multiGet(keys);
  
  console.log('AsyncStorage contents:');
  values.forEach(([key, value]) => {
    console.log(`${key}:`, value?.substring(0, 50) + '...');
  });
}

// À appeler après login
testStorage();
```

**Vérifier que:**
- [ ] `userToken` existe et n'est pas vide
- [ ] `userData` existe et contient les infos user
- [ ] `tokenExpiry` existe et est une date future
- [ ] `loginTimestamp` existe et est récent

### ✓ Test 3: Vérifier la déconnexion

```javascript
// Après clic sur "Se déconnecter"
async function testLogout() {
  const keys = await AsyncStorage.getAllKeys();
  console.log('AsyncStorage après logout:', keys);
  // Devrait être vide []
}
```

**Vérifier que:**
- [ ] Tous les clés de session sont supprimées
- [ ] Navigation redirige vers Login
- [ ] Pas d'erreur 401 après déconnexion

### ✓ Test 4: Vérifier l'expiration du token

```javascript
// Modifier le token pour le rendre expiré (pour tester)
import SessionManager from './utils/SessionManager';

async function testExpiration() {
  // Créer un token expiré (date passée)
  await AsyncStorage.setItem('tokenExpiry', new Date(Date.now() - 1000).toISOString());
  
  // Naviguer vers un écran qui fait un appel API
  // Devrait rediriger vers Login automatiquement
}
```

**Vérifier que:**
- [ ] Détection automatique toutes les minutes
- [ ] Redirection vers Login sans interaction utilisateur
- [ ] Message "Session expirée" (optionnel)

### ✓ Test 5: Vérifier l'erreur 401

```javascript
// Dans ApiClient, forcer une erreur 401 pour tester
// (Commenter temporairement la ligne qui injecte le token)

async function testUnauthorized() {
  try {
    await ApiClient.get('/api/enfants');
  } catch (error) {
    console.log('Error:', error.message);
    // Devrait contenir "UNAUTHORIZED"
  }
}
```

**Vérifier que:**
- [ ] Erreur 401 détectée
- [ ] SessionManager.clearSession() appelé
- [ ] Navigation vers Login effectuée

---

## Phase 9: Production (5 minutes)

### ✓ Étape 1: Mise à jour de JWT_SECRET

**Actuellement (DEV):**
```javascript
const JWT_SECRET = 'safekids_jwt_secret_2026_changez_moi_en_production';
```

**À faire (PROD):**
```javascript
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  throw new Error('JWT_SECRET not configured!');
})();
```

### ✓ Étape 2: Configuration des URLs

**Créer `Frontend/src/config.js`:**
```javascript
export const CONFIG = {
  DEV: {
    SERVER_URL: 'https://gondola-reattach-relearn.ngrok-free.dev',
  },
  PROD: {
    SERVER_URL: 'https://api.safekids.app',
  },
};

export const API_URL = __DEV__ 
  ? CONFIG.DEV.SERVER_URL 
  : CONFIG.PROD.SERVER_URL;
```

Puis utiliser partout:
```javascript
import { API_URL } from './config';
const SERVER_URL = API_URL;
```

### ✓ Étape 3: Vérifications finales

- [ ] Pas de console.log() de tokens ou mots de passe
- [ ] Pas de hardcoded JWT_SECRET en PROD
- [ ] HTTPS utilisé en production
- [ ] Gestion d'erreur complète
- [ ] Logs de session au backend activés

---

## Phase 10: Documentation et maintenance (5 minutes)

### ✓ Documentation

- [ ] Créer un fichier `SESSIONS.md` pour l'équipe
- [ ] Documenter les rôles et permissions
- [ ] Créer un guide de dépannage
- [ ] Tester tous les rôles (Admin, Parent, Medecin)

### ✓ Maintenance

- [ ] Vérifier les logs de session au backend chaque semaine
- [ ] Monitorer les erreurs 401
- [ ] Vérifier la performance des vérifications d'expiration
- [ ] Tester les renouvellements de token
- [ ] Mettre à jour JWT_SECRET tous les 6 mois

---

## 🎉 Résumé par temps estimé

| Phase | Temps | Points clés |
|---|---|---|
| 1. Préparation | 5 min | Lire la documentation |
| 2. Backend | 10 min | Tester les endpoints |
| 3-4. Frontend setup | 10 min | Structure et App.js |
| 5-7. Intégration | 35 min | LoginPage, Settings, ApiClient |
| 8. Tests sécurité | 15 min | Validation complète |
| 9. Production | 5 min | Configuration |
| 10. Documentation | 5 min | Guide de l'équipe |
| **TOTAL** | **85 min** | ~1.5 heures |

---

## 🚀 Commandes utiles pour tester

```bash
# Terminal 1: Backend
cd Backend
npm start

# Terminal 2: Frontend
cd Frontend
npm start

# Test curl (Backend):
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","motDePasse":"password","role":"Medecin"}'

# Monitorer les logs:
tail -f Backend/logs.txt
```

---

## 📞 Support et dépannage

Si vous rencontrez une erreur:

1. **"useAuth must be used within AuthProvider"**
   → Vérifier que App.js est enveloppe avec `<AuthProvider>`

2. **"No authentication token found"**
   → L'utilisateur n'est pas connecté - normal après déconnexion

3. **"Token expired"**
   → Normal après 7 jours - redirection auto vers login

4. **"UNAUTHORIZED: Session expired"**
   → Le token s'est expirééouvent au démarrage après 7j inactivité

5. **ApiClient retourne 401 mais sans redirection**
   → Vérifier que le composant utilise `useAuth()` pour la navigation

Consultez `GESTION_SESSIONS.md` section "🐛 Dépannage" pour plus de détails.

---

**✅ Quand tous les checks sont validés, la gestion des sessions est prête!**
