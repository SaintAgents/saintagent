import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const LEVELS = [
  { level: 1, name: "Seeker", threshold: 0, desc: "You’ve entered the field; begin syncing and observing." },
  { level: 2, name: "Initiate", threshold: 700, desc: "Discernment stabilizes; integrity guides action." },
  { level: 3, name: "Adept", threshold: 1500, desc: "Gnosis becomes practice; contribution begins." },
  { level: 4, name: "Master", threshold: 2500, desc: "Reads cycles and mirrored patterns with precision." },
  { level: 5, name: "Sage", threshold: 3700, desc: "Synthesizes insight into clear direction for others." },
  { level: 6, name: "Oracle", threshold: 5200, desc: "Acts from inner calibration; decisions ripple cleanly." },
  { level: 7, name: "Guardian", threshold: 7000, desc: "Understands meta-harmonics; bridges polarities." },
  { level: 8, name: "Integrator", threshold: 8800, desc: "Harmonizes people, projects, and protocols." },
  { level: 9, name: "Ascended", threshold: 10000, desc: "Protects the signal; steward of trust and coherence." },
];

export default function AscensionLadderPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full border text-xs leading-none"
          title="SaintAgent GGG Ascension Ladder"
        >
          ?
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-900">
            🔱 SaintAgent GGG Ascension Ladder
          </div>
          <p className="text-xs text-slate-500">1 → 10,000 GGG</p>
          <div className="mt-2 divide-y border rounded-lg overflow-hidden">
            {LEVELS.map((lvl) => (
              <div key={lvl.level} className="p-2 grid grid-cols-10 items-start gap-2 text-xs">
                <div className="col-span-1 font-semibold text-slate-700">{lvl.level}</div>
                <div className="col-span-3 font-medium text-slate-900">{lvl.name}</div>
                <div className="col-span-2 text-slate-600">{lvl.threshold.toLocaleString()} GGG</div>
                <div className="col-span-4 text-slate-600">{lvl.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}