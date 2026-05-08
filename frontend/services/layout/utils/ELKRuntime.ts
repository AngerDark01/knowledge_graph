import type { ElkNode } from './ELKGraphConverter';

export interface ELKEngine {
  layout(graph: ElkNode): Promise<ElkNode>;
  terminateWorker?: () => void;
}

type ELKConstructor = new () => ELKEngine;

type ModuleWithDefault = {
  default?: unknown;
};

const hasDefaultExport = (value: unknown): value is ModuleWithDefault =>
  (typeof value === 'object' || typeof value === 'function') &&
  value !== null &&
  'default' in value;

const resolveELKConstructor = (elkModule: unknown): ELKConstructor => {
  const firstDefault = hasDefaultExport(elkModule) ? elkModule.default : undefined;
  const nestedDefault = hasDefaultExport(firstDefault) ? firstDefault.default : undefined;
  const candidate = nestedDefault ?? firstDefault ?? elkModule;

  if (typeof candidate !== 'function') {
    throw new Error('Invalid ELK module shape');
  }

  return candidate as ELKConstructor;
};

export const createELKEngine = async (): Promise<ELKEngine> => {
  const elkModule: unknown = await import('elkjs/lib/elk.bundled.js');
  const ELK = resolveELKConstructor(elkModule);
  return new ELK();
};
