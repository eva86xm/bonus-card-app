function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Маршрут не найден'
  });
}

function errorHandler(error, req, res, next) {
  console.error(error);

  res.status(error.status || 500).json({
    error: error.message || 'Внутренняя ошибка сервера'
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
