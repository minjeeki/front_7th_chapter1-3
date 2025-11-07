import { useCallback, useRef, useState } from 'react';

import { Event } from '../types';
import {
  calculateNewDateFromDrop,
  calculateNewTimeFromDrop,
  getDropTargetDate,
  isValidDropTarget,
} from '../utils/dragAndDropUtils';

interface DragState {
  event: Event | null;
  isDragging: boolean;
}

/**
 * 드래그 앤 드롭 기능을 관리하는 훅
 */
export const useDragAndDrop = (
  onEventUpdate: (eventId: string, updates: { date?: string; startTime?: string; endTime?: string }) => Promise<void>
) => {
  const [dragState, setDragState] = useState<DragState>({
    event: null,
    isDragging: false,
  });

  const dragStartPositionRef = useRef<{ x: number; y: number } | null>(null);

  /**
   * 드래그 시작 처리
   */
  const handleDragStart = useCallback((event: Event, e: React.DragEvent<HTMLElement>) => {
    setDragState({
      event,
      isDragging: true,
    });

    dragStartPositionRef.current = { x: e.clientX, y: e.clientY };

    // 드래그 이미지 설정 (선택적)
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', event.id);
    }
  }, []);

  /**
   * 드래그 종료 처리
   */
  const handleDragEnd = useCallback(() => {
    setDragState({
      event: null,
      isDragging: false,
    });
    dragStartPositionRef.current = null;
  }, []);

  /**
   * 드롭 처리
   */
  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (!dragState.event) return;

      const target = e.currentTarget;
      const dropTarget = e.target as HTMLElement;

      // 드롭 타겟이 유효한지 확인
      if (!isValidDropTarget(dropTarget)) {
        handleDragEnd();
        return;
      }

      // 드롭 위치에서 날짜 추출
      const newDate = getDropTargetDate(dropTarget);

      if (!newDate) {
        handleDragEnd();
        return;
      }

      // 날짜 업데이트
      const updatedDate = calculateNewDateFromDrop(dragState.event, newDate);

      // 셀 내부의 Y 좌표로 시간 계산 (선택적)
      const cell = dropTarget.closest('td');
      if (cell) {
        const cellRect = cell.getBoundingClientRect();
        const dropY = e.clientY - cellRect.top;
        const cellHeight = cellRect.height;

        // 셀의 시간 범위 가정 (기본값: 09:00 ~ 18:00)
        // 실제로는 뷰 타입과 셀 위치에 따라 달라질 수 있음
        const newStartTime = calculateNewTimeFromDrop(
          dropY,
          cellHeight,
          dragState.event.startTime,
          dragState.event.endTime
        );

        // 시간 차이 계산하여 종료 시간도 업데이트
        const [oldStartHours, oldStartMinutes] = dragState.event.startTime.split(':').map(Number);
        const [oldEndHours, oldEndMinutes] = dragState.event.endTime.split(':').map(Number);
        const durationMinutes =
          oldEndHours * 60 + oldEndMinutes - (oldStartHours * 60 + oldStartMinutes);

        const [newStartHours, newStartMinutes] = newStartTime.split(':').map(Number);
        const newEndTotalMinutes = newStartHours * 60 + newStartMinutes + durationMinutes;
        const newEndHours = Math.floor(newEndTotalMinutes / 60);
        const newEndMinutes = newEndTotalMinutes % 60;
        const newEndTime = `${String(newEndHours).padStart(2, '0')}:${String(newEndMinutes).padStart(2, '0')}`;

        await onEventUpdate(dragState.event.id, {
          date: updatedDate,
          startTime: newStartTime,
          endTime: newEndTime,
        });
      } else {
        // 시간 변경 없이 날짜만 업데이트
        await onEventUpdate(dragState.event.id, {
          date: updatedDate,
        });
      }

      handleDragEnd();
    },
    [dragState.event, onEventUpdate, handleDragEnd]
  );

  /**
   * 드래그 오버 처리 (드롭 가능 영역 표시)
   */
  const handleDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  }, []);

  return {
    dragState,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    handleDragOver,
  };
};
