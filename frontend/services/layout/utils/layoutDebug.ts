export const isLayoutDebugEnabled = (): boolean =>
  typeof process !== 'undefined' &&
  process.env?.NEXT_PUBLIC_LAYOUT_DEBUG === 'true';

export const logLayoutDebug = (...args: unknown[]): void => {
  if (isLayoutDebugEnabled()) {
    console.log(...args);
  }
};
