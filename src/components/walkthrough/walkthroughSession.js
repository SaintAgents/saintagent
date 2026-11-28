const key = 'activeWalkthrough';

export function readWalkthrough() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(key));
    return saved?.id === 'business_entity' && Number.isInteger(saved.step) && saved.step >= 0 && saved.step < 8 ? saved : null;
  } catch {
    return null;
  }
}

export function saveWalkthrough(id, step, tts) {
  sessionStorage.setItem(key, JSON.stringify({ id, step, tts }));
}

export function clearWalkthrough() {
  sessionStorage.removeItem(key);
}