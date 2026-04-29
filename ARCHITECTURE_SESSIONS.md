# 🏗️ Architecture de Gestion des Sessions

## 🔄 Flux d'authentification complet

```
┌─────────────────────────────────────────────────────────────────┐
│                        APP (Utilisateur)                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ 1. Entre email/password/role
                         ▼
                 ┌──────────────────┐
                 │   LoginPage      │
                 │  (signIn)        │
                 └────────┬─────────┘
                          │
                          │ 2. Appelle AuthContext.signIn()
                          ▼
      ┌───────────────────────────────────────┐
      │      AuthContext (Global State)        │
      │  - isLoading, userToken, user, role   │
      │  - Fonctions: signIn, signOut, etc.   │
      └─────────────────┬─────────────────────┘
                        │
                        │ 3. POST /login
                        ▼
      ┌───────────────────────────────────────┐
      │    Backend (Express + MongoDB)        │
      │  1. Vérifie email/password            │
      │  2. Crée JWT token                    │
      │  3. Retourne token + user             │
      └─────────────────┬─────────────────────┘
                        │
                        │ 4. Response: { token, user }
                        ▼
      ┌───────────────────────────────────────┐
      │  SessionManager (Stockage Local)      │
      │  1. Sauvegarde token                  │
      │  2. Sauvegarde user                   │
      │  3. Sauvegarde tokenExpiry            │
      │  4. Sauvegarde loginTimestamp         │
      └─────────────────┬─────────────────────┘
                        │
                        │ 5. Met à jour AuthContext
                        ▼
      ┌───────────────────────────────────────┐
      │    Navigation vers le Dashboard       │
      │  (Admin/Parent/Medecin)               │
      └───────────────────────────────────────┘
```

## 🔐 Flux d'appels API authentifiés

```
┌──────────────────────┐
│  Composant (page)    │
└──────────┬───────────┘
           │
           │ ApiClient.get('/api/enfants')
           ▼
┌──────────────────────────────┐
│   ApiClient (Wrapper API)    │
│  1. Récupère le token        │
│  2. Ajoute Authorization:    │
│     Bearer <token>           │
│  3. Ajoute Content-Type:JSON │
└──────────┬───────────────────┘
           │
           │ fetch() avec headers
           ▼
┌──────────────────────────────┐
│  Backend (Express)           │
│  1. Vérifie Authorization    │
│  2. Vérifie JWT.verify()     │
│  3. Retourne données         │
└──────────┬───────────────────┘
           │
           ├─ 200: { data }
           │
           ├─ 401: Token invalide/expiré
           │  → ApiClient.signOut()
           │  → Navigation('Login')
           │
           └─ 403: Permission insuffisante
              → Affiche erreur
```

## ⏰ Vérification automatique de l'expiration

```
┌──────────────────────────────────────┐
│  AuthProvider monte                  │
│  (useEffect)                         │
└──────────────┬───────────────────────┘
               │
               │ Crée interval de 60s
               │
               ▼
      ╔════════════════════╗
      ║ Chaque minute:     ║
      ║ 1. Récupère token  ║
      ║ 2. Vérifie expiry  ║
      ║ 3. Compare dates   ║
      ╚════┬═══════════════╝
           │
           ├─ Token valide → Continue
           │
           └─ Token expiré → signOut()
              └─ Efface session
              └─ Navigation('Login')
```

## 📱 Structure de données AsyncStorage

```json
{
  "userToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "optional_refresh_token_if_available",
  "userRole": "Medecin",
  "userData": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0",
    "email": "doctor@safekids.app",
    "prenom": "Jean",
    "nom": "Dupont",
    "role": "Medecin",
    "specialite": "Pédopsychiatrie",
    "status": "actif"
  },
  "tokenExpiry": "2026-04-30T15:30:00.000Z",
  "loginTimestamp": "2026-04-23T15:30:00.000Z"
}
```

## 🔄 Décodage du JWT

```
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGExYjJjM2Q0ZTVmNmdwaiIsImVtYWlsIjoiZG9jdG9yQHNhZmVraWRzLmFwcCIsInJvbGUiOiJNZWRlY2luIiwiaWF0IjoxNzEzODY2NjAwLCJleHAiOjE3MTQ0NzE0MDB9.abc123xyz...

├─ Header
│  └─ { alg: 'HS256', typ: 'JWT' }
│
├─ Payload (ce qu'on utilise)
│  └─ {
│       userId: '64a1b2c3d4e5f6g7h8i9j0',
│       email: 'doctor@safekids.app',
│       role: 'Medecin',
│       iat: 1713866600,     // Créé
│       exp: 1714471400      // Expire (7j après)
│     }
│
└─ Signature (vérifie l'intégrité)
   └─ HMACSHA256(Base64Url(header) + '.' + Base64Url(payload), secret)
```

## 🔐 Sécurité en couches

