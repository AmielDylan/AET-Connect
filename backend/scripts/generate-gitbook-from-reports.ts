import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { logger } from '../src/utils/logger'

// Mapping rapports → pages GitBook
const reportMappings = [
  {
    source: 'RAPPORT_TESTS_REGISTRATION.md',
    target: 'docs/reports/registration.md'
  },
  {
    source: 'RAPPORT_TESTS_AUTH.md',
    target: 'docs/reports/auth.md'
  },
  {
    source: 'RAPPORT_TESTS_EVENTS.md',
    target: 'docs/reports/events.md'
  },
  {
    source: 'RAPPORT_TESTS_ADMIN.md',
    target: 'docs/reports/admin.md'
  },
  {
    source: 'RAPPORT_TESTS_USERS_SCHOOLS.md',
    target: 'docs/reports/users-schools.md'
  }
]

async function convertReportsToGitBook() {
  logger.info('Conversion des rapports en pages GitBook...\n')
  
  // Créer dossier reports/ si n'existe pas
  mkdirSync(join(__dirname, '..', 'docs', 'reports'), { recursive: true })
  
  for (const mapping of reportMappings) {
    const sourcePath = join(__dirname, '..', mapping.source)
    const targetPath = join(__dirname, '..', mapping.target)
    
    try {
      let content = readFileSync(sourcePath, 'utf-8')
      
      // Ajouter navigation GitBook en haut
      const navigation = `---

[← Retour aux rapports](../README.md) | [Documentation complète](../README.md)

---

`
      content = navigation + content
      
      // Ajouter navigation en bas
      const footer = `



---

## 🔗 Liens utiles

- [Accueil documentation](../README.md)
- [Référence API](../api-reference/endpoints.md)
- [GitHub Repository](https://github.com/AmielDylan/AET-Connect)

---

[✏️ Modifier sur GitHub](https://github.com/AmielDylan/AET-Connect/tree/main/backend/${mapping.source})

`
      content += footer
      
      writeFileSync(targetPath, content, 'utf-8')
      logger.info(`✅ Converti: ${mapping.source} → ${mapping.target}`)
    } catch (error: any) {
      logger.error(`❌ Erreur: ${mapping.source} - ${error.message}`)
    }
  }
  
  logger.info('\n✅ Conversion terminée!')
}

convertReportsToGitBook()
