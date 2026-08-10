'use client';

import { Box, Grid, NumberField, Select, SelectItem } from '@godaddy/antares';
import { useIntl } from 'react-intl';
import type { Frequency } from '../lib/types';

export interface ControlPanelProps {
  principal: number;
  ratePercent: number;
  periods: number;
  frequency: Frequency;
  onPrincipalChange: (value: number) => void;
  onRateChange: (value: number) => void;
  onPeriodsChange: (value: number) => void;
  onFrequencyChange: (value: Frequency) => void;
}

function safeNumber(value: number): number {
  return Number.isNaN(value) ? 0 : value;
}

export function ControlPanel({
  principal,
  ratePercent,
  periods,
  frequency,
  onPrincipalChange,
  onRateChange,
  onPeriodsChange,
  onFrequencyChange
}: ControlPanelProps) {
  const { formatMessage } = useIntl();

  return (
    <Box elevation='card' padding='md' rounding='md' className='cgt-panel'>
      <Grid columns='repeat(auto-fit, minmax(190px, 1fr))' gap='md'>
        <NumberField
          label={formatMessage({ id: 'controls.principal' })}
          value={principal}
          onChange={(value) => onPrincipalChange(safeNumber(value))}
          minValue={0}
          formatOptions={{ style: 'currency', currency: 'USD' }}
        />
        <NumberField
          label={formatMessage({ id: 'controls.rate' })}
          value={ratePercent}
          onChange={(value) => onRateChange(safeNumber(value))}
          minValue={0}
          step={0.1}
          formatOptions={{ style: 'decimal', maximumFractionDigits: 2 }}
        />
        <NumberField
          label={formatMessage({ id: 'controls.duration' })}
          value={periods}
          onChange={(value) => onPeriodsChange(safeNumber(value))}
          minValue={1}
          maxValue={1000}
          step={1}
          formatOptions={{ maximumFractionDigits: 0 }}
        />
        <Select
          label={formatMessage({ id: 'controls.frequency' })}
          selectedKey={frequency}
          onSelectionChange={(key) => onFrequencyChange(key as Frequency)}
        >
          <SelectItem id='days'>{formatMessage({ id: 'freq.days' })}</SelectItem>
          <SelectItem id='weeks'>{formatMessage({ id: 'freq.weeks' })}</SelectItem>
          <SelectItem id='months'>{formatMessage({ id: 'freq.months' })}</SelectItem>
          <SelectItem id='years'>{formatMessage({ id: 'freq.years' })}</SelectItem>
        </Select>
      </Grid>
    </Box>
  );
}
