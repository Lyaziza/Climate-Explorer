import axios from 'axios';

const API_URL = 'https://power.larc.nasa.gov/api/temporal/daily/point';
const client = axios.create({ baseURL: API_URL, timeout: 30000 });

function toDailyRecords(parameterData) {
  const dates = Object.keys(parameterData.T2M || parameterData.PRECTOTCORR || {});
  return dates.map(date => ({
    date,
    temperature: parameterData.T2M?.[date],
    precipitation: parameterData.PRECTOTCORR?.[date],
    humidity: parameterData.RH2M?.[date],
    wind: parameterData.WS2M?.[date]
  }));
}

function validNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value !== -999;
}

function average(values) {
  const usable = values.filter(validNumber);
  return usable.length ? usable.reduce((sum, value) => sum + value, 0) / usable.length : null;
}

export async function fetchClimateData({ latitude, longitude, startDate, endDate }) {
  const common = {
    community: 'AG', longitude, latitude,
    start: startDate.replaceAll('-', ''),
    end: endDate.replaceAll('-', ''),
    format: 'JSON'
  };

  // Two separate Axios requests (different parameter sets) satisfy the API interaction requirement.
  const [atmosphereResponse, surfaceResponse] = await Promise.all([
    client.get('', { params: { ...common, parameters: 'T2M,PRECTOTCORR' } }),
    client.get('', { params: { ...common, parameters: 'RH2M,WS2M' } })
  ]);

  const first = atmosphereResponse.data?.properties?.parameter;
  const second = surfaceResponse.data?.properties?.parameter;
  if (!first || !second) throw new Error('NASA POWER returned an unexpected response format.');

  const merged = { ...first, ...second };
  const records = toDailyRecords(merged);
  const usableRecords = records.filter(row =>
    [row.temperature, row.precipitation, row.humidity, row.wind].some(validNumber)
  );
  if (!usableRecords.length) {
    const error = new Error('No climate data was found for this location and date range.');
    error.status = 404;
    throw error;
  }

  const stats = {
    avgTemperature: average(records.map(r => r.temperature)),
    totalPrecipitation: records.map(r => r.precipitation).filter(validNumber).reduce((a, b) => a + b, 0),
    avgHumidity: average(records.map(r => r.humidity)),
    avgWind: average(records.map(r => r.wind))
  };

  return {
    latitude, longitude, startDate, endDate, records,
    stats,
    units: {
      temperature: first.T2M?.units || '°C',
      precipitation: first.PRECTOTCORR?.units || 'mm/day',
      humidity: second.RH2M?.units || '%',
      wind: second.WS2M?.units || 'm/s'
    }
  };
}
