import * as RSlider from '@radix-ui/react-slider';
import { cn } from '@/lib/cn';

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  'aria-label'?: string;
}

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className,
  ...rest
}: SliderProps) {
  return (
    <RSlider.Root
      className={cn('relative flex h-5 w-full touch-none select-none items-center', className)}
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={(v) => onValueChange(v[0])}
      {...rest}
    >
      <RSlider.Track className="relative h-1 w-full grow rounded-full bg-hairline-strong">
        <RSlider.Range className="absolute h-full rounded-full bg-clay" />
      </RSlider.Track>
      <RSlider.Thumb
        className="block h-4 w-4 rounded-full border border-clay bg-white shadow focus:outline-none focus:ring-2 focus:ring-clay/40"
        aria-label={rest['aria-label']}
      />
    </RSlider.Root>
  );
}
