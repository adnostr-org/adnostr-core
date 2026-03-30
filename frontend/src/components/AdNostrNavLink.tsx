import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Terminal, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdNostrNavLinkProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function AdNostrNavLink({ 
  className, 
  variant = 'outline',
  size = 'default'
}: AdNostrNavLinkProps) {
  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={cn(
        "gap-2 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border-primary/20",
        className
      )}
    >
      <Link to="/console">
        <Terminal className="h-4 w-4" />
        <span>AdNostr Console</span>
        <Zap className="h-3 w-3 ml-1 text-amber-500" />
      </Link>
    </Button>
  );
}

export default AdNostrNavLink;