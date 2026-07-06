/** Public API for the auth module. */
export { default as DentalAuthGate } from './components/DentalAuthGate';
export { default as DentalLoginPage } from './components/DentalLoginPage';
export { useAuth, useAuthBootstrap } from './hooks/useAuth';
export * as authService from './services/authApi';
export { loginSchema } from './schemas/login.schema';
export type { LoginFormValues } from './schemas/login.schema';
