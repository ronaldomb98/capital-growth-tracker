import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProjectionTable } from '../components/ProjectionTable';
import type { ProjectionRow } from '../lib/calc';
import { renderWithIntl } from './testUtils';

const rows: ProjectionRow[] = [{
  period: 1,
  initialCapital: 1000,
  periodProfit: 50,
  accumulatedCapital: 1050
}, {
  period: 2,
  initialCapital: 1050,
  periodProfit: 52.5,
  accumulatedCapital: 1102.5
}];

describe('ProjectionTable', () => {
  it('renders each projection row with formatted currency', () => {
    renderWithIntl(<ProjectionTable rows={rows} frequency='months' />);

    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getAllByText('$1,050.00')).toHaveLength(2);
    expect(screen.getByText('Months')).toBeTruthy();
  });

  it('uses Spanish table headings when selected', () => {
    renderWithIntl(<ProjectionTable rows={rows} frequency='days' />, 'es');

    expect(screen.getByText('Días')).toBeTruthy();
  });
});
