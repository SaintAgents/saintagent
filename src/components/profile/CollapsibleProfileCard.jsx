import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CollapsibleProfileCard({ 
  title, 
  icon: Icon, 
  children, 
  headerContent,
  defaultOpen = true,
  className,
  headerClassName
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={className}>
        <CardHeader className={cn("flex flex-row items-center justify-between space-y-0", headerClassName)}>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            {Icon && <Icon className="w-5 h-5 text-slate-500" />}
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {headerContent}
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen ? "" : "-rotate-90")} />
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}