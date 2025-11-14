# 🔑 Connexion & Inscription

Guide complet pour se connecter et s'inscrire sur AET Connect.

## Connexion

### Endpoint

```
POST /api/auth/login
```

### Requête

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Réponse

**Succès (200) :**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "Jean",
    "last_name": "Dupont",
    "role": "alumni",
    "is_ambassador": false,
    "school_id": "uuid",
    "entry_year": "2020"
  },
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc..."
}
```

**Erreur (401) :**
```json
{
  "error": "Email ou mot de passe incorrect"
}
```

## Inscription

Le processus d'inscription se fait en plusieurs étapes via le module Registration.

### 1. Vérifier école + promo

```bash
POST /api/register/check-school-promo
```

### 2. Demander un accès initial

```bash
POST /api/register/request-initial-access
```

### 3. Vérifier un code d'invitation

```bash
POST /api/register/verify-invitation-code
```

### 4. Finaliser l'inscription

```bash
POST /api/register/complete-registration
```

Voir [Module Registration](../modules/registration/README.md) pour plus de détails.

## Stockage des tokens

### Access Token

Stockez-le en mémoire (variable JavaScript) :

```typescript
let accessToken: string | null = null

// Après login
accessToken = response.data.access_token
```

### Refresh Token

Stockez-le dans un cookie httpOnly (recommandé) ou localStorage :

```typescript
// Cookie httpOnly (recommandé)
document.cookie = `refresh_token=${refreshToken}; HttpOnly; Secure; SameSite=Strict`

// Ou localStorage (moins sécurisé)
localStorage.setItem('refresh_token', refreshToken)
```

## Utilisation des tokens

### Requêtes protégées

```typescript
fetch('/api/users/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})
```

### Gestion de l'expiration

Voir [Refresh Token](refresh-token.md) pour la gestion automatique.

## Prochaines étapes

- [JWT Tokens](jwt-tokens.md)
- [Routes protégées](protected-routes.md)
- [Refresh Token](refresh-token.md)
