const pad = (value: number): string => String(value).padStart(2, '0')

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}
