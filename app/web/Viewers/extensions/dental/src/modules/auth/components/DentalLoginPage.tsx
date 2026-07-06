import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@ohif/ui-next';
import { useAuth } from '../hooks/useAuth';
import { refreshDentalAuthHeaders } from '../services/authApi';
import { loginSchema, type LoginFormValues } from '../schemas/login.schema';

type DentalAppConfig = AppTypes.Config & { dentalPracticeName?: string };

function DentalLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, authApi, login, userAuthenticationService } = useAuth();

  const practiceName =
    (typeof window !== 'undefined' && (window.config as DentalAppConfig)?.dentalPracticeName) ||
    'Dental Practice';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'admin@example.com', password: '' },
  });

  useEffect(() => {
    if (user) {
      const redirect = searchParams.get('redirect');
      navigate(redirect ? decodeURIComponent(redirect) : '/', { replace: true });
    }
  }, [user, navigate, searchParams]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const { user: loggedInUser } = await login(values.email, values.password);
      authApi.setUser(loggedInUser);
      authApi.set({ enabled: true, user: loggedInUser });
      refreshDentalAuthHeaders(userAuthenticationService);

      const redirect = searchParams.get('redirect');
      navigate(redirect ? decodeURIComponent(redirect) : '/', { replace: true });
    } catch (err) {
      setError('root', {
        message: err instanceof Error ? err.message : 'Login failed',
      });
    }
  };

  return (
    <div
      className="bg-background flex min-h-screen items-center justify-center p-4"
      data-cy="dental-login-page"
    >
      <div className="border-border bg-card w-full max-w-md rounded-lg border p-8 shadow-lg">
        <h1 className="text-primary mb-1 text-2xl font-semibold">{practiceName}</h1>
        <p className="text-muted-foreground mb-6 text-sm">Sign in to access the dental viewer</p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div>
            <label
              htmlFor="dental-email"
              className="text-foreground mb-1 block text-sm font-medium"
            >
              Email
            </label>
            <input
              id="dental-email"
              type="email"
              autoComplete="username"
              className="bg-input border-input text-foreground h-10 w-full rounded border px-3 text-sm"
              {...register('email')}
              data-cy="dental-login-email"
            />
            {errors.email && (
              <p className="text-destructive mt-1 text-xs">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="dental-password"
              className="text-foreground mb-1 block text-sm font-medium"
            >
              Password
            </label>
            <input
              id="dental-password"
              type="password"
              autoComplete="current-password"
              className="bg-input border-input text-foreground h-10 w-full rounded border px-3 text-sm"
              {...register('password')}
              data-cy="dental-login-password"
            />
            {errors.password && (
              <p className="text-destructive mt-1 text-xs">{errors.password.message}</p>
            )}
          </div>

          {errors.root && (
            <p
              className="text-destructive text-sm"
              data-cy="dental-login-error"
            >
              {errors.root.message}
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            data-cy="dental-login-submit"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="text-muted-foreground mt-4 text-center text-xs">
          Demo: admin@example.com / change-me-strongly
        </p>
      </div>
    </div>
  );
}

export default DentalLoginPage;
