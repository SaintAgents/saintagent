import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { buildVCard } from "@/components/profile/ProfileQRCode";
import { Loader2, Mail, Globe, Download, ShieldCheck, MapPin, Sparkles, User } from "lucide-react";

export default function VCardLanding() {
  const { saNumber } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!saNumber) return;
    base44.functions.invoke("getContactCard", { sa_number: saNumber })
      .then((res) => setProfile(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [saNumber]);

  const handleSaveContact = () => {
    if (!profile) return;
    const vcard = buildVCard(profile);
    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(profile.display_name || "contact").replace(/\s+/g, "_")}.vcf`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black px-6">
        <div className="text-center space-y-4">
          <User className="w-12 h-12 text-violet-500/40 mx-auto" />
          <h1 className="text-xl font-semibold text-violet-50">Contact Not Found</h1>
          <p className="text-sm text-slate-400">This contact link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  const name = profile.display_name || "Unknown";
  const handle = profile.handle ? `@${profile.handle}` : "";
  const saNum = profile.sa_number ? `SA#${profile.sa_number}` : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-sm space-y-5">
        <div className="flex items-center justify-center gap-1.5 pt-2">
          <Sparkles className="w-3.5 h-3.5 text-violet-500/60" />
          <span className="text-[11px] uppercase tracking-widest text-violet-500/60 font-medium">Saint Agents World</span>
          <Sparkles className="w-3.5 h-3.5 text-violet-500/60" />
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-slate-900 to-slate-950 shadow-2xl">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-violet-500/40 rounded-tl-2xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-violet-500/40 rounded-br-2xl" />

          <div className="p-6 space-y-5">
            <div className="flex justify-center">
              {profile.avatar_url ? (
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-violet-500/40 shadow-lg">
                  <img src={profile.avatar_url} alt={name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full border-2 border-violet-500/30 bg-violet-900/50 flex items-center justify-center text-violet-300 text-3xl font-bold">
                  {name[0]?.toUpperCase()}
                </div>
              )}
            </div>

            <div className="text-center space-y-1">
              <h1 className="text-xl font-bold text-violet-50">{name}</h1>
              {handle && <p className="text-sm text-violet-400">{handle}</p>}
            </div>

            <div className="flex items-center justify-center gap-4">
              {profile.trust_score > 0 && (
                <div className="flex items-center gap-1 text-emerald-500/70">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">{profile.trust_score}/100 Trust</span>
                </div>
              )}
              {saNum && (
                <div className="text-xs font-mono text-violet-500/50 tracking-wide">{saNum}</div>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-violet-500/10">
              {profile.user_id && (
                <a href={`mailto:${profile.user_id}`} className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-violet-500/5 transition-colors group">
                  <Mail className="w-4 h-4 text-violet-600/60 shrink-0" />
                  <span className="text-sm text-slate-300 group-hover:text-violet-50 transition-colors truncate">{profile.user_id}</span>
                </a>
              )}
              {profile.region && (
                <div className="flex items-center gap-2.5 p-2.5">
                  <MapPin className="w-4 h-4 text-violet-600/60 shrink-0" />
                  <span className="text-sm text-slate-400">{profile.region}</span>
                </div>
              )}
              {profile.social_links?.website && (
                <a href={profile.social_links.website.startsWith("http") ? profile.social_links.website : `https://${profile.social_links.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-violet-500/5 transition-colors group">
                  <Globe className="w-4 h-4 text-violet-600/60 shrink-0" />
                  <span className="text-sm text-slate-300 group-hover:text-violet-50 transition-colors truncate">{profile.social_links.website.replace(/^https?:\/\//, "")}</span>
                </a>
              )}
            </div>

            <button
              onClick={handleSaveContact}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-colors shadow-lg shadow-violet-600/20"
            >
              <Download className="w-4 h-4" />
              Save to Contacts
            </button>
          </div>
        </div>

        {profile.bio && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-xs text-slate-400 leading-relaxed">{profile.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
}