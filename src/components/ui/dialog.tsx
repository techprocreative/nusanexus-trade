import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  asChild?: boolean;
}

const DialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({ open: false, onOpenChange: () => {} });

const Dialog: React.FC<DialogProps> = ({ children, open: controlledOpen, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  
  return (
    <DialogContext.Provider value={{ open, onOpenChange: setOpen }}>
      {children}
    </DialogContext.Provider>
  );
};

const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ className, children, asChild, ...props }, ref) => {
    const { onOpenChange } = React.useContext(DialogContext);
    
    if (asChild) {
      return React.cloneElement(children as React.ReactElement, {
        onClick: () => onOpenChange(true)
      });
    }
    
    return (
      <button
        ref={ref}
        className={className}
        onClick={() => onOpenChange(true)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open, onOpenChange } = React.useContext(DialogContext);
    
    if (!open) return null;
    
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        />
        
        {/* Dialog */}
        <div className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]">
          <div
            ref={ref}
            className={cn(
              'grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg',
              className
            )}
            {...props}
          >
            {children}
            <button
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>
      </>
    );
  }
);

const DialogHeader: React.FC<DialogHeaderProps> = ({ className, ...props }) => (
  <div
    className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
    {...props}
  />
);

const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
);

const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
);

Dialog.displayName = 'Dialog';
DialogTrigger.displayName = 'DialogTrigger';
DialogContent.displayName = 'DialogContent';
DialogHeader.displayName = 'DialogHeader';
DialogTitle.displayName = 'DialogTitle';
DialogDescription.displayName = 'DialogDescription';

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
};
export type {
  DialogProps,
  DialogTriggerProps,
  DialogContentProps,
  DialogHeaderProps,
  DialogTitleProps,
  DialogDescriptionProps
};