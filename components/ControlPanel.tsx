'use client';

import {
  Box,
  Grid,
  NumberField,
  SegmentedController,
  SegmentedControllerItem,
  Text
} from '@godaddy/antares';
import { useIntl } from 'react-intl';
import type { Granularity } from '../lib/types';

export interface ControlPanelProps {
  principal: number;
  dailyRatePercent: number;
  tradingDays: number;
  granularity: Granularity;
  onPrincipalChange: (value: number) => void;
  onDailyRateChange: (value: number) => void;
  onTradingDaysChange: (value: number) => void;
  onGranularityChange: (value: Granularity) => void;
}

function safeNumber(value: number): number {
  return Number.isNaN(value) ? 0 : value;
}

export function ControlPanel({
  principal,
  dailyRatePercent,
  tradingDays,
  granularity,
  onPrincipalChange,
  onDailyRateChange,
  onTradingDaysChange,
  onGranularityChange
}: ControlPanelProps) {
  const { formatMessage } = useIntl();

  return (
    <Box elevation='card' padding='md' rounding='md' className='cgt-panel'>
      <Grid columns='repeat(auto-fit, minmax(190px, 1fr))' gap='md'>
        <NumberField
          label={`${formatMessage({ id: 'controls.principal' })} (USD)`}
          value={principal}
          onChange={(value) => onPrincipalChange(safeNumber(value))}
          minValue={1}
          step={1}
          formatOptions={{ maximumFractionDigits: 0 }}
        />
        <NumberField
          label={formatMessage({ id: 'controls.rate' })}
          value={dailyRatePercent}
          onChange={(value) => onDailyRateChange(safeNumber(value))}
          minValue={0}
          maxValue={99}
          step={0.01}
          formatOptions={{ style: 'decimal', maximumFractionDigits: 2 }}
        />
        <NumberField
          label={formatMessage({ id: 'controls.tradingDays' })}
          value={tradingDays}
          onChange={(value) => onTradingDaysChange(safeNumber(value))}
          minValue={1}
          maxValue={4000}
          step={1}
          formatOptions={{ maximumFractionDigits: 0 }}
        />
        <div className='cgt-granularity'>
          <Text as='p'>{formatMessage({ id: 'controls.granularity' })}</Text>
          <SegmentedController
            value={granularity}
            onSelectionChange={(value) => onGranularityChange(value as Granularity)}
            aria-label={formatMessage({ id: 'controls.granularity' })}
          >
            <SegmentedControllerItem value='years'>
              {formatMessage({ id: 'freq.years' })}
            </SegmentedControllerItem>
            <SegmentedControllerItem value='months'>
              {formatMessage({ id: 'freq.months' })}
            </SegmentedControllerItem>
            <SegmentedControllerItem value='weeks'>
              {formatMessage({ id: 'freq.weeks' })}
            </SegmentedControllerItem>
            <SegmentedControllerItem value='days'>
              {formatMessage({ id: 'freq.days' })}
            </SegmentedControllerItem>
          </SegmentedController>
        </div>
      </Grid>
    </Box>
  );
}
