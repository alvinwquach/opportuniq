// Calendar utility functions

/**
 * Generate consistent colors for groups based on name
 */
export function getEventColor(groupName: string): string {
  const colors = [
    "#00D4FF", // cyan
    "#10B981", // green
    "#8B5CF6", // purple
    "#F59E0B", // amber
    "#EF4444", // red
    "#EC4899", // pink
    "#6366F1", // indigo
  ];

  let hash = 0;
  for (let i = 0; i < groupName.length; i++) {
    hash = groupName.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

/**
 * Generate recurring dates within a range based on frequency
 */
export function generateRecurringDates(
  baseDate: Date,
  frequency: string,
  rangeStart: Date,
  rangeEnd: Date
): Date[] {
  const dates: Date[] = [];
  const current = new Date(baseDate);

  // Move to the first occurrence within range
  while (current < rangeStart) {
    advanceByFrequency(current, frequency);
  }

  // Generate dates within range
  while (current <= rangeEnd) {
    dates.push(new Date(current));
    advanceByFrequency(current, frequency);
  }

  return dates;
}

/**
 * Advance date by frequency interval
 */
function advanceByFrequency(date: Date, frequency: string): void {
  switch (frequency) {
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "bi_weekly":
      date.setDate(date.getDate() + 14);
      break;
    case "semi_monthly":
      // Advance by ~15 days (1st and 15th pattern)
      if (date.getDate() < 15) {
        date.setDate(15);
      } else {
        date.setMonth(date.getMonth() + 1);
        date.setDate(1);
      }
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "quarterly":
      date.setMonth(date.getMonth() + 3);
      break;
    case "annual":
      date.setFullYear(date.getFullYear() + 1);
      break;
    case "one_time":
    default:
      // For one-time, set to far future to exit loop
      date.setFullYear(date.getFullYear() + 100);
      break;
  }
}

/**
 * Format frequency for display
 */
export function formatFrequency(frequency: string): string {
  return frequency.replace("_", "-");
}

/**
 * Get responsive calendar config based on screen width
 */
export function getResponsiveCalendarConfig(width: number) {
  const screenConfigs = [
    {
      minWidth: 1280,
      view: "dayGridMonth",
      toolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      },
    },
    {
      minWidth: 1024,
      view: "dayGridMonth",
      toolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      },
    },
    {
      minWidth: 640,
      view: "timeGridWeek",
      toolbar: {
        left: "prev,next today",
        center: "title",
        right: "timeGridWeek,timeGridDay",
      },
    },
    {
      minWidth: 0,
      view: "timeGridDay",
      toolbar: {
        left: "prev,next today",
        center: "title",
        right: "timeGridDay",
      },
    },
  ];

  return screenConfigs.find((config) => width >= config.minWidth) || screenConfigs[3];
}
