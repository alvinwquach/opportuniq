/**
 * EXPENSE HELPERS
 *
 * Utility functions for expense calculations.
 */

/**
 * Calculate the next due date based on frequency
 *
 * PSEUDOCODE:
 * 1. If one_time, return null (no next date)
 * 2. Clone current date to avoid mutation
 * 3. Add appropriate interval based on frequency
 * 4. Return the calculated next date
 *
 * Note: frequency is `string` to match the hook's return type.
 */
export function calculateNextDueDate(
  currentDate: Date,
  frequency: string
): Date | null {
  if (frequency === "one_time") return null;

  const next = new Date(currentDate);

  switch (frequency) {
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "bi_weekly":
      next.setDate(next.getDate() + 14);
      break;
    case "semi_monthly":
      // If before 15th, move to 15th; otherwise move to 1st of next month
      if (next.getDate() < 15) {
        next.setDate(15);
      } else {
        next.setMonth(next.getMonth() + 1);
        next.setDate(1);
      }
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "quarterly":
      next.setMonth(next.getMonth() + 3);
      break;
    case "annual":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
}
