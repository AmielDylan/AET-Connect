# 🏗️ Architecture technique

Vue d'ensemble de l'architecture du backend AET Connect.

## Stack technique

### Core

- **Runtime** : Node.js 18+
- **Framework** : Express.js 4.x
- **Langage** : TypeScript 5.x (strict mode)
- **Base de données** : PostgreSQL (via Supabase)

### Authentification & Sécurité

- **Auth** : JWT (JSON Web Tokens)
- **Tokens** : Access (15min) + Refresh (7 jours)
- **Hashing** : bcrypt (10 rounds)
- **Validation** : Zod

### Outils & Libraries

- **Logging** : Winston
- **HTTP Client** : Supabase JS
- **Date** : date-fns
- **Tests** : Tests E2E personnalisés (tsx)

## Structure du projet

```
backend/
├── src/
│   ├── app.ts                 # Application Express
│   ├── config/
│   │   ├── database.ts        # Supabase client
│   │   ├── environment.ts    # Variables d'env
│   │   └── logger.ts          # Winston config
│   ├── middleware/
│   │   ├── auth.middleware.ts       # JWT verification
│   │   ├── admin.middleware.ts      # Admin check
│   │   ├── validation.middleware.ts # Zod validation
│   │   ├── error.middleware.ts      # Error handling
│   │   └── logger.middleware.ts     # Request logging
│   ├── routes/
│   │   ├── registration.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── events.routes.ts
│   │   ├── admin.routes.ts
│   │   ├── users.routes.ts
│   │   └── schools.routes.ts
│   ├── controllers/
│   │   └── [module].controller.ts
│   ├── services/
│   │   └── [module].service.ts
│   ├── models/
│   │   └── [module].model.ts
│   └── utils/
│       ├── jwt.ts
│       └── validations.ts
├── tests/
│   └── e2e/
│       ├── registration/
│       ├── auth/
│       ├── events/
│       ├── admin/
│       ├── schools/
│       └── users/
├── scripts/
│   └── [utility-scripts].ts
└── package.json
```

## Pattern MVC

### Routes

Définissent les endpoints HTTP et appliquent les middlewares :

```typescript
router.post('/events',
  authMiddleware,
  validateRequest(CreateEventSchema),
  eventsController.createEvent
)
```

### Controllers

Gèrent les requêtes/réponses HTTP :

```typescript
async createEvent(req: Request, res: Response) {
  const event = await eventsService.create(req.body, req.user.id)
  res.status(201).json(event)
}
```

### Services

Contiennent la logique métier :

```typescript
async create(data, userId) {
  // Validation business rules
  // Database operations
  // Return result
}
```

### Models

Définissent les types TypeScript :

```typescript
export interface Event {
  id: string
  title: string
  date: string
  // ...
}
```

## Flow d'authentification

```
1. Client → POST /api/auth/login
   Body: { email, password }
   ↓
2. API → Vérifier credentials (Supabase)
   ↓
3. API → Générer access_token (15min) + refresh_token (7j)
   ↓
4. API → Retourner { access_token, refresh_token, user }
   ↓
5. Client → Stocker tokens
   ↓
6. Client → Requêtes protégées avec Header: Authorization: Bearer <access_token>
   ↓
7. API → authMiddleware vérifie token
   ↓
8. API → Injecte req.user avec { id, email, role }
   ↓
9. API → Traite la requête
```

### Refresh Token Flow

```
1. Access token expiré (15min)
   ↓
2. Client → POST /api/auth/refresh
   Body: { refresh_token }
   ↓
3. API → Vérifier refresh_token
   ↓
4. API → Générer nouveau access_token + refresh_token
   ↓
5. Client → Mettre à jour tokens
```

## Base de données (Supabase)

### Tables principales

- **users** - Utilisateurs (alumni, moderator, admin)
- **schools** - 9 écoles militaires
- **access_requests** - Demandes d'accès (pending/approved/rejected)
- **invitation_codes** - Codes d'invitation
- **events** - Événements
- **event_participants** - Inscriptions événements
- **user_privacy_settings** - Paramètres confidentialité

### Relations

- User `belongs_to` School
- Event `belongs_to` User (creator)
- Event `has_many` Participants
- User `has_many` InvitationCodes
- User `has_one` PrivacySettings

## Sécurité

### JWT Tokens

- **Access token** : Court durée (15min), stocké en mémoire côté client
- **Refresh token** : Long durée (7j), stocké en httpOnly cookie (recommandé)

### Middlewares

- `authMiddleware` : Vérifie JWT, injecte `req.user`
- `adminMiddleware` : Vérifie `role === 'admin'`
- `moderatorMiddleware` : Vérifie `role === 'moderator' || 'admin'`
- `validateRequest` : Valide body/params avec Zod

### Soft Delete

- Colonnes `is_active` au lieu de DELETE
- Permet audit trail
- Données préservées

## Performance

### Optimisations

- Indexes sur colonnes recherchées (email, school_id, etc.)
- Pagination sur toutes les listes
- Lazy loading des relations
- Cache (à venir)

### Monitoring

- Winston logging (fichiers + console)
- Error handling centralisé
- Status checks (`/health`)

## Prochaines étapes

- [Authentification JWT](../authentication/jwt-tokens.md)
- [Référence API](../api-reference/endpoints.md)
- [Guide déploiement](../guides/deployment.md)
