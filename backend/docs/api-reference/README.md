# 📚 Référence API

Documentation complète de tous les endpoints de l'API AET Connect.

## Base URL

```
http://localhost:3001  (développement)
https://api.aetconnect.com  (production)
```

## Authentification

La plupart des endpoints nécessitent une authentification JWT.

### Header requis

```
Authorization: Bearer <access_token>
```

### Obtenir un token

```bash
POST /api/auth/login
```

Voir [Authentification JWT](../authentication/jwt-tokens.md) pour plus de détails.

## Format des réponses

### Succès

```json
{
  "success": true,
  "data": { ... }
}
```

### Erreur

```json
{
  "error": "Message d'erreur",
  "details": [ ... ]
}
```

## Codes HTTP

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Accès interdit |
| 404 | Non trouvé |
| 500 | Erreur serveur |

## Modules

- [Liste complète des endpoints](endpoints.md)
- [Authentification](authentication.md)
- [Codes d'erreur](errors.md)
- [Pagination & Filtres](pagination.md)
- [Rate Limiting](rate-limiting.md)
