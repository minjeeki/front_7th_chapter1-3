import { Event } from '../types';

export function getDropTargetDate(element: HTMLElement | null): string | null {
  if (!element) return null;

  let current: HTMLElement | null = element;

  for (let i = 0; i < 3 && current; i++) {
    if (current.dataset?.date) {
      return current.dataset.date;
    }
    current = current.parentElement;
  }

  return null;
}

export function calculateNewDateFromDrop(event: Event, newDate: string | null): string {
  if (!newDate) {
    return event.date;
  }
  return newDate;
}

export function calculateNewTimeFromDrop(
  dropY: number,
  cellHeight: number,
  startTime: string,
  endTime: string
): string {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;
  const timeRangeMinutes = endTotalMinutes - startTotalMinutes;

  const ratio = Math.max(0, Math.min(1, dropY / cellHeight));
  const newTotalMinutes = Math.round(startTotalMinutes + timeRangeMinutes * ratio);

  const hours = Math.floor(newTotalMinutes / 60);
  const minutes = newTotalMinutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function isValidDropTarget(element: HTMLElement | null): boolean {
  if (!element) return false;

  if (element.classList?.contains('event-box')) {
    return false;
  }

  const date = getDropTargetDate(element);
  return date !== null;
}
