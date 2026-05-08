import { StateCreator, StoreMutatorIdentifier } from 'zustand';
import { debounce } from '@/lib/utils';

type PersistenceMiddleware = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs>,
  options?: { debounceMs?: number }
) => StateCreator<T, Mps, Mcs>;

type PersistenceMiddlewareImpl = <T>(
  f: StateCreator<T, [], []>,
  options?: { debounceMs?: number }
) => StateCreator<T, [], []>;

/**
 * Zustand 中间件：自动持久化 graphStore 数据到 workspaceStore
 */
const persistenceMiddlewareImpl: PersistenceMiddlewareImpl = (f, options) => (set, get, store) => {
  const { debounceMs = 500 } = options || {};

  // 保存函数
  const saveToWorkspace = async () => {
    try {
      // 动态导入避免循环依赖
      const { saveCurrentCanvasData } = await import('@/utils/workspace/canvasSync');
      saveCurrentCanvasData();

      const { persistWorkspace } = await import('@/utils/workspace/persistence');
      const persisted = await persistWorkspace();

      if (!persisted) {
        console.error('❌ 保存工作空间失败');
      } else {
        console.log('💾 工作空间已自动保存');
      }
    } catch (error) {
      console.error('❌ 自动保存失败:', error);
    }
  };

  // 防抖保存
  const debouncedSave = debounce(saveToWorkspace, debounceMs);

  // 订阅 store 变化
  store.subscribe(() => {
    debouncedSave();
  });

  // 直接返回原始 store
  return f(set, get, store);
};

export const persistenceMiddleware = persistenceMiddlewareImpl as PersistenceMiddleware;
