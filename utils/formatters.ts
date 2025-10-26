export const formatDate = (dateString: string): string => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC' // Assuming dates are in UTC to avoid timezone issues
    }).format(new Date(dateString));
  } catch (e) {
    console.error("Invalid date string:", dateString);
    return "Invalid Date";
  }
};
