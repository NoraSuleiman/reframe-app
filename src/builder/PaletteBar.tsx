import { Link } from 'react-router-dom';
import { usePaletteStore } from '@/store/palette';
import { useEntries } from '@/hooks/useEntries';
import { Swatch } from '@/components/Swatch';
import { scoreMaterial, toPct } from '@/domain/crs';

interface PaletteBarProps {
  onPlaceAtCenter: (materialId: string) => void;
}

/** Horizontal strip of palette materials above the canvas. Drag a chip onto the
 *  canvas to place a module, or click it to drop one at the façade centre. */
export function PaletteBar({ onPlaceAtCenter }: PaletteBarProps) {
  const items = usePaletteStore((s) => s.items);
  const { entries } = useEntries(items);

  return (
    <div className="flex h-20 shrink-0 items-center gap-2 border-b border-hairline bg-surface px-4">
      <span className="mr-1 hidden shrink-0 font-mono text-micro uppercase tracking-label text-stone sm:block">
        Palette
      </span>
      {entries.length === 0 ? (
        <p className="text-body-sm text-stone">
          Your palette is empty.{' '}
          <Link to="/marketplace" className="text-clay underline">
            Add materials
          </Link>{' '}
          to drag them onto the canvas.
        </p>
      ) : (
        <div className="flex flex-1 gap-2 overflow-x-auto">
          {entries.map((e) => (
            <button
              key={e.material.id}
              draggable
              onDragStart={(ev) => ev.dataTransfer.setData('text/material-id', e.material.id)}
              onClick={() => onPlaceAtCenter(e.material.id)}
              title={`Drag onto the canvas or click to place · ${e.material.name}`}
              className="group flex h-14 shrink-0 cursor-grab items-center gap-2 rounded-lg border border-hairline bg-surface-raised p-1.5 pr-3 active:cursor-grabbing hover:border-clay"
            >
              <span className="h-10 w-10 overflow-hidden rounded">
                <Swatch family={e.material.family} seed={e.material.slug} />
              </span>
              <span className="text-left">
                <span className="block max-w-[120px] truncate text-body-sm font-medium text-ink">
                  {e.material.name}
                </span>
                <span className="block font-mono text-micro text-stone">
                  {toPct(scoreMaterial(e.material).ecrsRatio)}% eCRS · ×{e.quantity}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
