import React from 'react';
import { cn } from '@/lib/utils';

interface TabsProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  className?: string;
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

const TabsContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
}>({});

const Tabs: React.FC<TabsProps> = ({ children, value, onValueChange, defaultValue, className }) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '');
  
  const currentValue = value !== undefined ? value : internalValue;
  
  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };
  
  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex h-auto min-h-[2.5rem] items-center justify-start rounded-md bg-muted p-1 text-muted-foreground',
        'overflow-x-auto scrollbar-hide',
        'sm:justify-center sm:inline-flex sm:h-10',
        'gap-1',
        className
      )}
      {...props}
    />
  )
);

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, ...props }, ref) => {
    const { value: currentValue, onValueChange } = React.useContext(TabsContext);
    const isActive = currentValue === value;
    
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'flex items-center justify-center whitespace-nowrap rounded-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          'px-2 py-1.5 text-xs min-w-0 flex-shrink-0',
          'sm:px-3 sm:py-1.5 sm:text-sm sm:min-w-[auto]',
          'md:px-4 md:py-2',
          isActive && 'bg-background text-foreground shadow-sm',
          className
        )}
        onClick={() => onValueChange?.(value)}
        {...props}
      />
    );
  }
);

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const { value: currentValue } = React.useContext(TabsContext);
    
    if (currentValue !== value) return null;
    
    return (
      <div
        ref={ref}
        className={cn(
          'mt-3 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'overflow-hidden',
          'sm:mt-4',
          className
        )}
        {...props}
      />
    );
  }
);

Tabs.displayName = 'Tabs';
TabsList.displayName = 'TabsList';
TabsTrigger.displayName = 'TabsTrigger';
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps };