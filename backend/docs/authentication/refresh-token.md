# 🔄 Refresh Token

Guide pour renouveler automatiquement les tokens JWT.

## Pourquoi refresh token ?

L'access token expire après **15 minutes** pour des raisons de sécurité. Le refresh token (durée de vie : **7 jours**) permet de renouveler l'access token sans re-login.

## Endpoint

```
POST /api/auth/refresh
```

## Requête

```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGc..."
  }'
```

## Réponse

**Succès (200) :**
```json
{
  "success": true,
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc..."
}
```

**Erreur (401) :**
```json
{
  "error": "Refresh token invalide ou expiré"
}
```

## Implémentation côté client

### Fonction de refresh

```typescript
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refresh_token')
  
  if (!refreshToken) {
    // Rediriger vers login
    window.location.href = '/login'
    return null
  }
  
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    })
    
    if (!response.ok) {
      throw new Error('Refresh failed')
    }
    
    const data = await response.json()
    
    // Mettre à jour les tokens
    accessToken = data.access_token
    localStorage.setItem('refresh_token', data.refresh_token)
    
    return accessToken
  } catch (error) {
    // Refresh token invalide, rediriger vers login
    localStorage.removeItem('refresh_token')
    window.location.href = '/login'
    return null
  }
}
```

### Intercepteur automatique

```typescript
async function apiCall(url: string, options: RequestInit = {}) {
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`
    }
  })
  
  // Token expiré (401)
  if (response.status === 401) {
    // Renouveler le token
    const newToken = await refreshAccessToken()
    
    if (!newToken) {
      throw new Error('Authentication failed')
    }
    
    // Réessayer la requête originale
    response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${newToken}`
      }
    })
  }
  
  return response
}
```

## Quand refresh ?

### Stratégie recommandée

1. **Avant chaque requête** : Vérifier si l'access token est expiré
2. **Sur erreur 401** : Refresh automatique puis réessayer
3. **Proactivement** : Refresh 1 minute avant expiration

### Vérifier l'expiration

```typescript
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp * 1000 // Convertir en millisecondes
    return Date.now() >= exp
  } catch {
    return true
  }
}

// Utilisation
if (isTokenExpired(accessToken)) {
  await refreshAccessToken()
}
```

## Sécurité

### Rotation des tokens

À chaque refresh, un **nouveau refresh token** est généré. L'ancien devient invalide.

### Stockage sécurisé

- **Access token** : En mémoire uniquement
- **Refresh token** : Cookie httpOnly (recommandé) ou localStorage

### Révocation

Actuellement, les tokens ne peuvent pas être révoqués. Pour la production, considérer :
- Blacklist des tokens révoqués (Redis)
- Rotation des secrets JWT
- Expiration plus courte des refresh tokens

## Exemple complet (React)

```typescript
import { useState, useEffect } from 'react'

function useAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  
  useEffect(() => {
    // Récupérer le refresh token au chargement
    const refreshToken = localStorage.getItem('refresh_token')
    if (refreshToken) {
      refreshAccessToken()
    }
  }, [])
  
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) return
    
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    })
    
    if (response.ok) {
      const data = await response.json()
      setAccessToken(data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
    } else {
      // Rediriger vers login
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
    }
  }
  
  return { accessToken, refreshAccessToken }
}
```

## Prochaines étapes

- [JWT Tokens](jwt-tokens.md)
- [Routes protégées](protected-routes.md)
- [Connexion & Inscription](login.md)
