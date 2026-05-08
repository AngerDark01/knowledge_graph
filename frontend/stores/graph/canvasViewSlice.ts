interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

interface CanvasViewSlice {
  viewport: ViewportState;
  setViewport: (viewport: ViewportState) => void;
  updateViewport: (update: Partial<ViewportState>) => void;
  canvasSize: { width: number; height: number };
  setCanvasSize: (size: { width: number; height: number }) => void;
}

type CanvasViewStoreState = CanvasViewSlice;
type CanvasViewStorePatch = Partial<CanvasViewStoreState>;
type CanvasViewStoreSet = (
  patch:
    | CanvasViewStorePatch
    | CanvasViewStoreState
    | ((state: CanvasViewStoreState) => CanvasViewStorePatch | CanvasViewStoreState)
) => void;

export const createCanvasViewSlice = (set: CanvasViewStoreSet): CanvasViewSlice => ({
  viewport: { x: 0, y: 0, zoom: 1 },
  setViewport: (viewport) => set({ viewport }),
  updateViewport: (update) => set((state) => ({
    viewport: { ...state.viewport, ...update }
  })),
  canvasSize: { width: 0, height: 0 },
  setCanvasSize: (size) => set({ canvasSize: size }),
});

export type { CanvasViewSlice };
