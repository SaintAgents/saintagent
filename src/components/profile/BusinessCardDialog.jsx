import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Download, X, ShieldCheck, Link2, Copy } from "lucide-react";
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import useCardArtwork from '@/components/profile/useCardArtwork';
import ContactCardDetails from '@/components/publicprofile/ContactCardDetails';
import { linkTreeEditorQuery } from '@/components/publicprofile/linkTreeEditorQuery';
import ProfileQRCode from "./ProfileQRCode";
import SharePublicProfile from '@/components/publicprofile/SharePublicProfile';
import { contactPath, contactShareUrl } from '@/components/publicprofile/publicLinks';

export default function BusinessCardDialog({ open, onOpenChange, profile, inline = false, artworkUrl }) {
  const active = open || inline;
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);

  const name = profile?.display_name || "Unknown";
  const handle = profile?.handle ? `@${profile.handle}` : "";
  const saNumber = profile?.sa_number ? `SA#${profile.sa_number}` : "";
  const id = profile?.sa_number || profile?.id;
  const { data: publicContact } = useQuery({ queryKey: ['public-contact', id], enabled: !!id && active, retry: false, queryFn: async () => (await base44.functions.invoke('getContactCard', { id })).data });
  const { user } = useAuth();
  const isOwner = !!user?.email && user.email === profile?.user_id;
  const { data: ownerData } = useQuery({ ...linkTreeEditorQuery(user), enabled: active && isOwner });
  const settings = ownerData?.saved;
  const contact = {
    location: profile?.location || profile?.region,
    website: profile?.social_links?.website,
    ...publicContact,
    ...(settings ? { title: settings.contact_title, organization: settings.contact_org,
      location: settings.contact_address?.trim() || profile?.location || profile?.region,
      email: settings.share_email === true ? user.email : '', phone: settings.share_phone === true ? settings.contact_phone : '',
      contact_order: settings.contact_order } : {}),
  };
  const trustScore = profile?.trust_score || 0;
  const ownerArt = useCardArtwork(user?.id, profile?.id, active && isOwner && !inline);
  const artwork = artworkUrl || ownerArt.url || publicContact?.digital_art_url;
  const avatarUrl = artwork || profile?.avatar_url;
  const hasArtwork = !!artwork;

  // Fetch affiliate code for this user
  const { data: affiliateCodes = [] } = useQuery({
    queryKey: ['affiliateCode', profile?.user_id],
    queryFn: () => base44.entities.AffiliateCode.filter({ user_id: profile.user_id }),
    enabled: !!profile?.user_id && active,
    staleTime: 300000,
  });
  const affiliateCode = affiliateCodes[0]?.code || "";
  const joinLink = affiliateCode
    ? `${window.location.origin}/Join?ref=${affiliateCode}`
    : `${window.location.origin}/Join`;

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

  const card = <>
        <button
          type="button"
          aria-label="Download digital card"
          onClick={handleDownload}
          disabled={downloading}
          className={`${inline ? 'absolute top-3 right-3' : 'absolute -top-3 -left-3'} w-8 h-8 rounded-full bg-white border border-violet-400 text-violet-600 flex items-center justify-center hover:bg-violet-50 z-10 disabled:opacity-50`}
          title="Download"
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        </button>
        {!inline && <DialogClose asChild>
          <button className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white border border-violet-400 text-violet-600 flex items-center justify-center hover:bg-violet-50 z-20">
            <X className="w-4 h-4" />
          </button>
        </DialogClose>}

        <div className="flex flex-col items-center gap-4 pt-2">
          <div
            ref={cardRef}
            className="relative overflow-hidden shadow-2xl"
            style={{ width: inline ? 'min(100%, 420px)' : '420px', height: '240px' }}
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
                  <div className={hasArtwork ? 'size-20 overflow-hidden' : 'w-20 h-20 rounded-full overflow-hidden border-2 border-violet-500/40 shadow-lg'}>
                    <img src={avatarUrl} alt={hasArtwork ? 'Contact card emblem' : name} className={`w-full h-full ${hasArtwork ? 'object-contain' : 'object-cover'}`} crossOrigin="anonymous" />
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
                <ContactCardDetails profile={contact} compact />
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

              {/* Affiliate / Join link bottom-center */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                {affiliateCode ? (
                  <div className="text-[8px] text-violet-700/60 tracking-wide">
                    <span className="text-violet-500/80 font-semibold">JOIN:</span>{" "}
                    <span className="text-violet-700/70">saintagent.world/Join?ref={affiliateCode}</span>
                  </div>
                ) : (
                  <div className="text-[8px] text-violet-700/60 tracking-wide">Saint Agents World</div>
                )}
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

          {publicContact?.contact_id && <div className="w-full space-y-2 rounded-lg border bg-card p-3 text-card-foreground"><a href={contactPath(publicContact.contact_id)} target="_blank" rel="noreferrer" className="block text-center text-sm underline">Open public contact card</a><SharePublicProfile url={contactShareUrl(publicContact.contact_id)} label="Digital Contact Card" /></div>}
          {/* Join Link & Affiliate Code */}
          <div className="w-full max-w-[420px] space-y-2 pb-2">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-50 border border-violet-200 cursor-pointer hover:bg-violet-100 transition-colors"
              onClick={() => {
                navigator.clipboard.writeText(joinLink);
                toast({ title: "Join link copied!" });
              }}
            >
              <Link2 className="w-3.5 h-3.5 text-violet-500 shrink-0" />
              <span className="text-xs text-violet-700 truncate flex-1 font-mono">{joinLink}</span>
              <Copy className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            </div>
            {affiliateCode && (
              <p className="text-center text-[10px] text-violet-500">
                Referral Code: <span className="font-semibold font-mono">{affiliateCode}</span>
              </p>
            )}
          </div>
        </div>
  </>;

  if (inline) return <section className="relative max-w-lg rounded-xl border bg-card p-4 text-card-foreground">
    <h2 className="pr-10 text-lg font-semibold">Digital Contact Card</h2>
    {isOwner && <Link to="/LinkTreeEditor#contact-card-settings" className="mb-3 inline-block text-sm underline">Edit card details and field order</Link>}
    {card}
  </section>;

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-lg p-0 bg-transparent border-none shadow-none">
      <DialogTitle className="sr-only">Business Card — {name}</DialogTitle>
      {card}
      {isOwner && <Link to="/LinkTreeEditor#contact-card-settings" onClick={() => onOpenChange?.(false)} className="mx-auto mb-3 rounded-md bg-card px-3 py-2 text-sm text-card-foreground underline">Edit card details and field order</Link>}
    </DialogContent>
  </Dialog>;
}