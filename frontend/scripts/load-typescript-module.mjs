import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

export const createTypeScriptModuleLoader = (importMetaUrl) => {
  const nodeRequire = createRequire(importMetaUrl);
  const projectRoot = process.cwd();
  const moduleCache = new Map();

  const resolveLocalModule = (specifier, parentDirectory) => {
    const basePath = path.resolve(parentDirectory, specifier);
    const candidates = [
      basePath,
      `${basePath}.ts`,
      `${basePath}.tsx`,
      `${basePath}.js`,
      `${basePath}.mjs`,
      path.join(basePath, 'index.ts'),
    ];

    for (const candidate of candidates) {
      try {
        readFileSync(candidate, 'utf8');
        return candidate;
      } catch {
        // Try the next candidate.
      }
    }

    throw new Error(`Cannot resolve module "${specifier}" from ${parentDirectory}`);
  };

  const loadTypeScriptModule = (filePath) => {
    const absolutePath = path.resolve(filePath);

    if (moduleCache.has(absolutePath)) {
      return moduleCache.get(absolutePath).exports;
    }

    const source = readFileSync(absolutePath, 'utf8');
    const compiled = ts.transpileModule(source, {
      compilerOptions: {
        esModuleInterop: true,
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
      fileName: absolutePath,
    });

    const cjsModule = { exports: {} };
    moduleCache.set(absolutePath, cjsModule);

    const localRequire = (specifier) => {
      if (specifier.startsWith('@/')) {
        return loadTypeScriptModule(
          resolveLocalModule(`./${specifier.slice(2)}`, projectRoot)
        );
      }

      if (specifier.startsWith('.')) {
        return loadTypeScriptModule(resolveLocalModule(specifier, path.dirname(absolutePath)));
      }

      return nodeRequire(specifier);
    };

    vm.runInNewContext(
      compiled.outputText,
      {
        exports: cjsModule.exports,
        module: cjsModule,
        require: localRequire,
        console,
        fetch: (...args) => globalThis.fetch(...args),
      },
      {
        filename: absolutePath,
      }
    );

    return cjsModule.exports;
  };

  return {
    loadTypeScriptModule,
    resolveLocalModule,
  };
};
