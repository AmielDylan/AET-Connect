# 📋 Liste complète des endpoints

Tous les endpoints disponibles dans l'API AET Connect.

## Health Check

### GET /health

Vérifier l'état du serveur.

**Auth** : ❌ Non requis

**Réponse :**
```json
{
  "status": "ok",
  "timestamp": "2025-11-12T...",
  "environment": "development"
}
```

---

## 🔐 Authentification

### POST /api/auth/login

Connexion utilisateur.

**Auth** : ❌ Non requis

**Body :**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Réponse :**
```json
{
  "success": true,
  "user": { ... },
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc..."
}
```

### POST /api/auth/logout

Déconnexion utilisateur.

**Auth** : ✅ Requis

**Réponse :**
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

### POST /api/auth/refresh

Renouveler les tokens.

**Auth** : ❌ Non requis

**Body :**
```json
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

### GET /api/auth/me

Profil utilisateur connecté.

**Auth** : ✅ Requis

**Réponse :**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "Jean",
  "last_name": "Dupont",
  "role": "alumni",
  ...
}
```

---

## 📝 Registration

### POST /api/register/check-school-promo

Vérifier si une école + promo existe.

**Auth** : ❌ Non requis

**Body :**
```json
{
  "school_id": "uuid",
  "entry_year": "2020"
}
```

### POST /api/register/request-initial-access

Demander un accès initial.

**Auth** : ❌ Non requis

**Body :**
```json
{
  "email": "user@example.com",
  "school_id": "uuid",
  "entry_year": "2020",
  "first_name": "Jean",
  "last_name": "Dupont"
}
```

### POST /api/register/verify-invitation-code

Vérifier un code d'invitation.

**Auth** : ❌ Non requis

**Body :**
```json
{
  "code": "ADMIN-ABC123",
  "school_id": "uuid",
  "entry_year": "2020"
}
```

### POST /api/register/complete-registration

Finaliser l'inscription.

**Auth** : ❌ Non requis

**Body :**
```json
{
  "request_id": "uuid",
  "code_id": "uuid",
  "password": "SecurePass123!"
}
```

### POST /api/register/request-code-from-peer

Demander un code à un pair.

**Auth** : ❌ Non requis

**Body :**
```json
{
  "request_id": "uuid",
  "peer_email": "peer@example.com"
}
```

---

## 🎫 Codes d'invitation

### POST /api/codes/generate

Générer un code d'invitation.

**Auth** : ✅ Requis

**Réponse :**
```json
{
  "success": true,
  "code": "USER-ABC123",
  "codes_remaining": 2
}
```

### GET /api/codes/my-codes

Liste mes codes générés.

**Auth** : ✅ Requis

**Réponse :**
```json
{
  "codes": [ ... ],
  "total": 5
}
```

---

## 🎉 Événements

### POST /api/events

Créer un événement.

**Auth** : ✅ Requis

**Body :**
```json
{
  "title": "Soirée networking",
  "description": "Description...",
  "event_date": "2025-12-01T18:00:00Z",
  "event_end_date": "2025-12-01T22:00:00Z",
  "city": "Paris",
  "country": "France",
  "address": "123 Rue Example",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "max_participants": 50,
  "status": "upcoming"
}
```

### GET /api/events

Liste des événements (avec filtres).

**Auth** : ❌ Non requis

**Query params :**
- `country` : Filtrer par pays
- `city` : Filtrer par ville
- `date_from` : Date début
- `date_to` : Date fin
- `status` : upcoming/ongoing/completed/cancelled
- `created_by` : ID créateur
- `limit` : Nombre de résultats (défaut: 20)
- `offset` : Pagination (défaut: 0)

### GET /api/events/:id

Détails d'un événement.

**Auth** : ❌ Non requis (optionnel pour is_registered)

**Réponse :**
```json
{
  "id": "uuid",
  "title": "...",
  "participant_count": 15,
  "is_registered": false,
  "participants": [ ... ]
}
```

### PATCH /api/events/:id

Modifier un événement (créateur ou admin).

**Auth** : ✅ Requis

**Body :** (champs à modifier)

### DELETE /api/events/:id

Supprimer un événement (soft delete).

**Auth** : ✅ Requis (créateur ou admin)

### POST /api/events/:id/register

S'inscrire à un événement.

**Auth** : ✅ Requis

### DELETE /api/events/:id/unregister

Se désinscrire d'un événement.

**Auth** : ✅ Requis

---

## 👑 Admin

### GET /api/admin/stats

Statistiques globales de la plateforme.

**Auth** : ✅ Requis (admin uniquement)

**Réponse :**
```json
{
  "users": {
    "total": 150,
    "by_role": { ... },
    "active": 145
  },
  "events": { ... },
  "codes": { ... },
  "access_requests": { ... }
}
```

### GET /api/admin/access-requests

Liste des demandes d'accès.

**Auth** : ✅ Requis (admin uniquement)

