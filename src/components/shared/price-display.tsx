import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  inr: number;
  className?: string;
  usdExchangeRate?: number; // Default is 80 INR per USD
}

export function PriceDisplay({ inr, className, usdExchangeRate = 83 }: PriceDisplayProps) {
  const usd = (inr / usdExchangeRate).toFixed(2);

  return (
    <div className={cn("flex flex-col items-start", className)}>
      <span className="text-foreground font-semibold">₹{inr.toLocaleString('en-IN')}</span>
      <span className="text-xs text-muted-foreground">approx. ${usd}</span>
    </div>
  );
}
