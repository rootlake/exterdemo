import type { ExportedSession, SessionState } from './types';
import { SEAT_COUNT } from './session';

export class ExportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExportError';
  }
}

function isSeat(value: unknown): value is ExportedSession['seats'][number] {
  if (!value || typeof value !== 'object') return false;
  const seat = value as Record<string, unknown>;
  return (
    typeof seat.index === 'number' &&
    seat.index >= 0 &&
    seat.index < SEAT_COUNT &&
    typeof seat.name === 'string' &&
    typeof seat.isTeacher === 'boolean'
  );
}

export function validateExportedSession(data: unknown): ExportedSession {
  if (!data || typeof data !== 'object') {
    throw new ExportError('Invalid session file: expected a JSON object.');
  }

  const session = data as Record<string, unknown>;

  if (session.version !== 1) {
    throw new ExportError('Unsupported session version. Expected version 1.');
  }

  if (typeof session.title !== 'string') {
    throw new ExportError('Invalid session file: missing title.');
  }

  if (typeof session.createdAt !== 'string') {
    throw new ExportError('Invalid session file: missing createdAt.');
  }

  if (!Array.isArray(session.seats) || session.seats.length !== SEAT_COUNT) {
    throw new ExportError(`Invalid session file: expected ${SEAT_COUNT} seats.`);
  }

  if (!session.seats.every(isSeat)) {
    throw new ExportError('Invalid session file: seat data is malformed.');
  }

  if (!Array.isArray(session.speakOrder)) {
    throw new ExportError('Invalid session file: speakOrder must be an array.');
  }

  const speakOrder = session.speakOrder as unknown[];
  if (
    !speakOrder.every(
      (index) => typeof index === 'number' && index >= 0 && index < SEAT_COUNT,
    )
  ) {
    throw new ExportError('Invalid session file: speakOrder contains invalid seat indices.');
  }

  if (typeof session.notes !== 'string') {
    throw new ExportError('Invalid session file: notes must be a string.');
  }

  return {
    version: 1,
    title: session.title,
    createdAt: session.createdAt,
    seats: session.seats as ExportedSession['seats'],
    speakOrder: speakOrder as number[],
    notes: session.notes,
  };
}

export function toExportedSession(state: SessionState): ExportedSession {
  return {
    version: 1,
    title: state.title,
    createdAt: state.createdAt,
    seats: state.seats,
    speakOrder: state.speakOrder,
    notes: state.notes,
  };
}

export function downloadSession(state: SessionState): void {
  const payload = toExportedSession(state);
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const date = new Date(state.createdAt).toISOString().slice(0, 10);
  anchor.href = url;
  anchor.download = `harkness-session-${date}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function importSessionFromFile(file: File): Promise<ExportedSession> {
  const text = await file.text();
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ExportError('Invalid JSON file.');
  }

  return validateExportedSession(parsed);
}
