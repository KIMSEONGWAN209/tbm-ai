import { createHash } from 'crypto';

export const COOKIE = 'tbm_admin_session';

export function validLogin(id, pw) {
  return id === (process.env.ADMIN_ID || 'admin') && pw === (process.env.ADMIN_PASSWORD || '1234');
}

export function token() {
  return createHash('sha256')
    .update(`${process.env.ADMIN_ID || 'admin'}::${process.env.ADMIN_PASSWORD || '1234'}::${process.env.ADMIN_SESSION_SECRET || 'demo'}`)
    .digest('hex');
}

export function isAdmin(v) {
  return Boolean(v) && v === token();
}
