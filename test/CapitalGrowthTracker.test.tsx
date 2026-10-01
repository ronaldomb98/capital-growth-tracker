import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CapitalGrowthTracker from '../components/CapitalGrowthTracker';
import { renderWithIntl } from './testUtils';

// Charts require layout measurements; exercise the real composed fields and calendar here.
vi.mock('../components/Charts', () => ({ Charts: () => <div data-testid='charts' /> }));

HTMLElement.prototype.scrollIntoView = vi.fn();
Element.prototype.getAnimations = () => [];
vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });

afterEach(() => {
  vi.restoreAllMocks();
  act(() => { window.dispatchEvent(new Event('languagechange')); });
  cleanup();
  window.localStorage.clear();
});

describe('trade planner form', () => {
  it('renders labelled Antares fields and updates the calculated end date', async () => {
    const user = userEvent.setup();
    renderWithIntl(<CapitalGrowthTracker />);
    expect(await screen.findByRole('textbox', { name: 'Trades per week' })).toBeTruthy();
    expect(screen.getByRole('textbox', { name: /Initial investment/ })).toBeTruthy();
    expect(screen.getByRole('textbox', { name: /Profit per trade/ })).toBeTruthy();
    await user.click(screen.getByRole('radio', { name: 'Number of trades' }));
    const count = screen.getByRole('textbox', { name: 'Number of trades' });
    await user.clear(count);
    await user.type(count, '10');
    await user.tab();
    expect(within(screen.getByRole('status')).getByText('10 planned trades')).toBeTruthy();
    const originalRange = within(screen.getByRole('status')).getByText(/Calculated range:/).textContent;
    const weekly = screen.getByRole('textbox', { name: 'Trades per week' });
    await user.clear(weekly);
    await user.type(weekly, '1');
    await user.tab();
    expect(within(screen.getByRole('status')).getByText('10 planned trades')).toBeTruthy();
    expect(within(screen.getByRole('status')).getByText(/Calculated range:/).textContent).not.toBe(originalRange);
    await user.click(screen.getByRole('radio', { name: 'Date range' }));
    expect(screen.queryByRole('textbox', { name: 'Number of trades' })).toBeNull();
    expect(within(screen.getByRole('status')).getByText(/Selected range:/)).toBeTruthy();
  });

  it('opens the composed calendar and preserves state when switching language', async () => {
    const user = userEvent.setup();
    renderWithIntl(<CapitalGrowthTracker />, 'es');
    await screen.findByRole('textbox', { name: 'Trades por semana' });
    const rangeButton = screen.getByRole('button', { name: /Rango de fechas/ });
    await user.click(rangeButton);
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getAllByRole('grid')).toHaveLength(1);
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('radio', { name: 'Cantidad de trades' }));
    expect(screen.getByRole('textbox', { name: 'Cantidad de trades' })).toBeTruthy();
    await user.click(screen.getByRole('radio', { name: 'EN' }));
    expect(screen.getByRole('textbox', { name: 'Number of trades' })).toBeTruthy();
    expect(screen.getByRole('textbox', { name: 'Trades per week' }).getAttribute('value')).toBe('3');
  });

  it('preserves entered decimals and uses the native step grid for buttons and arrow keys', async () => {
    const user = userEvent.setup();
    renderWithIntl(<CapitalGrowthTracker />);
    const rate = await screen.findByRole('textbox', { name: /Profit per trade/ });
    expect(rate.getAttribute('value')).toBe('1.25');
    await user.click(screen.getByRole('button', { name: /(?:Increase|Aumentar) Profit per trade/ }));
    expect(rate.getAttribute('value')).toBe('1.3');
    await user.click(screen.getByRole('button', { name: /Decrease Profit per trade/ }));
    await user.click(screen.getByRole('button', { name: /Decrease Profit per trade/ }));
    expect(rate.getAttribute('value')).toBe('1.2');
    await user.clear(rate);
    await user.type(rate, '2.27');
    await user.keyboard('{ArrowUp}');
    expect(rate.getAttribute('value')).toBe('2.3');
    await user.keyboard('{ArrowDown}');
    expect(rate.getAttribute('value')).toBe('2.25');
  });

  it('uses native 100 USD and one-trade steps in both directions', async () => {
    const user = userEvent.setup();
    renderWithIntl(<CapitalGrowthTracker />);
    const principal = await screen.findByRole('textbox', { name: /Initial investment/ });
    const weekly = screen.getByRole('textbox', { name: 'Trades per week' });
    await user.click(screen.getByRole('button', { name: /Increase Initial investment/ }));
    expect(principal.getAttribute('value')).toBe('10,100');
    await user.click(screen.getByRole('button', { name: /Decrease Initial investment/ }));
    expect(principal.getAttribute('value')).toBe('10,000');
    await user.click(screen.getByRole('button', { name: /Increase Trades per week/ }));
    expect(weekly.getAttribute('value')).toBe('4');
    await user.click(screen.getByRole('button', { name: /Decrease Trades per week/ }));
    expect(weekly.getAttribute('value')).toBe('3');
  });

  it.each([
    { locale: 'en' as const, principalLabel: /Initial investment/, rateLabel: /Profit per trade/, weeklyLabel: 'Trades per week', countLabel: 'Number of trades', increase: 'Increase', principalInput: '1234.56', principalOutput: '1,234.56', incremented: '1,300', rateInput: '2.37' },
    { locale: 'es' as const, principalLabel: /Inversión inicial/, rateLabel: /Ganancia por trade/, weeklyLabel: 'Trades por semana', countLabel: 'Cantidad de trades', increase: 'Aumentar', principalInput: '1234,56', principalOutput: '1234,56', incremented: '1300', rateInput: '2,37' }
  ])('preserves decimals and requests the full iPhone keyboard in $locale', async (settings) => {
    const user = userEvent.setup();
    vi.spyOn(window.navigator, 'platform', 'get').mockReturnValue('iPhone');
    vi.spyOn(window.navigator, 'language', 'get').mockReturnValue(settings.locale === 'es' ? 'es-ES' : 'en-US');
    renderWithIntl(<CapitalGrowthTracker />, settings.locale);
    act(() => { window.dispatchEvent(new Event('languagechange')); });
    const principal = await screen.findByRole('textbox', { name: settings.principalLabel });
    const rate = screen.getByRole('textbox', { name: settings.rateLabel });
    expect(principal.getAttribute('inputmode')).toBe('text');
    expect(rate.getAttribute('inputmode')).toBe('text');
    expect(principal.getAttribute('type')).toBe('text');
    expect(screen.getByRole('textbox', { name: settings.weeklyLabel }).getAttribute('inputmode')).toBe('numeric');
    await user.clear(principal);
    await user.type(principal, settings.principalInput);
    await user.tab();
    expect(principal.getAttribute('value')).toBe(settings.principalOutput);
    expect(principal.getAttribute('aria-invalid')).not.toBe('true');
    await user.click(screen.getByRole('button', { name: new RegExp(`${settings.increase} ${settings.principalLabel.source}`) }));
    expect(principal.getAttribute('value')).toBe(settings.incremented);
    await user.clear(rate);
    await user.paste(settings.rateInput);
    await user.tab();
    expect(rate.getAttribute('value')).toBe(settings.rateInput);
    expect(rate.getAttribute('aria-invalid')).not.toBe('true');
    await user.click(screen.getByRole('radio', { name: settings.countLabel }));
    expect(screen.getByRole('textbox', { name: settings.countLabel }).getAttribute('inputmode')).toBe('numeric');
  });

  it.each([
    { browserLocale: 'es-CO', input: '1,5', initial: '1,25', incremented: '1,55' },
    { browserLocale: 'en-US', input: '1.5', initial: '1.25', incremented: '1.55' }
  ])('uses native browser number formatting ($browserLocale) independently of English labels', async (settings) => {
    const user = userEvent.setup();
    vi.spyOn(window.navigator, 'language', 'get').mockReturnValue(settings.browserLocale);
    renderWithIntl(<CapitalGrowthTracker />);
    act(() => { window.dispatchEvent(new Event('languagechange')); });
    const rate = await screen.findByRole('textbox', { name: /Profit per trade/ });
    expect(rate.getAttribute('value')).toBe(settings.initial);
    await user.clear(rate);
    await user.type(rate, settings.input);
    await user.tab();
    expect(rate.getAttribute('value')).toBe(settings.input);
    await user.click(screen.getByRole('button', { name: /(?:Increase|Aumentar) Profit per trade/ }));
    expect(rate.getAttribute('value')).toBe(settings.incremented);
    await user.click(screen.getByRole('radio', { name: 'ES' }));
    expect(screen.getByRole('textbox', { name: /Ganancia por trade/ }).getAttribute('value')).toBe(settings.incremented);
  });

  it('shows validation instead of a misleading result when a required number is cleared', async () => {
    const user = userEvent.setup();
    renderWithIntl(<CapitalGrowthTracker />);
    await user.clear(await screen.findByRole('textbox', { name: 'Trades per week' }));
    await user.tab();
    expect(screen.getByRole('textbox', { name: 'Trades per week' }).getAttribute('aria-invalid')).toBe('true');
    expect(within(screen.getByRole('status')).getByText(/Enter a whole number/)).toBeTruthy();
    expect(screen.queryByTestId('charts')).toBeNull();
  });
});
