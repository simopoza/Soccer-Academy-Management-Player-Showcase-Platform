export function getRatingColor(rating) {
  if (rating >= 9) return 'success';
  if (rating >= 8) return 'info';
  if (rating >= 7) return 'default';
  return 'warning';
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
