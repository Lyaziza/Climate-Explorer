import { fetchClimateData } from '../services/nasaPowerService.js';
import { validateSearch } from '../middleware/validateSearch.js';

const popularLocations = [
  { name: 'Astana, Kazakhstan', lat: 51.1694, lon: 71.4491 },
  { name: 'Almaty, Kazakhstan', lat: 43.2389, lon: 76.8897 },
  { name: 'London, United Kingdom', lat: 51.5072, lon: -0.1276 },
  { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'New York, USA', lat: 40.7128, lon: -74.0060 }
];

export function home(req, res) {
  res.render('index', { title: 'Explore climate data', error: null, values: {} });
}

export function search(req, res, next) {
  const error = validateSearch(req.body);
  if (error) return res.status(400).render('index', { title: 'Explore climate data', error, values: req.body });
  const { latitude, longitude, startDate, endDate } = req.body;
  res.redirect(`/results?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&start=${startDate}&end=${endDate}`);
}

export async function results(req, res, next) {
  try {
    const { lat, lon, start, end } = req.query;
    const error = validateSearch({ latitude: lat, longitude: lon, startDate: start, endDate: end });
    if (error) return res.status(400).render('index', { title: 'Explore climate data', error, values: req.query });
    const climate = await fetchClimateData({ latitude: Number(lat), longitude: Number(lon), startDate: start, endDate: end });
    res.render('results', { title: 'Climate results', climate, popularLocations });
  } catch (err) {
    next(err);
  }
}

export function popular(req, res) {
  res.render('popular', { title: 'Popular locations', locations: popularLocations });
}
