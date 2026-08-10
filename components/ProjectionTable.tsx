'use client';

import { Box, Text } from '@godaddy/antares';
import { useIntl } from 'react-intl';
import type { ProjectionSummaryRow } from '../lib/aggregate';
import { formatCurrency, formatPercent } from '../lib/format';
import type { Granularity } from '../lib/types';

export function ProjectionTable({
  rows,
  granularity
}: {
  rows: ProjectionSummaryRow[];
  granularity: Granularity;
}) {
  const { formatMessage } = useIntl();

  return (
    <Box elevation='card' padding='md' rounding='md'>
      <Text as='p' className='cgt-table-count'>
        {formatMessage({ id: 'table.rows' }, { count: rows.length })}
      </Text>
      <div className='table-scroll'>
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