**Query params :**
- `status` : pending/approved/rejected
- `school_id` : Filtrer par école
- `date_from` / `date_to` : Filtrer par date
- `limit` / `offset` : Pagination

### POST /api/admin/access-requests/:id/approve

Approuver une demande d'accès.

**Auth** : ✅ Requis (admin uniquement)

**Réponse :**
```json
{
  "success": true,
  "user": { ... },
  "temp_password": "TempPass123!"
}
```

### POST /api/admin/access-requests/:id/reject

Rejeter une demande d'accès.

**Auth** : ✅ Requis (admin uniquement)

### GET /api/admin/users

Liste tous les utilisateurs.

**Auth** : ✅ Requis (admin uniquement)

**Query params :**
- `role` : alumni/moderator/admin
- `school_id` : Filtrer par école
- `is_active` : true/false
- `is_ambassador` : true/false
- `search` : Recherche par nom
- `limit` / `offset` : Pagination

### PATCH /api/admin/users/:id

Modifier un utilisateur.

**Auth** : ✅ Requis (admin uniquement)

### POST /api/admin/users/:id/set-ambassador

Désigner/retirer ambassadeur.

**Auth** : ✅ Requis (admin uniquement)

**Body :**
```json
{
  "is_ambassador": true
}
```

### PATCH /api/admin/users/:id/increase-code-limit

Augmenter limite de codes.

**Auth** : ✅ Requis (admin uniquement)

**Body :**
```json
{
  "new_limit": 50
}
```

### GET /api/admin/events

Liste TOUS les événements (actifs + inactifs).

**Auth** : ✅ Requis (admin uniquement)

### PATCH /api/admin/events/:id

Modifier n'importe quel événement.

**Auth** : ✅ Requis (admin uniquement)

### DELETE /api/admin/events/:id

Supprimer n'importe quel événement.

**Auth** : ✅ Requis (admin uniquement)

### GET /api/admin/events/:id/participants

Liste participants avec détails complets.

**Auth** : ✅ Requis (admin uniquement)

---

## 🏫 Schools (Public)

### GET /api/schools

Liste des écoles avec stats agrégées.

**Auth** : ❌ Non requis

**Query params :**
- `country` : Filtrer par pays
- `is_active` : true/false

**Réponse :**
```json
{
  "schools": [
    {
      "id": "uuid",
      "name_fr": "PML",
      "country": "Gabon",
      "total_members": 150,
      "total_ambassadors": 5,
      "total_events": 12
    }
  ],
  "total": 9
}
```

### GET /api/schools/:id

Détails d'une école avec stats.

**Auth** : ❌ Non requis

### GET /api/schools/:id/stats

Statistiques détaillées d'une école.

**Auth** : ❌ Non requis

**Réponse :**
```json
{
  "school_id": "uuid",
  "school_name": "PML",
  "statistics": {
    "total_members": 150,
    "total_ambassadors": 5,
    "total_events_organized": 12,
    "total_codes_generated": 450,
    "by_entry_year": [
      { "year": "2020", "count": 25 }
    ],
    "by_current_country": [
      { "country": "France", "count": 50 }
    ],
    "growth_trend": [ ... ]
  }
}
```

---

## 👥 Users

### GET /api/users

Annuaire des utilisateurs (filtré par privacy).

**Auth** : ✅ Requis

**Query params :**
- `school_id` : Filtrer par école
- `entry_year` : Filtrer par année
- `country` : Filtrer par pays actuel
- `city` : Filtrer par ville
- `is_ambassador` : true/false
- `search` : Recherche par nom
- `limit` / `offset` : Pagination

### GET /api/users/me

Mon profil complet (toutes les infos).

**Auth** : ✅ Requis

### PATCH /api/users/me

Modifier mon profil.

**Auth** : ✅ Requis

**Body :**
```json
{
  "bio": "Ma bio",
  "current_city": "Paris",
  "current_country": "France",
  "linkedin_url": "https://linkedin.com/..."
}
```

### GET /api/users/me/privacy

Mes paramètres de confidentialité.

**Auth** : ✅ Requis

### PATCH /api/users/me/privacy

Modifier mes paramètres de confidentialité.

**Auth** : ✅ Requis

**Body :**
```json
{
  "show_email": true,
  "show_in_directory": true,
  "show_current_location": false
}
```

### GET /api/users/:id

Profil public d'un utilisateur (selon privacy).

**Auth** : ✅ Requis

---

## 📊 Résumé

| Module | Endpoints | Auth |
|--------|-----------|------|
| Health | 1 | ❌ |
| Auth | 4 | Mixte |
| Registration | 5 | ❌ |
| Codes | 2 | ✅ |
| Events | 8 | Mixte |
| Admin | 12 | ✅ Admin |
| Schools | 3 | ❌ |
| Users | 6 | ✅ |
| **TOTAL** | **41** | |

---

## Prochaines étapes

- [Codes d'erreur](errors.md)
- [Pagination & Filtres](pagination.md)
- [Rate Limiting](rate-limiting.md)
