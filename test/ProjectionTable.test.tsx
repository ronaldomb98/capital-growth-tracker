import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProjectionTable } from '../components/ProjectionTable';
import type { ProjectionSummaryRow } from '../lib/aggregate';
import { renderWithIntl } from './testUtils';

HTMLElement.prototype.scrollIntoView = vi.fn();
Element.prototype.getAnimations = () => [];
vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });

const rows: ProjectionSummaryRow[] = [{
  label: '2026-01',
  initialCapital: 1000,
  periodProfit: 102.5,
  accumulatedCapital: 1102.5,
  cumulativeProfitPercent: 10.25
}, {
  label: '2026-02',
  initialCapital: 1102.5,
  periodProfit: 120,
  accumulatedCapital: 1222.5,
  cumulativeProfitPercent: 22.25
}];

describe('ProjectionTable', () => {
  it('renders each summary row with formatted currency and cumulative profit', () => {
    renderWithIntl(<ProjectionTable rows={rows} granularity='months' onGranularityChange={vi.fn()} />);

    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getAllByText('1,102.50 USD')).toHaveLength(2);
    expect(screen.getByText('22.25%')).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Months' })).toBeTruthy();
  });

  it('uses Spanish table headings when selected', () => {
    renderWithIntl(<ProjectionTable rows={rows} granularity='days' onGranularityChange={vi.fn()} />, 'es');

    expect(screen.getByRole('columnheader', { name: 'Días' })).toBeTruthy();
    expect(screen.getByText('Rentabilidad acumulada %')).toBeTruthy();
  });
});
