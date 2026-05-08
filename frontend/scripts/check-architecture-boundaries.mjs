import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const projectRoot = process.cwd();

const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.ts', '.tsx']);

const boundaryRules = [
  {
    name: 'domain/ontology must stay framework independent',
    root: 'domain/ontology',
    forbiddenImports: [
      /^(react|react-dom|reactflow|zustand)($|\/)/,
      /^next($|\/)/,
      /^@\/(app|components|hooks|services|stores)($|\/)/,
      /\.css$/,
    ],
    forbiddenPatterns: [
      {
        name: 'fetch call',
        pattern: /\bfetch\s*\(/,
      },
    ],
  },
  {
    name: 'features/ontology-canvas/model must stay UI and store independent',
    root: 'features/ontology-canvas/model',
    forbiddenImports: [
      /^(react|react-dom|reactflow|zustand)($|\/)/,
      /^next($|\/)/,
      /^@\/(app|components|hooks|services|stores)($|\/)/,
      /^@\/features\/ontology-canvas\/(ui|blocks|adapters)($|\/)/,
      /\.css$/,
    ],
    forbiddenPatterns: [
      {
        name: 'fetch call',
        pattern: /\bfetch\s*\(/,
      },
    ],
  },
  {
    name: 'features/ontology-canvas/adapters must stay UI and store independent',
    root: 'features/ontology-canvas/adapters',
    forbiddenImports: [
      /^zustand($|\/)/,
      /^next($|\/)/,
      /^@\/(app|components|hooks|stores)($|\/)/,
      /\.css$/,
    ],
    forbiddenPatterns: [
      {
        name: 'fetch call',
        pattern: /\bfetch\s*\(/,
      },
    ],
  },
];

const toPosix = (value) => value.split(path.sep).join('/');

const collectSourceFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectSourceFiles(fullPath));
      continue;
    }

    if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
};

const getImportedModules = (source) => {
  const imports = [];
  const patterns = [
    /\bimport\s+(?:type\s+)?(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"]/g,
    /\bexport\s+(?:type\s+)?(?:[^'"]+\s+from\s+)['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      imports.push(match[1]);
    }
  }

  return imports;
};

const checkRule = async (rule) => {
  const absoluteRoot = path.join(projectRoot, rule.root);
  const files = await collectSourceFiles(absoluteRoot);
  const violations = [];

  for (const filePath of files) {
    const source = await readFile(filePath, 'utf8');
    const relativePath = toPosix(path.relative(projectRoot, filePath));
    const importedModules = getImportedModules(source);

    for (const importedModule of importedModules) {
      const matchedRule = rule.forbiddenImports.find(pattern => pattern.test(importedModule));
      if (matchedRule) {
        violations.push({
          file: relativePath,
          detail: `forbidden import "${importedModule}"`,
        });
      }
    }

    for (const forbiddenPattern of rule.forbiddenPatterns ?? []) {
      if (forbiddenPattern.pattern.test(source)) {
        violations.push({
          file: relativePath,
          detail: `forbidden ${forbiddenPattern.name}`,
        });
      }
    }
  }

  return {
    rule: rule.name,
    filesChecked: files.length,
    violations,
  };
};

const results = await Promise.all(boundaryRules.map(checkRule));
const allViolations = results.flatMap(result =>
  result.violations.map(violation => ({
    rule: result.rule,
    ...violation,
  }))
);

for (const result of results) {
  console.log(`✓ ${result.rule}: checked ${result.filesChecked} files`);
}

if (allViolations.length > 0) {
  console.error('\nArchitecture boundary violations found:');
  for (const violation of allViolations) {
    console.error(`- ${violation.rule}: ${violation.file} -> ${violation.detail}`);
  }
  process.exit(1);
}

console.log('Architecture boundary checks passed.');
