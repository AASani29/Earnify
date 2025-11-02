export const config = {
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'access-secret-key',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '5m',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
}

