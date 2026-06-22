import type { AppMode, Seat, SessionState } from './types';

export const SEAT_COUNT = 14;

export function createDefaultSeats(): Seat[] {
  return Array.from({ length: SEAT_COUNT }, (_, index) => ({
    index,
    name: '',
    isTeacher: false,
  }));
}

export function createInitialState(): SessionState {
  return {
    version: 1,
    title: 'Harkness Session',
    createdAt: new Date().toISOString(),
    mode: 'setup',
    seats: createDefaultSeats(),
    speakOrder: [],
    notes: '',
  };
}

export function setMode(state: SessionState, mode: AppMode): SessionState {
  return { ...state, mode };
}

export function updateSeatName(
  state: SessionState,
  index: number,
  name: string,
): SessionState {
  const seats = state.seats.map((seat) =>
    seat.index === index ? { ...seat, name } : seat,
  );
  return { ...state, seats };
}

export function toggleTeacher(state: SessionState, index: number): SessionState {
  const seats = state.seats.map((seat) =>
    seat.index === index
      ? { ...seat, isTeacher: !seat.isTeacher }
      : seat,
  );
  return { ...state, seats };
}

export function recordSpeaker(state: SessionState, index: number): SessionState {
  if (state.mode !== 'discuss') return state;
  return {
    ...state,
    speakOrder: [...state.speakOrder, index],
  };
}

export function undoLastSpeaker(state: SessionState): SessionState {
  if (state.speakOrder.length === 0) return state;
  return {
    ...state,
    speakOrder: state.speakOrder.slice(0, -1),
  };
}

export function resetDiscussion(state: SessionState): SessionState {
  return { ...state, speakOrder: [] };
}

export function setNotes(state: SessionState, notes: string): SessionState {
  return { ...state, notes };
}

export function restoreState(partial: Partial<SessionState>): SessionState {
  const base = createInitialState();
  return {
    ...base,
    ...partial,
    version: 1,
    seats: partial.seats ?? base.seats,
    speakOrder: partial.speakOrder ?? [],
    notes: partial.notes ?? '',
    mode: partial.mode ?? 'setup',
  };
}

export function getSeatLabel(seat: Seat): string {
  if (seat.name.trim()) return seat.name.trim();
  return `Seat ${seat.index + 1}`;
}

export function getSpeakerCounts(speakOrder: number[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const index of speakOrder) {
    counts.set(index, (counts.get(index) ?? 0) + 1);
  }
  return counts;
}

export function getLatestSpeakerIndex(speakOrder: number[]): number | null {
  if (speakOrder.length === 0) return null;
  return speakOrder[speakOrder.length - 1];
}
