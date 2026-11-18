export function validateSearch({ latitude, longitude, startDate, endDate }) {
  const lat = Number(latitude);
  const lon = Number(longitude);
  if (latitude === undefined || latitude === '' || !Number.isFinite(lat) || lat < -90 || lat > 90) {
    return 'Введите корректную широту от -90 до 90.';
  }
  if (longitude === undefined || longitude === '' || !Number.isFinite(lon) || lon < -180 || lon > 180) {
    return 'Введите корректную долготу от -180 до 180.';
  }
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(startDate || '') || !datePattern.test(endDate || '')) {
    return 'Выберите корректные даты.';
  }
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) ||
      start.toISOString().slice(0, 10) !== startDate ||
      end.toISOString().slice(0, 10) !== endDate) return 'Одна из дат некорректна.';
  if (start > end) return 'Дата начала не может быть позже даты окончания.';
  if (end > new Date()) return 'Выберите даты не позднее сегодняшнего дня.';
  const days = (end - start) / 86400000;
  if (days > 365) return 'Пожалуйста, выберите период не более одного года.';
  return null;
}
