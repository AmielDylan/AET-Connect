# 📚 Guide GitBook

Guide pour utiliser et déployer la documentation GitBook.

## Installation

### 1. Installer GitBook CLI

```bash
npm install -g gitbook-cli
```

### 2. Installer les plugins

```bash
cd backend/docs
gitbook install
```

## Commandes disponibles

### Via npm (recommandé)

```bash
# Convertir les rapports en pages GitBook
npm run docs:convert

# Installer les plugins GitBook
npm run docs:install

# Builder la documentation
npm run docs:build

# Servir localement (http://localhost:4000)
npm run docs:serve

# Tout faire en une fois
npm run docs:all
```

### Via GitBook CLI

```bash
cd backend/docs

# Installer plugins
gitbook install

# Builder
gitbook build

# Servir localement
gitbook serve
```

## Structure

```
docs/
├── README.md          # Page d'accueil
├── SUMMARY.md         # Table des matières
├── book.json          # Configuration GitBook
├── styles/
│   └── website.css    # Styles personnalisés
├── introduction/      # Pages d'introduction
├── authentication/    # Pages authentification
├── modules/           # Documentation des modules
├── api-reference/     # Référence API
├── guides/            # Guides pratiques
├── advanced/          # Concepts avancés
├── reports/           # Rapports de tests
└── changelog/         # Historique des versions
```

## Déploiement

### GitHub Pages

1. **Builder la documentation**
   ```bash
   npm run docs:build
   ```

2. **Créer un dossier `gh-pages`**
   ```bash
   git checkout --orphan gh-pages
   git rm -rf .
   cp -r docs/_book/* .
   git add .
   git commit -m "Deploy GitBook documentation"
   git push origin gh-pages
   ```

3. **Activer GitHub Pages**
   - Aller dans Settings > Pages
   - Sélectionner la branche `gh-pages`
   - La documentation sera disponible sur `https://amieldylan.github.io/AET-Connect/`

### GitBook.com (recommandé)

1. Créer un compte sur [GitBook.com](https://www.gitbook.com)
2. Créer un nouvel espace
3. Connecter le repository GitHub
4. Sélectionner le dossier `backend/docs`
5. GitBook synchronisera automatiquement

## Mise à jour

### Après modification des rapports

```bash
# Convertir les rapports mis à jour
npm run docs:convert

# Rebuilder
npm run docs:build
```

### Ajouter une nouvelle page

1. Créer le fichier `.md` dans le bon dossier
2. Ajouter l'entrée dans `SUMMARY.md`
3. Rebuilder : `npm run docs:build`

## Personnalisation

### Styles

Modifier `styles/website.css` pour personnaliser l'apparence.

### Configuration

Modifier `book.json` pour :
- Changer les plugins
- Modifier les variables
- Ajuster les paramètres

## Troubleshooting

### Erreur "gitbook not found"

```bash
npm install -g gitbook-cli
```

### Erreur de plugins

```bash
cd docs
rm -rf node_modules
gitbook install
```

### Build échoue

Vérifier la syntaxe Markdown et les liens dans `SUMMARY.md`.

## Liens utiles

- [Documentation GitBook](https://docs.gitbook.com)
- [GitHub Repository](https://github.com/AmielDylan/AET-Connect)
- [Documentation API](../README.md)

