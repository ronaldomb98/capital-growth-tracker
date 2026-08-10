'use client';

import { Box, Text } from '@godaddy/antares';
import { useIntl } from 'react-intl';
import { useLocaleContext } from '../app/providers';
import type { ProjectionRow } from '../lib/calc';
import { formatCurrency } from '../lib/format';
import type { Frequency } from '../lib/types';

export function ProjectionTable({
  rows,
  frequency
}: {
  rows: ProjectionRow[];
  frequency: Frequency;
}) {
  const { formatMessage } = useIntl();
  const { locale } = useLocaleContext();

  return (
    <Box elevation='card' padding='md' rounding='md'>
      <Text as='p' className='cgt-table-count'>
        {formatMessage({ id: 'table.rows' }, { count: rows.length })}
      </Text>
      <div className='table-scroll'>
        <table className='cgt-table'>
          <thead>
            <tr>
              <th>{formatMessage({ id: `freq.${frequency}` })}</th>
              <th>{formatMessage({ id: 'table.initial' })}</th>
              <th>{formatMessage({ id: 'table.profit' })}</th>
              <th>{formatMessage({ id: 'table.accumulated' })}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.period}>
                <td>{row.period}</td>
                <td className='num'>{formatCurrency(row.initialCapital, locale)}</td>
                <td className='num'>{formatCurrency(row.periodProfit, locale)}</td>
                <td className='num'>{formatCurrency(row.accumulatedCapital, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Box>
  );
}
