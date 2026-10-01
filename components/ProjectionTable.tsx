'use client';

import { Box, SegmentedController, SegmentedControllerItem, Text } from '@godaddy/antares';
import { useIntl } from 'react-intl';
import type { ProjectionSummaryRow } from '../lib/aggregate';
import { formatCurrency, formatPercent } from '../lib/format';
import type { Granularity } from '../lib/types';

export function ProjectionTable({
  rows,
  granularity,
  onGranularityChange
}: {
  rows: ProjectionSummaryRow[];
  granularity: Granularity;
  onGranularityChange: (value: Granularity) => void;
}) {
  const { formatMessage } = useIntl();

  return (
    <Box elevation='card' padding='md' rounding='md'>
      <div className='cgt-table-toolbar'>
        <div>
          <Text as='h2'>{formatMessage({ id: 'table.label' })}</Text>
          <Text as='p' className='cgt-table-count'>
            {formatMessage({ id: 'table.rows' }, { count: rows.length })}
          </Text>
        </div>
        <div className='cgt-granularity'>
          <Text as='p'>{formatMessage({ id: 'controls.granularity' })}</Text>
          <SegmentedController value={granularity}
            onSelectionChange={(value) => onGranularityChange(value as Granularity)}
            aria-label={formatMessage({ id: 'controls.granularity' })}>
            {(['years', 'months', 'weeks', 'days'] as const).map((value) => (
              <SegmentedControllerItem key={value} value={value}>
                {formatMessage({ id: `freq.${value}` })}
              </SegmentedControllerItem>
            ))}
          </SegmentedController>
        </div>
      </div>
      <Text as='p' className='cgt-table-hint'>{formatMessage({ id: 'table.scrollHint' })}</Text>
      <div className='table-scroll' role='region' tabIndex={0} aria-label={formatMessage({ id: 'table.label' })}>
        <table className='cgt-table'>
          <thead>
            <tr>
              <th>{formatMessage({ id: `freq.${granularity}` })}</th>
              <th>{formatMessage({ id: 'table.initial' })} (USD)</th>
              <th>{formatMessage({ id: 'table.profit' })} (USD)</th>
              <th>{formatMessage({ id: 'table.accumulated' })} (USD)</th>
              <th>{formatMessage({ id: 'table.profitPct' })}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td>{row.label}</td>
                <td className='num'>{formatCurrency(row.initialCapital)}</td>
                <td className='num'>{formatCurrency(row.periodProfit)}</td>
                <td className='num'>{formatCurrency(row.accumulatedCapital)}</td>
                <td className='num'>{formatPercent(row.cumulativeProfitPercent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Box>
  );
}
