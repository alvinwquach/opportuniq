// Frequency multipliers to convert to monthly
export const FREQUENCY_TO_MONTHLY: Record<string, number> = {
  weekly: 4.33,
  bi_weekly: 2.17,
  semi_monthly: 2,
  monthly: 1,
  quarterly: 1 / 3,
  annual: 1 / 12,
  one_time: 0,
};

// Convert to hourly (assuming 40hr work week, 52 weeks)
export const ANNUAL_HOURS = 2080;


