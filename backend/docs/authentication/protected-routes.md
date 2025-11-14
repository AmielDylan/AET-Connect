# 🛡️ Routes protégées

Guide pour utiliser les routes nécessitant une authentification.

## Middleware d'authentification

Toutes les routes protégées utilisent le middleware `authMiddleware` qui :

1. Vérifie la présence du header `Authorization: Bearer <token>`
2. Valide le token JWT
3. Vérifie que c'est un access token (pas refresh)
4. Injecte `req.user` avec les informations utilisateur

## Format du header

```
Authorization: Bearer <access_token>
```

## Exemple

### JavaScript/Fetch

```javascript
const response = await fetch('/api/users/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})
```

### Axios

```javascript
axios.get('/api/users/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})
```

### cURL

```bash
curl -X GET http://localhost:3001/api/users/me \
  -H "Authorization: Bearer eyJhbGc..."
```

## Réponses

### Succès (200)

La requête est traitée normalement avec `req.user` disponible côté serveur.

### Erreur 401 Unauthorized

**Token manquant :**
```json
{
  "error": "Non authentifié",
  "message": "Token manquant ou format invalide"
}
```

**Token invalide ou expiré :**
```json
{
  "error": "Token invalide ou expiré",
  "message": "Veuillez vous reconnecter"
}
```

**Type de token invalide :**
```json
{
  "error": "Type de token invalide",
  "message": "Utilisez un access token"
}
```

## Routes protégées

### Toutes les routes nécessitant auth

- `/api/auth/logout` - POST
- `/api/auth/me` - GET
- `/api/codes/*` - Toutes
- `/api/events` - POST, PATCH, DELETE
- `/api/events/:id/register` - POST
- `/api/events/:id/unregister` - DELETE
- `/api/admin/*` - Toutes (admin uniquement)
- `/api/users/*` - Toutes

### Routes publiques

- `/health` - GET
- `/api/auth/login` - POST
- `/api/auth/refresh` - POST
- `/api/register/*` - Toutes
- `/api/events` - GET (liste)
- `/api/events/:id` - GET (détails)
- `/api/schools/*` - Toutes

## Middleware par rôle

### Admin uniquement

```typescript
router.get('/admin/stats',
  authMiddleware,
  adminMiddleware,
  adminController.getStats
)
```

### Moderator ou Admin

```typescript
router.patch('/events/:id',
  authMiddleware,
  moderatorMiddleware,
  eventsController.updateEvent
)
```

## Gestion côté client

### Intercepteur Axios

```typescript
axios.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré, essayer refresh
      await refreshAccessToken()
      // Réessayer la requête
      return axios.request(error.config)
    }
    return Promise.reject(error)
  }
)
```

## Prochaines étapes

- [JWT Tokens](jwt-tokens.md)
- [Connexion & Inscription](login.md)
- [Refresh Token](refresh-token.md)
