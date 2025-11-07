import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { describe, expect, it } from 'vitest';

import App from '../../App';
import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils';

const theme = createTheme();

const setup = (element: React.ReactElement) => {
  const user = userEvent.setup();
  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>{element}</SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

describe('드래그 앤 드롭 및 날짜 클릭 기능', () => {

  describe('날짜 클릭 기능', () => {
    it('월간 뷰에서 비어있는 날짜 셀을 클릭하면 폼에 날짜가 자동으로 채워진다', async () => {
      const { user } = setup(<App />);

      const dateInput = screen.getByLabelText(/날짜/i) as HTMLInputElement;

      expect(dateInput.value).toBe('');

      await waitFor(() => {
        const dateCells = document.querySelectorAll('[data-date]');
        expect(dateCells.length).toBeGreaterThan(0);
      });

      const dateCells = document.querySelectorAll('[data-date]');
      const firstDateCell = dateCells[0] as HTMLElement;
      const clickedDate = firstDateCell.getAttribute('data-date');

      await user.click(firstDateCell);

      await waitFor(() => {
        expect(dateInput.value).toBe(clickedDate);
      });
    });

    it('주간 뷰에서 비어있는 날짜 셀을 클릭하면 폼에 날짜가 자동으로 채워진다', async () => {
      const { user } = setup(<App />);

      const viewSelect = screen.getByLabelText(/뷰 타입 선택/i);
      await user.selectOptions(viewSelect, 'week');

      const dateInput = screen.getByLabelText(/날짜/i) as HTMLInputElement;

      await waitFor(() => {
        const weekView = screen.getByTestId('week-view');
        expect(weekView).toBeInTheDocument();
      });

      const dateCells = document.querySelectorAll('[data-date]');
      expect(dateCells.length).toBeGreaterThan(0);

      const firstDateCell = dateCells[0] as HTMLElement;
      const clickedDate = firstDateCell.getAttribute('data-date');

      await user.click(firstDateCell);

      await waitFor(() => {
        expect(dateInput.value).toBe(clickedDate);
      });
    });
  });

  describe('드래그 앤 드롭 기능', () => {
    it('일정을 드래그하여 다른 날짜로 이동시킬 수 있다', async () => {
      setupMockHandlerCreation();
      const { user } = setup(<App />);

      await waitFor(() => {
        const eventBoxes = document.querySelectorAll('.event-box');
        expect(eventBoxes.length).toBeGreaterThan(0);
      });

      const eventBoxes = document.querySelectorAll('.event-box');
      const sourceEvent = eventBoxes[0] as HTMLElement;
      const sourceDate = sourceEvent.closest('[data-date]')?.getAttribute('data-date');
      const dateCells = Array.from(document.querySelectorAll('[data-date]')).filter(
        (cell) => cell.getAttribute('data-date') !== sourceDate
      ) as HTMLElement[];

      expect(dateCells.length).toBeGreaterThan(0);
      const targetCell = dateCells[0];
      const targetDate = targetCell.getAttribute('data-date');

      await user.pointer({ keys: '[MouseLeft>]', target: sourceEvent });

      await user.pointer({ keys: '[/MouseLeft]', target: targetCell });


      await waitFor(() => {
        const updatedEvent = Array.from(document.querySelectorAll('.event-box')).find((box) =>
          box.closest('[data-date]')?.getAttribute('data-date') === targetDate
        );
        expect(updatedEvent).toBeInTheDocument();
      });
    });

    it('일정을 드래그할 때 드래그 중인 상태를 시각적으로 표시한다', async () => {
      setupMockHandlerCreation();
      const { user } = setup(<App />);

      await waitFor(() => {
        const eventBoxes = document.querySelectorAll('.event-box');
        expect(eventBoxes.length).toBeGreaterThan(0);
      });

      const eventBoxes = document.querySelectorAll('.event-box');
      const sourceEvent = eventBoxes[0] as HTMLElement;

      await user.pointer({ keys: '[MouseLeft>]', target: sourceEvent });

      expect(sourceEvent).toBeInTheDocument();
    });
  });
});
