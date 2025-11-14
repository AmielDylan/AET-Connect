# ⚠️ Codes d'erreur

Liste complète des codes d'erreur et messages retournés par l'API.

## Codes HTTP

| Code | Description | Exemple |
|------|-------------|---------|
| 200 | Succès | Requête réussie |
| 201 | Créé | Ressource créée |
| 400 | Requête invalide | Données manquantes ou invalides |
| 401 | Non authentifié | Token manquant ou expiré |
| 403 | Accès interdit | Permissions insuffisantes |
| 404 | Non trouvé | Ressource inexistante |
| 500 | Erreur serveur | Erreur interne |

## Messages d'erreur

### Authentification

#### 401 Unauthorized

```json
{
  "error": "Non authentifié",
  "message": "Token manquant ou format invalide"
}
```

```json
{
  "error": "Token invalide ou expiré",
  "message": "Veuillez vous reconnecter"
}
```

```json
{
  "error": "Email ou mot de passe incorrect"
}
```

#### 403 Forbidden

```json
{
  "error": "Accès interdit",
  "message": "Vous devez être administrateur"
}
```

### Validation

#### 400 Bad Request

```json
{
  "error": "Validation error",
  "details": [
    {
      "field": "email",
      "message": "Email invalide"
    }
  ]
}
```

### Ressources

#### 404 Not Found

```json
{
  "error": "Événement non trouvé"
}
```

```json
{
  "error": "Utilisateur non trouvé"
}
```

### Business Logic

#### 400 Bad Request

```json
{
  "error": "Code invalide ou inexistant. Vérifiez le code fourni par votre ambassadeur."
}
```

```json
{
  "error": "Ce code a atteint son nombre maximum d'utilisations"
}
```

```json
{
  "error": "Vous avez atteint votre limite de codes générés"
}
```

```json
{
  "error": "Événement complet",
  "message": "Le nombre maximum de participants est atteint"
}
```

```json
{
  "error": "Déjà inscrit à cet événement"
}
```

## Gestion des erreurs côté client

### Exemple TypeScript

```typescript
async function handleApiError(response: Response) {
  if (!response.ok) {
    const error = await response.json()
    
    switch (response.status) {
      case 401:
        // Rediriger vers login ou refresh token
        await refreshToken()
        break
      case 403:
        // Afficher message d'accès interdit
        showError('Vous n\'avez pas les permissions nécessaires')
        break
      case 404:
        // Ressource non trouvée
        showError('Ressource introuvable')
        break
      case 500:
        // Erreur serveur
        showError('Erreur serveur. Veuillez réessayer plus tard.')
        break
      default:
        showError(error.message || 'Une erreur est survenue')
    }
  }
}
```

## Validation Zod

Les erreurs de validation Zod retournent un format structuré :

```json
{
  "error": "Validation error",
  "details": [
    {
      "field": "email",
      "message": "Email invalide"
    },
    {
      "field": "password",
      "message": "Le mot de passe doit contenir au moins 8 caractères"
    }
  ]
}
```

## Prochaines étapes

- [Référence API complète](endpoints.md)
- [Pagination & Filtres](pagination.md)
