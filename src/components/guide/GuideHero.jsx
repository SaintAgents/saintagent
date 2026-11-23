import { useSyncExternalStore } from 'react';

const lightArt = 'https://base44.app/api/apps/694f3e0401b05e6e8a042002/files/mp/public/694f3e0401b05e6e8a042002/375b4e38e18554f811f925536224e0ef_my-guide-light.png';
const darkArt = 'https://base44.app/api/apps/694f3e0401b05e6e8a042002/files/mp/public/694f3e0401b05e6e8a042002/e70d55a81cf4fb55821cfe20601077ed_my-guide-dark.png';

function subscribe(onChange) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

const isDark = () => ['dark', 'hacker'].includes(document.documentElement.dataset.theme);

export default function GuideHero() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);
  return <header>
    <div className="sr-only">
      <p>My Guide · SaintAgent Personal Intelligence</p>
      <h1>Your wisdom. Your intelligence. Your path forward.</h1>
      <p>One place to explore meaning, investigate ideas, and move toward action, each kept clearly distinct.</p>
    </div>
    <img src={dark ? darkArt : lightArt} alt="A woman and a lion frame a luminous lotus rising above Earth." width={1024} height={508} fetchPriority="high" className="block h-auto w-full rounded-2xl" />
  </header>;
}