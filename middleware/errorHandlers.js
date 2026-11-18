export function notFound(req, res, next) {
  res.status(404).render('error', {
    title: 'Page not found',
    status: 404,
    message: 'The page you are looking for does not exist.'
  });
}

export function errorHandler(err, req, res, next) {
  console.error('Application error:', err.message);
  const status = err.response?.status || err.status || 500;
  let message = 'Something went wrong while retrieving climate data. Please try again.';
  if (err.code === 'ECONNABORTED') message = 'The NASA POWER request timed out. Please try again.';
  else if (err.response?.status === 429) message = 'The data service is busy. Please wait and try again.';
  else if (err.response?.status >= 400) message = 'The data service could not process this request. Check your dates and coordinates.';
  else if (err.status === 404) message = err.message;
  res.status(status >= 400 && status < 600 ? status : 500).render('error', {
    title: 'Something went wrong', status, message
  });
}
