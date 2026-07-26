import { useMemo } from "react";

export function buildVCard(profile) {
  const name = profile?.display_name || "";
  const email = profile?.user_id || "";
  const region = profile?.region || "";
  const website = profile?.social_links?.website || "";
  const handle = profile?.handle || "";

  const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${name}`];
  if (email) lines.push(`EMAIL:${email}`);
  if (website) lines.push(`URL:${website}`);
  if (region) lines.push(`ADR:;;${region};;;;`);
  if (handle) lines.push(`NOTE:@${handle} on Saint Agents World`);
  if (profile?.sa_number) lines.push(`NOTE:SA#${profile.sa_number}`);
  lines.push("END:VCARD");
  return lines.join("\n");
}

export default function ProfileQRCode({ profile, size = 100, className = "", crossOrigin }) {
  const linkUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const saNum = profile?.sa_number;
    if (saNum) return `${origin}/vcard/${saNum}`;
    if (profile?.user_id) return `${origin}/Profile?id=${encodeURIComponent(profile.user_id)}`;
    return origin;
  }, [profile?.sa_number, profile?.user_id]);

  const qrRes = Math.max(size * 4, 400);
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${qrRes}x${qrRes}&data=${encodeURIComponent(linkUrl)}&margin=1&qzone=1`;

  return (
    <img
      src={url}
      alt="Scan to view contact"
      width={size}
      height={size}
      className={className}
      crossOrigin={crossOrigin}
    />
  );
}