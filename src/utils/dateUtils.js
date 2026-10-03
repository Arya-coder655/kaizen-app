// Kaizen Date & Scheduling Utility Helpers

export function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

export function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateFull(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export function getDaysDifference(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T00:00:00');
  const diffTime = end.getTime() - start.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function getRelativeDateLabel(dateStr) {
  if (!dateStr) return '';
  const today = getTodayStr();
  const diff = getDaysDifference(today, dateStr);

  if (diff < -1) return `Overdue by ${Math.abs(diff)} days`;
  if (diff === -1) return 'Yesterday (Overdue)';
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff > 1 && diff <= 7) return `In ${diff} days`;
  return formatDateDisplay(dateStr);
}

export function getDateRangeArray(startDateStr, endDateStr) {
  const dates = [];
  if (!startDateStr || !endDateStr) return dates;
  let current = startDateStr;
  let safety = 0;
  while (current <= endDateStr && safety < 120) {
    dates.push(current);
    current = addDays(current, 1);
    safety++;
  }
  return dates;
}

export function isDateInRange(dateStr, fromDateStr, toDateStr) {
  if (!dateStr) return false;
  if (fromDateStr && dateStr < fromDateStr) return false;
  if (toDateStr && dateStr > toDateStr) return false;
  return true;
}

// Check if a task's duration [task.startDate, task.dueDate] overlaps with [fromDate, toDate]
export function isTaskInRange(task, fromDateStr, toDateStr) {
  const start = task.startDate || task.dueDate || getTodayStr();
  const due = task.dueDate || task.startDate || getTodayStr();

  // If no bounds specified, it matches
  if (!fromDateStr && !toDateStr) return true;

  // If only fromDate
  if (fromDateStr && !toDateStr) {
    return due >= fromDateStr;
  }

  // If only toDate
  if (!fromDateStr && toDateStr) {
    return start <= toDateStr;
  }

  // Overlap condition: start <= toDate AND due >= fromDate
  return start <= toDateStr && due >= fromDateStr;
}

// Check if a schedule slot is active within [fromDate, toDate]
export function isScheduleInRange(schedule, fromDateStr, toDateStr) {
  const start = schedule.startDate || schedule.date || getTodayStr();
  const end = schedule.endDate || schedule.date || schedule.startDate || getTodayStr();

  if (!fromDateStr && !toDateStr) return true;
  if (fromDateStr && !toDateStr) return end >= fromDateStr;
  if (!fromDateStr && toDateStr) return start <= toDateStr;

  return start <= toDateStr && end >= fromDateStr;
}
