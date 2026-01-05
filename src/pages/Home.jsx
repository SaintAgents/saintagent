import { useEffect } from 'react';
import { createPageUrl } from '@/utils';

export default function Home() {
  useEffect(() => {
    // Preserve query parameters (like ?ref=CODE) when redirecting
    const queryString = window.location.search;
    window.location.href = createPageUrl('Join') + queryString;
  }, []);

  return null;
}