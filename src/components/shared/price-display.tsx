
import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  inr: number;
  className?: string;
  usdExchangeRate?: number; // Default is 83 INR per USD
}

export function PriceDisplay({ inr, className, usdExchangeRate = 83 }: PriceDisplayProps) {
  const usd = (inr / usdExchangeRate).toFixed(2);

  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className="text-primary text-lg font-semibold">₹{inr.toLocaleString('en-IN')}</span>
      <span className="text-xs text-muted-foreground">approx. ${usd}</span>
    </div>
  );
}
