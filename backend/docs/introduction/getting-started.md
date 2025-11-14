# 🚀 Démarrage rapide

Guide complet pour démarrer avec l'API AET Connect.

## Prérequis

- **Node.js** 18+ ([télécharger](https://nodejs.org/))
- **npm** ou **yarn**
- **Compte Supabase** ([créer](https://supabase.com))
- **Git** ([télécharger](https://git-scm.com/))

## Installation

### 1. Cloner le repository

```bash
git clone https://github.com/AmielDylan/AET-Connect.git
cd AET-Connect/backend
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration Supabase

#### Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter l'URL et les clés API

#### Exécuter les migrations SQL

Les scripts SQL sont disponibles dans `scripts/` :

```bash
# Créer les tables de base
npm run db:setup

# Ajouter colonne max_codes_allowed
npm run db:add-max-codes

# Créer tables events
npm run db:create-events

# Ajouter colonnes events (status, event_end_date)
npm run db:add-events-fields

# Créer table user_privacy_settings
npm run db:add-user-privacy

# Ajouter colonnes profil utilisateur
npm run db:add-user-profile-columns
```

### 4. Variables d'environnement

Créer `.env.local` à partir de `.env.example` :

```bash
cp .env.example .env.local
```

Éditer `.env.local` :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
```

⚠️ **Important** : Utilisez un secret JWT fort (minimum 32 caractères aléatoires).

### 5. Tester la connexion

```bash
npm run db:test
```

Vous devriez voir : `✅ Connexion à Supabase réussie!`

### 6. Créer les utilisateurs de test

```bash
npm run setup:test-users
```

Cela crée 3 utilisateurs de test :
- `test.membre@aetconnect.com` (alumni, 3 codes max)
- `test.ambassadeur@aetconnect.com` (ambassador, 20 codes max)
- `test.admin@aetconnect.com` (admin, codes illimités)

Mot de passe pour tous : `TestPass123!`

### 7. Lancer le serveur

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3001`

Vous devriez voir dans les logs :
```
✅ Server running on http://localhost:3001
📚 Available endpoints: ...
```

## Vérification

### Health check

```bash
curl http://localhost:3001/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "timestamp": "2025-11-12T...",
  "environment": "development"
}
```

### Test de connexion

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.admin@aetconnect.com",
    "password": "TestPass123!"
  }'
```

Réponse attendue :
```json
{
  "success": true,
  "user": { ... },
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc..."
}
```

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lancer le serveur en développement |
| `npm run build` | Compiler TypeScript |
| `npm run test:e2e:*` | Lancer les tests E2E |
| `npm run db:test` | Tester la connexion DB |
| `npm run setup:test-users` | Créer utilisateurs de test |

## Prochaines étapes

- [Architecture technique](architecture.md)
- [Authentification JWT](../authentication/jwt-tokens.md)
- [Référence API](../api-reference/endpoints.md)

## Dépannage

### Erreur de connexion Supabase

- Vérifier que les variables d'environnement sont correctes
- Vérifier que le projet Supabase est actif
- Vérifier les permissions des clés API

### Port déjà utilisé

Changer le port dans `.env.local` :
```env
PORT=3002
```

### Erreur TypeScript

```bash
npm run build
```

Vérifier les erreurs de compilation.

## Support

- [GitHub Issues](https://github.com/AmielDylan/AET-Connect/issues)
- [Documentation complète](../README.md)
