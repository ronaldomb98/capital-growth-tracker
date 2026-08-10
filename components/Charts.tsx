'use client';

import { BarChart, Box, Grid, LineChart, Text } from '@godaddy/antares';
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

class CurrencyChartValue extends Number {
  constructor(
    amount: number,
    private readonly formattedValue: string
  ) {
    super(amount);
  }

  toString(): string {
    return this.formattedValue;
  }
}

export function Charts({
  rows
}: {
  rows: ProjectionRow[];
}) {
  const { formatMessage } = useIntl();
  const sampledRows = sampleForChart(rows);
  const dateAxis = formatMessage({ id: 'charts.dateAxis' });
  const amountAxis = formatMessage({ id: 'charts.amountAxis' });
  const amountAxisWithCurrency = `${amountAxis} (USD)`;
  const accumulatedLabel = formatMessage({ id: 'charts.accumulated' });
  const summaryLabel = formatMessage({ id: 'charts.summary' });
  const initialCapital = rows[0]?.initialCapital ?? 0;
  const accumulatedCapital = rows.at(-1)?.accumulatedCapital ?? 0;
  const interest = accumulatedCapital - initialCapital;
  const summaryData = [{
    category: formatMessage({ id: 'charts.initialCapital' }),
    amount: initialCapital
  }, {
    category: formatMessage({ id: 'charts.interest' }),
    amount: interest
  }, {
    category: formatMessage({ id: 'charts.total' }),
    amount: accumulatedCapital
  }];
  const accumulatedDomain = getPositiveDomain(
    sampledRows.map((row) => row.accumulatedCapital)
  );
  const summaryDomain = getPositiveDomain(
    summaryData.map((item) => item.amount)
  );
  const formatAmount = (value: number | string | Date) => (
    typeof value === 'number' && value !== 0
      ? formatCurrency(value)
      : ''
  );
  const formatNumber = (value: number | string | Date) => (
    typeof value === 'number' && value !== 0
      ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)
      : ''
  );

  return (
    <Grid
      columns='minmax(0, 1.1fr) minmax(0, 0.9fr)'
      gap='md'
      className='cgt-chart-grid'
    >
      <Box elevation='card' padding='md' rounding='md'>
        <Text as='h2'>{accumulatedLabel}</Text>
        <div className='cgt-chart'>
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
            xTitle={dateAxis}
            yTitle={amountAxis}
            yDomain={accumulatedDomain}
            yZero={false}
            yNumTicks={5}
            yTickFormat={formatNumber}
            tooltipValueFormatter={(datum) => formatCurrency(datum.y as number)}
            height={380}
            aria-label={accumulatedLabel}
          />
        </div>
      </Box>
      <Box elevation='card' padding='md' rounding='md'>
        <Text as='h2'>{summaryLabel}</Text>
        <div className='cgt-chart'>
          <BarChart
            series={[{
              id: 'capital-summary',
              name: summaryLabel,
              data: summaryData
            }]}
            orientation='horizontal'
            /*
             * BarChart v0.5.0 stringifies its X accessor for the tooltip but
             * does not expose a tooltip formatter. This remains number-like
             * for visx's linear scale while formatting its tooltip as USD.
             */
            xAccessor={(datum) => (
              new CurrencyChartValue(
                datum.amount,
                formatCurrency(datum.amount)
              ) as unknown as number
            )}
            yAccessor={(datum) => datum.category}
            xAxisTitle={amountAxisWithCurrency}
            xDomain={summaryDomain}
            xNumTicks={5}
            xTickFormat={formatAmount}
            height={380}
            aria-label={summaryLabel}
          />
        </div>
      </Box>
    </Grid>
  );
}
