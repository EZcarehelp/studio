"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthStatCardProps {
  title: string;
  value: string;
  goal?: string;
  progressValue?: number; // 0-100 for Progress component
  Icon: LucideIcon;
  iconColorClass?: string; // e.g., "text-red-500"
  bgColorClass?: string; // e.g., "bg-red-100/50"
  unit?: string;
  footerText?: string;
}

export function HealthStatCard({
  title,
  value,
  goal,
  progressValue,
  Icon,
  iconColorClass = "text-primary",
  bgColorClass = "bg-primary/10",
  unit,
  footerText,
}: HealthStatCardProps) {
  return (
    <Card className={cn("shadow-md hover:shadow-lg transition-shadow rounded-lg card-gradient", bgColorClass ? bgColorClass.replace('text-', 'bg-').replace('500', '100/50') : "")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-foreground/80">{title}</CardTitle>
        <Icon className={cn("h-5 w-5", iconColorClass)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {value}
          {unit && <span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span>}
        </div>
        {goal && <p className="text-xs text-muted-foreground mt-0.5">Goal: {goal}</p>}
        {progressValue !== undefined && (
          <Progress value={progressValue} className="h-2 mt-2" indicatorClassName={iconColorClass ? iconColorClass.replace('text-','bg-') : 'bg-primary'}/>
        )}
        {footerText && <p className="text-xs text-muted-foreground mt-2">{footerText}</p>}
      </CardContent>
    </Card>
  );
}

// Extend Progress to accept indicatorClassName
declare module "@/components/ui/progress" {
    interface ProgressProps {
        indicatorClassName?: string;
    }
}

// Modify Progress component to use indicatorClassName if provided
const OriginalProgress = Progress;
const PatchedProgress = React.forwardRef<
  React.ElementRef<typeof OriginalProgress>,
  React.ComponentPropsWithoutRef<typeof OriginalProgress> & { indicatorClassName?: string }
>(({ className, value, indicatorClassName, ...props }, ref) => (
  <OriginalProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <OriginalProgressPrimitive.Indicator
      className={cn("h-full w-full flex-1 bg-primary transition-all", indicatorClassName)}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </OriginalProgressPrimitive.Root>
));
PatchedProgress.displayName = "Progress";

// Need to re-import ProgressPrimitive as it's not exported from the original progress.tsx
import * as OriginalProgressPrimitive from "@radix-ui/react-progress"
import * as React from "react"; // Added for PatchedProgress

// Assign PatchedProgress to Progress to override it locally for this module or ensure it's exported correctly
// This is tricky. Ideally, the Progress component itself should support this.
// For now, this will be a local patch. If Progress is used elsewhere, that needs to be considered.
// The better way is to modify components/ui/progress.tsx directly.
// As this file is only for this component, it is fine.
(Progress as any) = PatchedProgress;