```
┌─────────────────────────────────────┐
│  Couche 1: AsyncStorage (Local)     │
│  ├─ Chiffré par le système (iOS/Android)
│  └─ Clés: userToken, userData, ...
└─────────────────────────────────────┘
                 ▲
                 │
┌─────────────────────────────────────┐
│  Couche 2: SessionManager           │
│  ├─ Valide l'expiration
│  ├─ Récupère les tokens
│  └─ Gère le nettoyage
└─────────────────────────────────────┘
                 ▲
                 │
┌─────────────────────────────────────┐
│  Couche 3: ApiClient                │
│  ├─ Injecte Authorization header
│  ├─ Gère les erreurs 401/403
│  └─ Renouvelle les tokens
└─────────────────────────────────────┘
                 ▲
                 │
┌─────────────────────────────────────┐
│  Couche 4: Backend (Express)        │
│  ├─ Vérifie JWT.verify()
│  ├─ Authentifie la requête
│  └─ Applique les permissions
└─────────────────────────────────────┘
```

## 📊 États du composant LoginPage

```
START
  │
  ├─ isLoading: false
  ├─ email: ''
  ├─ password: ''
  ├─ role: 'Parent'
  └─ errorMsg: ''
  
  │ Utilisateur remplit formulaire
  ▼
  
FORM_FILLED
  ├─ email: 'user@example.com'
  ├─ password: '••••••••'
  └─ role: 'Medecin'
  
  │ Clic sur "Se connecter"
  ▼
  
LOADING
  ├─ isLoading: true
  └─ (appel API en cours)
  
  │
  ├─ Succès
  │  ▼
  │  TOKEN_SAVED
  │  └─ userToken: '...'
  │  └─ Navigation vers Dashboard
  │
  └─ Erreur
     ▼
     ERROR_DISPLAYED
     ├─ isLoading: false
     └─ errorMsg: 'Email ou mot de passe incorrect'
```

## 🔄 Cycle de vie d'une session

```
T=0s         Login
             ▼
             User authentifié
             Token créé (exp: T+7d)
             SessionManager sauvegarde
             ▼
T=0h-7d      Utilisateur actif
             ✅ Appels API fonctionnent
             ✅ Token valide
             ✅ Vérification auto toutes les minutes
             ▼
T=6d 23h     Token proche de l'expiration
             ⚠️  Buffer de 5 min activé
             AuthContext détecte l'expiration
             ▼
T=7d         Expiration atteinte
             ❌ isTokenExpired() = true
             SessionManager.clearSession()
             AuthContext.signOut()
             Navigation('Login')
             ▼
             Utilisateur redémarrage
             Page de connexion
             (cycle recommence)
```

## 🎯 Points de redirection

```
TOUTES LES PAGES
        │
        ├─ Erreur 401 (UNAUTHORIZED)
        │  └─ ApiClient détecte
        │     └─ SessionManager.clearSession()
        │        └─ Navigation.reset({ Login })
        │
        ├─ Token expiré
        │  └─ AuthProvider détecte (vérif 1/min)
        │     └─ AuthContext.signOut()
        │        └─ Navigation.reset({ Login })
        │
        └─ Utilisateur clique "Logout"
           └─ AuthContext.signOut()
              └─ POST /logout (backend)
              └─ SessionManager.clearSession()
              └─ Navigation.reset({ Login })
```

## 📈 Chaîne d'appels (Stack Trace type)

```
ChildrenScreen.js
  └─ useAuth() [hook]
      └─ AuthContext [provider]
          ├─ userToken ✓
          ├─ user ✓
          └─ signOut() → POST /logout
  
  └─ ApiClient.get('/api/enfants') [appel API]
      └─ SessionManager.getToken()
          └─ AsyncStorage.getItem('userToken')
      └─ fetch() avec Authorization header
          └─ Backend vérifie JWT
              └─ MongoDB retourne données
          └─ Response 200 or 401
              └─ Si 401: SessionManager.clearSession()
```

## 🎁 Données retournées par API

```javascript
// POST /login
{
  success: true,
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {
    _id: ObjectId,
    email: string,
    prenom: string,
    nom: string,
    role: 'Admin' | 'Parent' | 'Medecin',
    specialite?: string,
    status: 'actif' | 'bloque',
    avatar?: string,
    telephone?: string,
    dateCreation: ISO_Date
  },
  mustChangePassword?: boolean
}

// POST /logout
{
  success: true,
  message: "Déconnecté avec succès"
}

// POST /refresh-token
{
  success: true,
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  message: "Token renouvelé avec succès"
}
```

---

**Cette architecture garantit:**
- ✅ Authentification sécurisée avec JWT
- ✅ Gestion automatique de l'expiration
- ✅ Redirection transparente vers le login
- ✅ Récupération sécurisée des tokens
- ✅ Nettoyage complet à la déconnexion
