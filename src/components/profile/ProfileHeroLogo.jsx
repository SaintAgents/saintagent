import { Shield } from 'lucide-react';
import AnimatedBrandLogo from '@/components/hud/AnimatedBrandLogo';

const animation = 'https://base44.app/api/apps/694f3e0401b05e6e8a042002/files/mp/public/694f3e0401b05e6e8a042002/fa72a5075_saintagent-profile-logo.mp4';
const shield = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/5650186ed_SA_shield.png';

export default function ProfileHeroLogo({ saNumber }) {
  return (
    <div className="pointer-events-none absolute right-2 top-2 z-10 flex flex-col items-center gap-1 md:right-4 md:top-4 md:gap-1.5">
      <div className="aspect-video w-24 overflow-hidden rounded-lg border border-secondary/70 bg-sidebar shadow-lg md:w-40">
        <AnimatedBrandLogo src={animation} fallback={shield} className="block h-full w-full object-contain" />
      </div>
      {saNumber && (
        <div className="inline-flex items-center gap-1 rounded-full border border-secondary/70 bg-sidebar px-2 py-0.5 text-[11px] font-semibold tabular-nums tracking-wide text-sidebar-foreground shadow-sm md:px-3 md:text-xs">
          <Shield className="size-3" aria-hidden="true" />
          SA#{saNumber}
        </div>
      )}
    </div>
  );
}