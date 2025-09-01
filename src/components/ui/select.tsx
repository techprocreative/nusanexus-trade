import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
}

interface SelectValueProps {
  placeholder?: string;
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}>({ open: false, setOpen: () => {} });

const Select: React.FC<SelectProps> = ({ children, value, onValueChange, defaultValue }) => {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(defaultValue || '');
  
  const currentValue = value !== undefined ? value : internalValue;
  
  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
    setOpen(false);
  };
  
  return (
    <SelectContext.Provider value={{ value: currentValue, onValueChange: handleValueChange, open, setOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = React.useContext(SelectContext);
    
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        onClick={() => setOpen(!open)}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    );
  }
);

const SelectContent: React.FC<SelectContentProps> = ({ children, className }) => {
  const { open } = React.useContext(SelectContext);
  
  if (!open) return null;
  
  return (
    <div className={cn(
      'absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md',
      className
    )}>
      {children}
    </div>
  );
};

const SelectItem = React.forwardRef<HTMLButtonElement, SelectItemProps>(
  ({ className, children, value, ...props }, ref) => {
    const { onValueChange } = React.useContext(SelectContext);
    
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          className
        )}
        onClick={() => onValueChange?.(value)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
  const { value } = React.useContext(SelectContext);
  
  return (
    <span className={cn(!value && 'text-muted-foreground')}>
      {value || placeholder}
    </span>
  );
};

SelectTrigger.displayName = 'SelectTrigger';
SelectContent.displayName = 'SelectContent';
SelectItem.displayName = 'SelectItem';
SelectValue.displayName = 'SelectValue';

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
export type { SelectProps, SelectTriggerProps, SelectContentProps, SelectItemProps, SelectValueProps };