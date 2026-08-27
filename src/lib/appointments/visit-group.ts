import { addMinutes } from "date-fns";

const VISIT_GROUP_PREFIX = "[visit:";

export function createVisitGroupMarker(groupId: string, userNotes?: string): string {
  const marker = `${VISIT_GROUP_PREFIX}${groupId}]`;
  if (!userNotes?.trim()) return marker;
  return `${marker}\n${userNotes.trim()}`;
}

export function parseVisitGroupId(notes: string | null | undefined): string | null {
  if (!notes?.startsWith(VISIT_GROUP_PREFIX)) return null;
  const end = notes.indexOf("]");
  if (end === -1) return null;
  return notes.slice(VISIT_GROUP_PREFIX.length, end) || null;
}

export function stripVisitGroupMarker(notes: string | null | undefined): string {
  if (!notes) return "";
  if (!notes.startsWith(VISIT_GROUP_PREFIX)) return notes;
  const newline = notes.indexOf("\n");
  if (newline === -1) return "";
  return notes.slice(newline + 1).trim();
}

export function getSequentialSlotStart(
  baseStart: Date,
  priorDurations: number[]
): Date {
  return priorDurations.reduce(
    (cursor, duration) => addMinutes(cursor, duration),
    baseStart
  );
}

export function getTotalDuration(durations: number[]): number {
  return durations.reduce((sum, duration) => sum + duration, 0);
}
