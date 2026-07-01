import { MdCheckCircle } from 'react-icons/md';
import { Badge } from '@/components/base-ui/badge';
import { Button } from '@/components/base-ui/button';
import { cn } from '@/lib/utils';

export interface PricingFeature {
  text: string;
}

export interface PricingPlan {
  id: string;
  title: string;
  description: string;
  price: string;
  priceSuffix?: string;
  features: PricingFeature[];
  buttonText: string;
  isPopular?: boolean;
}

export interface Pricing1Props {
  plans: PricingPlan[];
  className?: string;
}

export function Pricing1({ plans, className }: Pricing1Props) {
  return (
    <div className={cn('mx-auto w-full max-w-6xl px-4 md:px-6 py-4 md:py-8 font-mono', className)}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              'group relative flex flex-col border p-6 backdrop-blur-md transition-colors duration-300 sm:p-8',
              plan.isPopular
                ? 'border-primary/40 bg-primary/5'
                : 'border-white/10 bg-black/40 hover:bg-white/2'
            )}
          >
            {/* Corner Accents */}
            <div
              className={cn(
                'absolute top-0 left-0 h-2 w-2 border-t border-l',
                plan.isPopular ? 'border-primary' : 'border-white/40'
              )}
            />
            <div
              className={cn(
                'absolute top-0 right-0 h-2 w-2 border-t border-r',
                plan.isPopular ? 'border-primary' : 'border-white/40'
              )}
            />
            <div
              className={cn(
                'absolute bottom-0 left-0 h-2 w-2 border-b border-l',
                plan.isPopular ? 'border-primary' : 'border-white/40'
              )}
            />
            <div
              className={cn(
                'absolute right-0 bottom-0 h-2 w-2 border-r border-b',
                plan.isPopular ? 'border-primary' : 'border-white/40'
              )}
            />

            {plan.isPopular && (
              <div className="absolute top-6 right-6">
                <Badge
                  variant="default"
                  className="rounded-none bg-primary px-3 py-1 text-[10px] font-bold tracking-widest text-black uppercase"
                >
                  Popular
                </Badge>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-foreground mb-3 text-xl font-bold tracking-widest uppercase">
                {plan.title}
              </h3>
              <p className="min-h-[40px] pr-8 text-xs leading-relaxed tracking-wide text-white/50 sm:pr-12">
                {plan.description}
              </p>
            </div>

            <div className="mb-6 flex items-baseline gap-2">
              <span className="text-foreground text-5xl font-extrabold tracking-tighter tabular-nums">
                {plan.price}
              </span>
              {plan.priceSuffix && (
                <span className="text-xs font-medium tracking-widest text-white/40 uppercase">
                  {plan.priceSuffix}
                </span>
              )}
            </div>

            <div className="mb-8 h-px w-1/3 bg-white/10" />

            <ul className="mb-8 flex-1 space-y-4">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <MdCheckCircle className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                  <span className="text-xs leading-relaxed tracking-wide text-white/60">
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-4">
              {plan.isPopular ? (
                <Button
                  size="lg"
                  className="flex h-14 w-full items-center justify-between rounded-none bg-primary px-6 text-xs font-bold tracking-widest text-black uppercase hover:bg-primary/90 active:scale-[0.98]"
                >
                  <span>Get started for</span>
                  <div className="mx-4 h-px flex-1 bg-black/20" />
                  <span>{plan.buttonText}</span>
                </Button>
              ) : (
                <Button className="group/btn flex h-14 w-full cursor-pointer items-center justify-between border border-white/10 bg-transparent px-6 text-xs font-bold tracking-widest uppercase outline-none transition-colors hover:bg-white/5">
                  <span className="text-foreground group-hover/btn:text-primary transition-colors">
                    Get started for
                  </span>
                  <div className="group-hover/btn:bg-primary/40 mx-4 h-px flex-1 bg-white/10 transition-colors" />
                  <span className="text-foreground group-hover/btn:text-primary transition-colors">
                    {plan.buttonText}
                  </span>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
