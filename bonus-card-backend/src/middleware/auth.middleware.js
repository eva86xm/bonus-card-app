const sessionsRepository = require('../storage/sessions.repository');
const usersRepository = require('../storage/users.repository');

function requireAuth(req, res, next) {
  const authHeader = req.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');

  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  const session = sessionsRepository.findSession(token);

  if (!session) {
    return res.status(401).json({ error: 'Сессия недействительна' });
  }

  const user = usersRepository.findById(session.userId);

  if (!user) {
    sessionsRepository.deleteSession(token);
    return res.status(401).json({ error: 'Пользователь не найден' });
  }

  req.user = user;
  req.session = session;
  next();
}

function requireAdmin(req, res, next) {
  const token = req.get('x-admin-token');

  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Нет доступа к админским методам' });
  }

  next();
}

module.exports = {
  requireAuth,
  requireAdmin
};
