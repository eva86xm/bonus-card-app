function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Маршрут не найден'
  });
}

function errorHandler(error, req, res, next) {
  console.error(error);

  const status = Number.isInteger(error.status) && error.status >= 400 && error.status <= 599
    ? error.status
    : 500;

  res.status(status).json({
    error: status < 500 && error.message
      ? error.message
      : 'Внутренняя ошибка сервера'
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
