export function todayKST() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const y = parts.find((v) => v.type === 'year')?.value;
  const m = parts.find((v) => v.type === 'month')?.value;
  const d = parts.find((v) => v.type === 'day')?.value;
  return `${y}-${m}-${d}`;
}
