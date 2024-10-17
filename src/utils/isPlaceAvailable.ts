import { IPlaceItem } from "../models/nearbySearch";

export function isPlaceOpenAtTime(
  periods: IPlaceItem["regularOpeningHours"]["periods"],
  inputDay: number,
  inputHour: number,
  inputMinute: number
) {
  // Find the period that matches the input day
  const period = periods.find((p) => p.open.day === inputDay);

  //If no period exists for that day, the place is closed
  if (!period) return false;

  // Convert the input time and period times to minutes for easy comparison
  const inputTimeInMinutes = inputHour * 60 + inputMinute;
  const openTimeInMinutes = period.open.hour * 60 + period.open.minute;
  let closeTimeInMinutes = period.close.hour * 60 + period.close.minute;

  // Check if the closing time is on the next day (open past midnight)
  if (closeTimeInMinutes < openTimeInMinutes) {
    // If the close time is earlier than open time, it's because it closes the next day
    closeTimeInMinutes += 24 * 60; // Add 24 hours worth of minutes to the close time
  }

  // Adjust input time if it's after midnight (for places that open past midnight)
  let adjustedInputTimeInMinutes = inputTimeInMinutes;
  if (inputHour < period.open.hour) {
    // Input time is on the next day, so add 24 hours if needed
    adjustedInputTimeInMinutes += 24 * 60;
  }

  // Check if the input time is between the open and close time
  return (
    adjustedInputTimeInMinutes >= openTimeInMinutes &&
    adjustedInputTimeInMinutes <= closeTimeInMinutes
  );
}
