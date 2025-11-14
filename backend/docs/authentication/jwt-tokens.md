# 🔑 JWT Tokens

Documentation technique des tokens JWT utilisés dans AET Connect.

## Structure des tokens

### Access Token

**Durée de vie** : 15 minutes  
**Type** : `access`  
**Usage** : Requêtes API protégées

**Payload :**
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "role": "alumni",
  "type": "access",
  "iat": 1234567890,
  "exp": 1234568790
}
```

### Refresh Token

**Durée de vie** : 7 jours  
**Type** : `refresh`  
**Usage** : Renouveler l'access token

**Payload :**
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "role": "alumni",
  "type": "refresh",
  "iat": 1234567890,
  "exp": 1234571490
}
```

## Génération

Les tokens sont générés avec `jsonwebtoken` :

```typescript
import jwt from 'jsonwebtoken'

const accessToken = jwt.sign(
  {
    user_id: user.id,
    email: user.email,
    role: user.role,
    type: 'access'
  },
  process.env.JWT_SECRET,
  { expiresIn: '15m' }
)
```

## Vérification

Le middleware `authMiddleware` vérifie chaque requête :

```typescript
const token = req.headers.authorization?.substring(7) // Enlever "Bearer "
const payload = jwt.verify(token, JWT_SECRET)

if (payload.type !== 'access') {
  return res.status(401).json({ error: 'Type de token invalide' })
}

req.user = {
  id: payload.user_id,
  email: payload.email,
  role: payload.role
}
```

## Stockage côté client

### Recommandations

**Access Token** :
- Stocker en mémoire (variable JavaScript)
- Ne jamais stocker dans localStorage
- Supprimer à la déconnexion

**Refresh Token** :
- Stocker dans httpOnly cookie (recommandé)
- Ou localStorage (moins sécurisé)
- Supprimer à la déconnexion

### Exemple (React)

```typescript
// Stockage en mémoire
let accessToken: string | null = null

// Après login
accessToken = response.data.access_token
localStorage.setItem('refresh_token', response.data.refresh_token)

// Requêtes API
fetch('/api/users/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})
```

## Gestion de l'expiration

### Détecter l'expiration

L'API retourne `401 Unauthorized` quand le token est expiré :

```json
{
  "error": "Token invalide ou expiré",
  "message": "Veuillez vous reconnecter"
}
```

### Renouveler automatiquement

```typescript
async function apiCall(url: string, options: RequestInit) {
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`
    }
  })
  
  // Token expiré
  if (response.status === 401) {
    // Renouveler avec refresh token
    const refreshResponse = await fetch('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({
        refresh_token: localStorage.getItem('refresh_token')
      })
    })
    
    const { access_token } = await refreshResponse.json()
    accessToken = access_token
    
    // Réessayer la requête originale
    response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`
      }
    })
  }
  
  return response
}
```

## Sécurité

### Secret JWT

⚠️ **Important** : Utilisez un secret fort (minimum 32 caractères) :

```bash
# Générer un secret aléatoire
openssl rand -base64 32
```

### Rotation des tokens

Les refresh tokens sont régénérés à chaque refresh pour éviter la réutilisation.

### Révocation

Actuellement, les tokens ne peuvent pas être révoqués. Pour la production, considérer :
- Blacklist des tokens révoqués (Redis)
- Rotation des secrets JWT
- Expiration plus courte des refresh tokens

## Exemples

### Décoder un token (debug)

```typescript
import jwt from 'jsonwebtoken'

const decoded = jwt.decode(token, { complete: true })
console.log(decoded.payload)
```

### Vérifier l'expiration

```typescript
const payload = jwt.decode(token) as any
const isExpired = payload.exp * 1000 < Date.now()
```

## Prochaines étapes

- [Connexion & Inscription](login.md)
- [Routes protégées](protected-routes.md)
- [Refresh Token](refresh-token.md)
