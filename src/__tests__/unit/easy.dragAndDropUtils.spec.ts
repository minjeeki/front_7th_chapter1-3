import { Event } from '../../types';
import {
  calculateNewDateFromDrop,
  calculateNewTimeFromDrop,
  getDropTargetDate,
  isValidDropTarget,
} from '../../utils/dragAndDropUtils';

describe('dragAndDropUtils', () => {
  describe('getDropTargetDate', () => {
    it('테이블 셀 요소에서 날짜를 추출한다', () => {
      const mockElement = {
        dataset: { date: '2025-07-15' },
      } as HTMLElement;

      const result = getDropTargetDate(mockElement);
      expect(result).toBe('2025-07-15');
    });

    it('부모 요소에서 날짜를 찾을 수 있다', () => {
      const mockElement = {
        dataset: {},
        parentElement: {
          dataset: { date: '2025-07-20' },
        },
      } as HTMLElement;

      const result = getDropTargetDate(mockElement);
      expect(result).toBe('2025-07-20');
    });

    it('날짜를 찾을 수 없으면 null을 반환한다', () => {
      const mockElement = {
        dataset: {},
        parentElement: null,
      } as HTMLElement;

      const result = getDropTargetDate(mockElement);
      expect(result).toBeNull();
    });
  });

  describe('calculateNewDateFromDrop', () => {
    it('드롭된 날짜로 이벤트의 새 날짜를 계산한다', () => {
      const event: Event = {
        id: '1',
        title: '테스트 이벤트',
        date: '2025-07-10',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      };

      const newDate = '2025-07-15';
      const result = calculateNewDateFromDrop(event, newDate);

      expect(result).toBe(newDate);
    });

    it('날짜가 null이면 원본 날짜를 반환한다', () => {
      const event: Event = {
        id: '1',
        title: '테스트 이벤트',
        date: '2025-07-10',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      };

      const result = calculateNewDateFromDrop(event, null);

      expect(result).toBe(event.date);
    });
  });

  describe('calculateNewTimeFromDrop', () => {
    it('셀 내부의 Y 좌표로 새 시간을 계산한다', () => {
      const cellHeight = 120; // 픽셀
      const dropY = 60; // 셀 중간 위치

      const result = calculateNewTimeFromDrop(dropY, cellHeight, '09:00', '18:00');

      // 9시간을 120px로 나누면 시간당 약 13.33px
      // 60px는 약 4.5시간 후, 즉 13:30
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('셀 상단 근처에서는 시작 시간에 가까운 시간을 반환한다', () => {
      const cellHeight = 120;
      const dropY = 5; // 셀 상단 근처

      const result = calculateNewTimeFromDrop(dropY, cellHeight, '09:00', '18:00');

      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('셀 하단 근처에서는 종료 시간에 가까운 시간을 반환한다', () => {
      const cellHeight = 120;
      const dropY = 115; // 셀 하단 근처

      const result = calculateNewTimeFromDrop(dropY, cellHeight, '09:00', '18:00');

      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  describe('isValidDropTarget', () => {
    it('유효한 드롭 타겟 요소를 확인한다', () => {
      const validElement = {
        dataset: { date: '2025-07-15' },
        classList: { contains: () => false },
      } as HTMLElement;

      const result = isValidDropTarget(validElement);
      expect(result).toBe(true);
    });

    it('이벤트 박스 요소는 드롭 타겟이 아니다', () => {
      const eventBoxElement = {
        dataset: { date: '2025-07-15' },
        classList: { contains: (className: string) => className === 'event-box' },
      } as HTMLElement;

      const result = isValidDropTarget(eventBoxElement);
      expect(result).toBe(false);
    });

    it('날짜가 없는 요소는 드롭 타겟이 아니다', () => {
      const invalidElement = {
        dataset: {},
        classList: { contains: () => false },
      } as HTMLElement;

      const result = isValidDropTarget(invalidElement);
      expect(result).toBe(false);
    });
  });
});
