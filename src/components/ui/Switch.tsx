import * as RSwitch from '@radix-ui/react-switch';
import { cn } from '@/lib/cn';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  className?: string;
  'aria-label'?: string;
}

export function Switch({ checked, onCheckedChange, id, className, ...rest }: SwitchProps) {
  return (
    <RSwitch.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        'relative h-5 w-9 shrink-0 rounded-full border border-hairline-strong bg-sand transition-colors data-[state=checked]:border-clay data-[state=checked]:bg-clay',
        className,
      )}
      {...rest}
    >
      <RSwitch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[18px]" />
    </RSwitch.Root>
  );
}
