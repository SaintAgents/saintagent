import { createPageUrl } from '@/utils';

export default function Home() {
  // Immediate redirect preserving query params (like ?ref=CODE)
  if (typeof window !== 'undefined') {
    const queryString = window.location.search;
    window.location.replace(createPageUrl('Join') + queryString);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white">Redirecting...</p>
      </div>
    </div>
  );
}