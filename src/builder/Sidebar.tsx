import type { MutableRefObject } from 'react';
import type { Material, SceneModule, SceneSettings } from '@/domain/types';
import type { BuilderApi } from './api';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Slider } from '@/components/ui/Slider';
import { CrsBadge } from '@/components/crs/CrsBadge';
import { toPctLabel } from '@/lib/format';
import { toPct } from '@/domain/crs';

export interface Readout {
  moduleCount: number;
  totalArea: number;
  aggregateCrs: number;
  carbonSaving: number;
}

interface SidebarProps {
  settings: SceneSettings;
  setSettings: (patch: Partial<SceneSettings>) => void;
  selected: SceneModule | null;
  selectedMaterial: Material | undefined;
  readout: Readout;
  api: MutableRefObject<BuilderApi>;
  onUpdateSelected: (patch: Partial<SceneModule>) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onToggleLock: () => void;
  onSave: () => void;
  onClear: () => void;
}

const GRID_OPTIONS = [
  { value: '0.25', label: '0.25 m' },
  { value: '0.5', label: '0.5 m' },
  { value: '1', label: '1.0 m' },
];
const LIGHTING_OPTIONS = [
  { value: 'studio', label: 'Studio' },
  { value: 'daylight', label: 'Daylight' },
  { value: 'dusk', label: 'Dusk' },
];

export function Sidebar({
  settings,
  setSettings,
  selected,
  selectedMaterial,
  readout,
  api,
  onUpdateSelected,
  onDuplicate,
  onRemove,
  onToggleLock,
  onSave,
  onClear,
}: SidebarProps) {
  return (
    <aside className="flex w-80 shrink-0 flex-col overflow-y-auto border-l border-hairline bg-surface">
      {/* Live readout */}
      <Section title="Façade readout">
        <div className="flex items-center gap-3 rounded-lg border border-hairline bg-surface-raised p-3">
          <CrsBadge ratio={readout.aggregateCrs} size={56} label="eCRS" />
          <div className="text-body-sm">
            <p className="font-medium text-ink">{toPct(readout.aggregateCrs)}% blended eCRS</p>
            <p className="text-caption text-stone">Area-weighted across the façade</p>
          </div>
        </div>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Metric label="Modules" value={String(readout.moduleCount)} />
          <Metric label="Area" value={`${readout.totalArea.toFixed(1)}m²`} />
          <Metric label="CO₂↓" value={toPctLabel(readout.carbonSaving)} accent />
        </dl>
      </Section>

      {/* Selected module */}
      {selected && (
        <Section title="Selected module">
          <p className="mb-2 text-body-sm font-medium text-ink">
            {selectedMaterial?.name ?? 'Module'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <DimInput
              label="Width (m)"
              value={selected.size.width}
              onChange={(v) => onUpdateSelected({ size: { ...selected.size, width: v } })}
            />
            <DimInput
              label="Height (m)"
              value={selected.size.height}
              onChange={(v) => onUpdateSelected({ size: { ...selected.size, height: v } })}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                onUpdateSelected({ rotationY: (selected.rotationY + Math.PI / 2) % (Math.PI * 2) })
              }
              disabled={!!selected.locked}
            >
              Rotate 90°
            </Button>
            <Button size="sm" variant="secondary" onClick={onDuplicate}>
              Duplicate
            </Button>
            <Button
              size="sm"
              variant={selected.locked ? 'accent' : 'secondary'}
              onClick={onToggleLock}
            >
              {selected.locked ? '🔒 Locked' : '🔓 Lock'}
            </Button>
            <Button size="sm" variant="danger" onClick={onRemove}>
              Delete
            </Button>
          </div>
          <p className="mt-2 text-caption text-stone">
            {selected.locked ? 'Unlock to move or rotate this module.' : 'Drag the handles in the canvas to reposition.'}
          </p>
        </Section>
      )}

      {/* Grid & snapping */}
      <Section title="Grid & snapping">
        <Row label="Grid size">
          <Select
            className="w-28"
            options={GRID_OPTIONS}
            value={String(settings.gridSize)}
            onChange={(e) => setSettings({ gridSize: Number(e.target.value) })}
          />
        </Row>
        <ToggleRow
          label="Snap to grid"
          checked={settings.snap}
          onChange={(v) => setSettings({ snap: v })}
        />
        <ToggleRow
          label="Show grid"
          checked={settings.showGrid}
          onChange={(v) => setSettings({ showGrid: v })}
        />
      </Section>

      {/* Façade dimensions */}
      <Section title="Façade dimensions">
        <LabeledSlider
          label={`Width · ${settings.facade.width} m`}
          value={settings.facade.width}
          min={4}
          max={40}
          step={1}
          onChange={(v) => setSettings({ facade: { ...settings.facade, width: v } })}
        />
        <LabeledSlider
          label={`Height · ${settings.facade.height} m`}
          value={settings.facade.height}
          min={3}
          max={30}
          step={1}
          onChange={(v) => setSettings({ facade: { ...settings.facade, height: v } })}
        />
      </Section>

      {/* Environment & views */}
      <Section title="Environment & views">
        <Row label="Lighting">
          <Select
            className="w-32"
            options={LIGHTING_OPTIONS}
            value={settings.lighting}
            onChange={(e) => setSettings({ lighting: e.target.value as SceneSettings['lighting'] })}
          />
        </Row>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(['front', 'iso', 'top'] as const).map((preset) => (
            <Button
              key={preset}
              size="sm"
              variant="secondary"
              onClick={() => api.current.setView?.(preset)}
              className="capitalize"
            >
              {preset}
            </Button>
          ))}
        </div>
      </Section>

      {/* Scene actions */}
      <div className="mt-auto space-y-2 border-t border-hairline p-4">
        <Button className="w-full" onClick={onSave}>
          Save scene
        </Button>
        <Button variant="ghost" className="w-full" onClick={onClear}>
          Clear all modules
        </Button>
        <p className="text-center text-caption text-stone">
          Scenes persist automatically to this browser.
        </p>
      </div>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-hairline p-4">
      <h3 className="eyebrow mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-body-sm text-graphite">{label}</span>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Row label={label}>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </Row>
  );
}

function LabeledSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="py-1.5">
      <p className="mb-1.5 text-body-sm text-graphite">{label}</p>
      <Slider value={value} min={min} max={max} step={step} onValueChange={onChange} aria-label={label} />
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-md border border-hairline bg-surface-raised py-2">
      <p className={'font-display text-h5 leading-none ' + (accent ? 'text-moss' : 'text-ink')}>
        {value}
      </p>
      <p className="mt-1 text-[0.625rem] uppercase tracking-label text-stone">{label}</p>
    </div>
  );
}

function DimInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-caption text-stone">{label}</span>
      <input
        type="number"
        min={0.25}
        step={0.25}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-10 w-full rounded border border-hairline-strong bg-surface-raised px-2 text-body-sm focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/30"
      />
    </label>
  );
}
