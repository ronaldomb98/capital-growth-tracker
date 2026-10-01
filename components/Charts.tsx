'use client';

import { Box, DonutChart, Grid, LineChart, Text } from '@godaddy/antares';
import { useIntl } from 'react-intl';
import { sampleForChart } from '../lib/chart';
import type { ProjectionRow } from '../lib/calc';
import { formatCurrency } from '../lib/format';

function getPositiveDomain(values: number[]): [number, number] {
  const positiveValues = values.filter((value) => value > 0);

  if (positiveValues.length === 0) {
    return [0.01, 1];
  }

  const minimum = Math.min(...positiveValues);
  const maximum = Math.max(...positiveValues);
  const padding = Math.max(maximum - minimum, maximum * 0.1) * 0.1;

  return [
    Math.max(Number.MIN_VALUE, minimum - padding),
    maximum + padding
  ];
}

export function Charts({
  rows,
  principal
}: {
  rows: ProjectionRow[];
  principal: number;
}) {
  const { formatMessage, formatDate } = useIntl();
  const sampledRows = sampleForChart(rows);
  const dateAxis = formatMessage({ id: 'charts.dateAxis' });
  const amountAxis = formatMessage({ id: 'charts.amountAxis' });
  const accumulatedLabel = formatMessage({ id: 'charts.accumulated' });
  const summaryLabel = formatMessage({ id: 'charts.summary' });
  const initialCapital = principal;
  const accumulatedCapital = rows.at(-1)?.accumulatedCapital ?? 0;
  const interest = accumulatedCapital - initialCapital;
  const summaryData = [{
    id: 'initial-capital',
    name: formatMessage({ id: 'charts.initialCapital' }),
    value: initialCapital
  }, {
    id: 'profit',
    name: formatMessage({ id: 'charts.interest' }),
    value: interest
  }];
  const accumulatedDomain = getPositiveDomain(
    sampledRows.map((row) => row.accumulatedCapital)
  );
  const formatNumber = (value: number | string | Date) => (
    typeof value === 'number' && value !== 0
      ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)
      : ''
  );

  return (
    <Grid
      columns='repeat(2, minmax(0, 1fr))'
      gap='md'
      className='cgt-chart-grid'
    >
      <Box elevation='card' padding='md' rounding='md'>
        <Text as='h2'>{accumulatedLabel}</Text>
        <div className='cgt-chart cgt-chart-body'>
          <LineChart
            series={[{
              id: 'accumulated',
              name: accumulatedLabel,
              data: sampledRows.map((row) => ({
                x: new Date(`${row.date}T00:00:00Z`),
                y: row.accumulatedCapital
              }))
            }]}
            xType='time'
            xTickValues={sampleForChart(rows, 5).map((row) => new Date(`${row.date}T00:00:00Z`))}
            xTickFormat={(value) => formatDate(value, { timeZone: 'UTC', month: 'short', day: 'numeric', year: '2-digit' })}
            xTitle={dateAxis}
            yTitle={amountAxis}
            yDomain={accumulatedDomain}
            yZero={false}
            yNumTicks={5}
            yTickFormat={formatNumber}
            tooltipValueFormatter={(datum) => formatCurrency(datum.y as number)}
            aria-label={accumulatedLabel}
          />
        </div>
      </Box>
      <Box elevation='card' padding='md' rounding='md'>
        <Text as='h2'>{summaryLabel}</Text>
        <div className='cgt-chart-body cgt-donut-body'>
          <DonutChart
            className='cgt-donut'
            data={summaryData}
            label={formatCurrency(accumulatedCapital)}
            subLabel={formatMessage({ id: 'charts.total' })}
            legend='right'
            legendLabel={summaryLabel}
            formatValue={formatCurrency}
            aria-label={summaryLabel}
          />
        </div>
      </Box>
    </Grid>
  );
}
