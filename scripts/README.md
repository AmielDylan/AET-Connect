# Scripts - AET Connect Backend

Scripts utilitaires pour setup, migrations et rapports.

## Catégories

### Setup & Données de test

- \`setup-test-users.ts\` - Créer utilisateurs de test (membre, ambassadeur, admin)

- \`get-real-test-data.ts\` - Récupérer données depuis DB

- \`create-admin-universal-code.ts\` - Créer code admin universel

### Migrations DB

- \`add-max-codes-column.ts\` - Ajouter colonne max_codes_allowed

- \`test-connection.ts\` - Tester connexion Supabase

### Rapports

- \`generate-test-report.ts\` - Rapport complet module Registration

- \`generate-auth-report.ts\` - Rapport complet module Auth

## Commandes

\`\`\`bash

# Setup

npm run setup:test-users

npm run admin:create-code

npm run test:get-data

# DB

npm run db:test

npm run db:add-max-codes

# Rapports

npm run report:registration

npm run report:auth

\`\`\`

## Note

Les **tests** ne sont plus dans /scripts.  
Ils sont dans **/tests** (e2e, integration, unit).

Ce répertoire contient uniquement les **utilitaires**.

