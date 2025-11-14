# 📄 Pagination & Filtres

Guide complet sur la pagination et les filtres disponibles dans l'API.

## Pagination

Toutes les listes (events, users, etc.) supportent la pagination.

### Paramètres

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `limit` | number | 20 | Nombre de résultats par page |
| `offset` | number | 0 | Nombre de résultats à sauter |

### Exemple

```bash
GET /api/events?limit=10&offset=20
```

**Réponse :**
```json
{
  "events": [ ... ],
  "total": 150,
  "limit": 10,
  "offset": 20,
  "has_more": true
}
```

## Filtres

### Events

| Paramètre | Type | Description |
|-----------|------|-------------|
| `country` | string | Filtrer par pays |
| `city` | string | Filtrer par ville |
| `date_from` | ISO date | Date début |
| `date_to` | ISO date | Date fin |
| `status` | string | upcoming/ongoing/completed/cancelled |
| `created_by` | UUID | ID du créateur |

**Exemple :**
```bash
GET /api/events?country=France&status=upcoming&limit=10
```

### Users

| Paramètre | Type | Description |
|-----------|------|-------------|
| `school_id` | UUID | Filtrer par école |
| `entry_year` | string | Filtrer par année d'entrée |
| `country` | string | Pays actuel |
| `city` | string | Ville actuelle |
| `is_ambassador` | boolean | true/false |
| `search` | string | Recherche par nom |

**Exemple :**
```bash
GET /api/users?school_id=xxx&entry_year=2020&country=France
```

### Schools

| Paramètre | Type | Description |
|-----------|------|-------------|
| `country` | string | Filtrer par pays |
| `is_active` | boolean | true/false |

**Exemple :**
```bash
GET /api/schools?country=Gabon
```

### Admin - Access Requests

| Paramètre | Type | Description |
|-----------|------|-------------|
| `status` | string | pending/approved/rejected |
| `school_id` | UUID | Filtrer par école |
| `date_from` | ISO date | Date début |
| `date_to` | ISO date | Date fin |

**Exemple :**
```bash
GET /api/admin/access-requests?status=pending&school_id=xxx
```

## Combinaison

Vous pouvez combiner pagination et filtres :

```bash
GET /api/events?country=France&status=upcoming&limit=20&offset=40
```

## Tri

Actuellement, les résultats sont triés par défaut :
- **Events** : Par date (plus récent en premier)
- **Users** : Par nom (alphabétique)
- **Schools** : Par nom français (alphabétique)

## Limites

- **Maximum `limit`** : 100 résultats par page
- **Minimum `limit`** : 1 résultat par page

## Prochaines étapes

- [Référence API complète](endpoints.md)
- [Codes d'erreur](errors.md)
