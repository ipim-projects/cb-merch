export interface User {
  code: string,
  email: string,
  phone: string,
  name: string,
  telegramNickName: string,
  telegramId: string,
  role: 'guest' | 'employee' | 'operator' | 'administrator',
  isBlocked: boolean,
}
