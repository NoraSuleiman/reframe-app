// Imperative bridges between the DOM (drop handler, sidebar buttons) and the R3F
// scene. Assigned by components mounted inside <Canvas>, consumed outside it.

export type PlaceFn = (clientX: number, clientY: number) => [number, number, number] | null;
export type ViewPreset = 'front' | 'iso' | 'top';
export type SetViewFn = (preset: ViewPreset) => void;

export interface BuilderApi {
  place: PlaceFn | null;
  setView: SetViewFn | null;
}
