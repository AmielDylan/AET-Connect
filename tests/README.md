# Tests - AET Connect Backend

Organisation des tests par type.

## Structure

\`\`\`

tests/

├── e2e/              # Tests End-to-End (API complètes)

│   ├── registration/ # Tests module Registration

│   ├── auth/         # Tests module Auth

│   └── codes/        # Tests génération codes

├── integration/      # Tests d'intégration (avec DB)

│   └── services/     # Tests des services

└── unit/             # Tests unitaires (logique pure)

    ├── utils/        # Tests des utilitaires

    └── validators/   # Tests des validateurs

\`\`\`

## Types de tests

### E2E (End-to-End)

Tests des endpoints API complets, avec serveur qui tourne.

- Testent le comportement réel de l'API

- Utilisent la vraie base de données

- Simulent les requêtes d'un vrai client

**Quand exécuter** : Avant chaque déploiement

### Integration

Tests des services avec vraie base de données.

- Testent la logique métier avec DB

- Vérifient les interactions entre modules

- Ne testent pas les routes HTTP

**Quand exécuter** : Après modifications de services

### Unit

Tests de fonctions pures sans dépendances.

- Tests rapides et isolés

- Pas d'accès DB

- Pas d'accès réseau

**Quand exécuter** : En continu pendant le développement

## Commandes

\`\`\`bash

# Tests E2E

npm run test:e2e                    # Tous les tests E2E

npm run test:e2e:registration       # Tests Registration

npm run test:e2e:auth               # Tests Auth

# Tests d'intégration

npm run test:integration            # Tous les tests integration

# Tests unitaires

npm run test:unit                   # Tous les tests unit

# Tous les tests

npm test                            # Lance tous les types de tests

\`\`\`

## Tests actuels

### Module Registration (31 tests)

- ✅ \`invitation-logic.test.ts\` - 7 tests logique invitation

- ✅ \`edge-cases.test.ts\` - 8 tests cas limites

- ✅ \`roles.test.ts\` - 9 tests par rôle

- ✅ \`invitation-validation.test.ts\` - 7 tests validation

**Total : 31 tests ✅**

### Module Auth (9 tests)

- ✅ \`authentication.test.ts\` - 9 tests auth complète

**Total : 9 tests ✅**

### TOTAL GÉNÉRAL : 40 tests ✅

