export interface MemoryDraft {
  showId: string;
  media: { url: string; type: string }[];
  text: string;
  updatedAt: number;
}

function draftKey(showId: string): string {
  return `memory_draft_${showId}`;
}

export function saveDraft(showId: string, draft: Partial<MemoryDraft>): void {
  if (!showId) return;
  const existing = loadDraft(showId);
  const merged: MemoryDraft = {
    showId,
    media: draft.media ?? existing?.media ?? [],
    text: draft.text ?? existing?.text ?? '',
    updatedAt: Date.now(),
  };
  try {
    localStorage.setItem(draftKey(showId), JSON.stringify(merged));
  } catch {
    // storage full or unavailable – silently ignore
  }
}

export function loadDraft(showId: string): MemoryDraft | null {
  if (!showId) return null;
  try {
    const raw = localStorage.getItem(draftKey(showId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MemoryDraft & { showId: string };
    if (!parsed.showId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearDraft(showId: string): void {
  if (!showId) return;
  try {
    localStorage.removeItem(draftKey(showId));
  } catch {
    // silently ignore
  }
}

export function hasDraft(showId: string): boolean {
  return loadDraft(showId) !== null;
}
