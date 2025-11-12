# AET Connect - Backend API

Backend REST API pour AET Connect - Annuaire panafricain des Anciens Enfants de Troupe.

## 🚀 Quick Start

### 1. Installation

```bash
npm install
```

### 2. Configuration

Créer `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key
```

### 3. Test connexion base de données

```bash
npm run db:test
```

### 4. Démarrer le serveur

```bash
npm run dev
```

Le serveur démarre sur http://localhost:3001

## 📁 Structure

```
src/
├── routes/         # Routes API Express
├── controllers/    # Logique métier
├── services/       # Services (DB, emails, etc.)
├── middleware/     # Middlewares Express
├── models/         # Types TypeScript
├── utils/          # Utilitaires
├── config/         # Configuration
└── app.ts          # Application principale
```

## 🗄️ Base de données

6 tables Supabase :

- `schools` - Écoles militaires (9 écoles)
- `users` - Utilisateurs inscrits
- `invitation_codes` - Codes d'invitation
- `access_requests` - Demandes d'accès initiales
- `events` - Événements de networking
- `event_participants` - Inscriptions aux événements

## 📚 API Endpoints (à développer)

### Registration

- `POST /api/register/check-school-promo`
- `POST /api/register/request-initial-access`
- `POST /api/register/verify-invitation-code`
- `POST /api/register/complete-registration`
- `POST /api/register/request-code-from-peer`

### Events

- `GET /api/events`
- `POST /api/events`
- `GET /api/events/:id`
- `POST /api/events/:id/register`

### Admin

- `GET /api/admin/access-requests`
- `POST /api/admin/access-requests/:id/approve`
- `POST /api/admin/access-requests/:id/reject`

### Users

- `GET /api/users/me`
- `PATCH /api/users/me`
- `GET /api/users` (annuaire)

### Schools

- `GET /api/schools`
- `GET /api/schools/:id`

## 🛠️ Scripts

```bash
npm run dev          # Développement avec hot-reload
npm run build        # Build production
npm start            # Démarrer en production
npm run db:test      # Tester connexion DB
npm test             # Tests
```

## 📝 Développement progressif

1. ✅ Structure de base
2. ⏳ Module Registration
3. ⏳ Module Events
4. ⏳ Module Admin
5. ⏳ Module Users
6. ⏳ Module Auth

## 📄 License

MIT

