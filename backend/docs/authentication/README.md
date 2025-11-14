# 🔐 Authentification

Système d'authentification JWT complet pour AET Connect.

## Vue d'ensemble

L'authentification utilise **JWT (JSON Web Tokens)** avec deux types de tokens :

- **Access Token** : Durée de vie courte (15 minutes)
- **Refresh Token** : Durée de vie longue (7 jours)

## Endpoints

| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/api/auth/login` | POST | ❌ | Connexion utilisateur |
| `/api/auth/logout` | POST | ✅ | Déconnexion |
| `/api/auth/refresh` | POST | ❌ | Renouveler tokens |
| `/api/auth/me` | GET | ✅ | Profil utilisateur connecté |

## Flow complet

### 1. Connexion

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Réponse :**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "Jean",
    "last_name": "Dupont",
    "role": "alumni"
  },
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc..."
}
```

### 2. Requêtes protégées

```bash
GET /api/users/me
Authorization: Bearer eyJhbGc...
```

### 3. Refresh Token

Quand l'access token expire :

```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGc..."
}
```

**Réponse :**
```json
{
  "success": true,
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc..."
}
```

## Sécurité

- ✅ Tokens signés avec secret JWT
- ✅ Access token courte durée (15min)
- ✅ Refresh token longue durée (7j)
- ✅ Vérification stricte du type de token
- ✅ Mots de passe hashés avec bcrypt

## Pages détaillées

- [JWT Tokens](jwt-tokens.md) - Détails techniques
- [Connexion & Inscription](login.md) - Guide complet
- [Routes protégées](protected-routes.md) - Utilisation
- [Refresh Token](refresh-token.md) - Gestion du refresh
