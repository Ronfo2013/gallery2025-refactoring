#!/usr/bin/env node

/**
 * 🔍 Validate Storage Paths
 *
 * Script che verifica che tutti i path usati nel codice
 * corrispondano alle regole di Storage definite.
 *
 * Run: node scripts/validate-storage-paths.js
 */

import { readFileSync } from 'fs';
import { glob } from 'glob';

// Estrai tutti i path dalle Storage Rules
function extractPathsFromRules(rulesContent) {
  const pathRegex = /match\s+\/([^{]+\{[^}]+\}[^{]*)\s*{/g;
  const paths = [];
  let match;

  while ((match = pathRegex.exec(rulesContent)) !== null) {
    paths.push(match[1]);
  }

  return paths;
}

// Trova tutti gli usi di Storage nel codice
async function findStorageUsageInCode() {
  const files = await glob('**/*.{ts,tsx,js,jsx}', {
    ignore: ['node_modules/**', 'dist/**', 'build/**'],
  });

  const usages = [];

  for (const file of files) {
    const content = readFileSync(file, 'utf8');

    // Cerca pattern tipo: ref('brands/uploads/...')
    const refRegex = /ref\(['"`]([^'"`]+)['"`]\)/g;
    let match;

    while ((match = refRegex.exec(content)) !== null) {
      usages.push({
        file,
        path: match[1],
        line: content.substring(0, match.index).split('\n').length,
      });
    }
  }

  return usages;
}

// Valida che i path usati matchino le regole
function validatePaths(rulePaths, codeUsages) {
  const errors = [];

  for (const usage of codeUsages) {
    const matched = rulePaths.some((rulePath) => {
      // Converti rule path in regex
      const pattern = rulePath.replace(/\{[^}]+\}/g, '[^/]+').replace(/\*\*/g, '.+');
      const regex = new RegExp(`^${pattern}$`);

      return regex.test(usage.path);
    });

    if (!matched) {
      errors.push(usage);
    }
  }

  return errors;
}

// Main
async function main() {
  console.log('🔍 Validating Storage paths...\n');

  // Leggi Storage Rules
  const rulesContent = readFileSync('storage.rules', 'utf8');
  const rulePaths = extractPathsFromRules(rulesContent);

  console.log('📋 Storage Rules paths found:');
  rulePaths.forEach((path) => console.log(`  - ${path}`));
  console.log('');

  // Trova usi nel codice
  const codeUsages = await findStorageUsageInCode();
  console.log(`📝 Found ${codeUsages.length} Storage usages in code\n`);

  // Valida
  const errors = validatePaths(rulePaths, codeUsages);

  if (errors.length === 0) {
    console.log('✅ All Storage paths are valid!');
    process.exit(0);
  } else {
    console.log('❌ Found invalid Storage paths:\n');
    errors.forEach((error) => {
      console.log(`  ${error.file}:${error.line}`);
      console.log(`    Path: ${error.path}`);
      console.log('');
    });
    console.log(`Total errors: ${errors.length}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
