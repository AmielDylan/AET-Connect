# 📚 Introduction

Bienvenue dans la documentation de l'API AET Connect.

## 🎯 Qu'est-ce que AET Connect ?

AET Connect est une plateforme digitale qui connecte les anciens élèves de **9 écoles militaires africaines** à travers le continent. Elle permet de :

- 🔗 **Se connecter** avec d'anciens camarades
- 📅 **Organiser des événements** de networking
- 👥 **Consulter l'annuaire** des membres
- 🎓 **Découvrir les statistiques** de chaque école
- 🔐 **Contrôler sa confidentialité** (privacy by design)

## 🏗️ Architecture

AET Connect est une **API REST** construite avec :

- **Node.js** + **Express.js** + **TypeScript**
- **PostgreSQL** (via Supabase)
- **JWT** pour l'authentification
- **Zod** pour la validation

## 📊 Vue d'ensemble des modules

| Module | Endpoints | Description |
|--------|-----------|-------------|
| **Registration** | 5 | Inscription et codes d'invitation |
| **Auth** | 4 | Authentification JWT |
| **Events** | 8 | Gestion des événements |
| **Codes** | 2 | Génération de codes |
| **Admin** | 12 | Dashboard administrateur |
| **Schools** | 3 | Informations publiques écoles |
| **Users** | 6 | Annuaire et profils |

**Total : 40 endpoints**

## 🚀 Démarrage rapide

1. **Cloner le projet**
   ```bash
   git clone https://github.com/AmielDylan/AET-Connect.git
   cd AET-Connect/backend
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer l'environnement**
   ```bash
   cp .env.example .env.local
   # Éditer .env.local avec vos credentials Supabase
   ```

4. **Lancer le serveur**
   ```bash
   npm run dev
   ```

L'API sera disponible sur `http://localhost:3001`

## 📖 Navigation

- [Démarrage rapide](getting-started.md) - Guide d'installation détaillé
- [Architecture technique](architecture.md) - Structure du code et patterns
- [Authentification](authentication/README.md) - Système JWT
- [Référence API](api-reference/endpoints.md) - Liste complète des endpoints

## 🔗 Liens utiles

- [GitHub Repository](https://github.com/AmielDylan/AET-Connect)
- [Rapports de tests](reports/README.md)
- [Guide de contribution](contributing/README.md)
