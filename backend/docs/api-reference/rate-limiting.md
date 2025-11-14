# 🚦 Rate Limiting

Limites de taux pour protéger l'API contre les abus.

## Statut actuel

⚠️ **Rate limiting non implémenté en V1**

Le rate limiting sera ajouté dans une version future.

## Recommandations pour V2

### Limites proposées

| Endpoint | Limite | Fenêtre |
|----------|--------|---------|
| `/api/auth/login` | 5 req/min | Par IP |
| `/api/auth/refresh` | 10 req/min | Par IP |
| `/api/register/*` | 3 req/min | Par IP |
| `/api/codes/generate` | 1 req/min | Par utilisateur |
| Autres endpoints | 100 req/min | Par utilisateur |

### Headers de réponse

Quand le rate limiting sera implémenté, les headers suivants seront retournés :

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1638360000
```

### Réponse 429 Too Many Requests

```json
{
  "error": "Too many requests",
  "message": "Vous avez dépassé la limite de requêtes. Réessayez dans 60 secondes.",
  "retry_after": 60
}
```

## Implémentation future

Le rate limiting sera implémenté avec :
- **express-rate-limit** pour les limites par IP
- **Redis** pour le stockage distribué
- Middleware personnalisé pour les limites par utilisateur

## Prochaines étapes

- [Référence API complète](endpoints.md)
- [Codes d'erreur](errors.md)

