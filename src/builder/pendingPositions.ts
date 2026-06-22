// Positions tracked imperatively during drag — no React state, no re-renders.
// The builder store's select() reads and clears this map so position is
// committed in the same Zustand set() call that changes selectedId.
export const pendingPositions = new Map<string, [number, number, number]>();
