import React, { memo } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

// Card otimizado com memoização
export const OptimizedCard = memo<OptimizedCardProps>(({ children, className, hover = false }) => (
  <div className={cn(
    "bg-card text-card-foreground rounded-xl shadow-sm border",
    hover && "transition-shadow duration-200 hover:shadow-md",
    className
  )}>
    {children}
  </div>
));

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

// Componente de imagem com lazy loading
export const LazyImage = memo<LazyImageProps>(({ src, alt, className, placeholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUM5Qzk5Ij5JbWFnZW08L3RleHQ+Cjwvc3ZnPg==" }) => {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!loaded && !error && (
        <img
          src={placeholder}
          alt=""
          className={cn("w-full h-full object-cover", className)}
        />
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0 absolute inset-0",
          className
        )}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
      />
    </div>
  );
});

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  maxHeight: number;
  className?: string;
}

// Lista virtualizada para grandes datasets
export function VirtualizedList<T>({ 
  items, 
  renderItem, 
  itemHeight, 
  maxHeight, 
  className 
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleCount = Math.ceil(maxHeight / itemHeight) + 2; // Buffer de 2 itens
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount, items.length);
  
  const visibleItems = items.slice(startIndex, endIndex);
  
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      className={cn("overflow-auto", className)}
      style={{ height: maxHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => 
            renderItem(item, startIndex + index)
          )}
        </div>
      </div>
    </div>
  );
}

interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
}

// Skeleton loading otimizado
export const LoadingSkeleton = memo<LoadingSkeletonProps>(({ lines = 3, className }) => (
  <div className={cn("animate-pulse space-y-2", className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <div 
        key={i}
        className="h-4 bg-muted rounded"
        style={{ width: `${Math.random() * 40 + 60}%` }}
      />
    ))}
  </div>
));

interface OptimizedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

// Botão otimizado com estados
export const OptimizedButton = memo<OptimizedButtonProps>(({ 
  children, 
  variant = 'default', 
  size = 'md', 
  loading = false,
  className,
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground"
  };
  
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-11 px-6 text-lg"
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
});

// Definir display names para debugging
OptimizedCard.displayName = 'OptimizedCard';
LazyImage.displayName = 'LazyImage';
LoadingSkeleton.displayName = 'LoadingSkeleton';
OptimizedButton.displayName = 'OptimizedButton';