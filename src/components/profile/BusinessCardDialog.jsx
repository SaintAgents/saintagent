import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Download, X, Mail, ShieldCheck, Globe, MapPin } from "lucide-react";
import ProfileQRCode from "./ProfileQRCode";

export default function BusinessCardDialog({ open, onOpenChange, profile }) {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);

  const name = profile?.display_name || "Unknown";
  const handle = profile?.handle ? `@${profile.handle}` : "";
  const saNumber = profile?.sa_number ? `SA#${profile.sa_number}` : "";
  const email = profile?.user_id || "";
  const region = profile?.region || "";
  const trustScore = profile?.trust_score || 0;
  const avatarUrl = profile?.avatar_url;
  const website = profile?.social_links?.website || "";

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `${name.replace(/\s+/g, "_")}_SaintAgent_Card.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast({ title: "Business card downloaded" });
    } catch {
      toast({ variant: "destructive", title: "Download failed" });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 bg-transparent border-none shadow-none">
        <DialogTitle className="sr-only">Business Card — {name}</DialogTitle>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-white border border-violet-400 text-violet-600 flex items-center justify-center hover:bg-violet-50 z-10 disabled:opacity-50"
          title="Download"
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        </button>
        <DialogClose asChild>
          <button className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white border border-violet-400 text-violet-600 flex items-center justify-center hover:bg-violet-50 z-20">
            <X className="w-4 h-4" />
          </button>
        </DialogClose>

        <div className="flex flex-col items-center gap-5 pt-2">
          <div
            ref={cardRef}
            className="relative overflow-hidden shadow-2xl"
            style={{ width: "420px", height: "240px" }}
          >
            {/* White background */}
            <div className="absolute inset-0 bg-white" />
            {/* Decorative borders */}
            <div className="absolute inset-0 border border-violet-500/30" />
            <div className="absolute inset-[3px] border border-violet-500/10" />
            <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-violet-500/50" />
            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-violet-500/50" />

            <div className="relative h-full flex items-center gap-4 px-6">
              {/* Avatar */}
              <div className="shrink-0">
                {avatarUrl ? (
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-violet-500/40 shadow-lg">
                    <img src={avatarUrl} alt={name} className="w-full h-full object-cover" crossOrigin="anonymous" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full border-2 border-violet-500/30 bg-violet-100 flex items-center justify-center text-violet-600 text-2xl font-bold">
                    {name[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <h3 className="text-base font-bold text-slate-900 truncate leading-tight">{name}</h3>
                {handle && <p className="text-[11px] text-violet-600 leading-tight">{handle}</p>}
                {region && (
                  <p className="text-[10px] text-slate-600 flex items-center gap-0.5 leading-tight">
                    <MapPin className="w-2.5 h-2.5 shrink-0" /> {region}
                  </p>
                )}
                <div className="flex flex-col gap-0.5 pt-1.5 border-t border-violet-500/10 mt-1.5">
                  {email && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-700 min-w-0">
                      <Mail className="w-2.5 h-2.5 text-violet-700 shrink-0" />
                      <span className="truncate">{email}</span>
                    </div>
                  )}
                  {website && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-700 min-w-0">
                      <Globe className="w-2.5 h-2.5 text-violet-600/60 shrink-0" />
                      <span className="truncate">{website.replace(/^https?:\/\//, "")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* QR Code bottom-right */}
              <div className="absolute bottom-2 right-2">
                <ProfileQRCode profile={profile} size={56} crossOrigin="anonymous" className="rounded-sm" />
              </div>

              {/* SA# bottom-left */}
              {saNumber && (
                <div className="absolute bottom-2 left-3 text-[9px] font-mono text-violet-700/70 tracking-wide">
                  {saNumber}
                </div>
              )}

              {/* Brand center-bottom */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] text-violet-700/60 tracking-wide whitespace-nowrap">
                Saint Agents World
              </div>

              {/* Trust score top-right */}
              {trustScore > 0 && (
                <div className="absolute top-2 right-3 flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600/70" />
                  <span className="text-[9px] text-emerald-600/70">{trustScore}/100</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}