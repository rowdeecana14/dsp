import React, { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button, Input, Label } from '@ohif/ui-next';
import { zod4Resolver } from '../../../shared/utils/zod4Resolver';
import { useAuth } from '../hooks/useAuth';
import { refreshDentalAuthHeaders } from '../services/authApi';
import { loginSchema, type LoginFormValues } from '../schemas/login.schema';

type DentalAppConfig = AppTypes.Config & { dentalPracticeName?: string };

const DENTAL_LOGO_PATH = 'assets/dental-logo.png';

function DentalLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, authApi, login, userAuthenticationService } = useAuth();

  const practiceName =
    (typeof window !== 'undefined' && (window.config as DentalAppConfig)?.dentalPracticeName) ||
    'Dental Practice';

  const logoSrc = useMemo(() => {
    const publicUrl =
      typeof window !== 'undefined' && window.PUBLIC_URL ? window.PUBLIC_URL : '/';
    const base = publicUrl.endsWith('/') ? publicUrl : `${publicUrl}/`;
    return `${base}${DENTAL_LOGO_PATH}`;
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zod4Resolver(loginSchema),
    defaultValues: { email: '', password: '' },
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
      className="bg-background relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10"
      data-cy="dental-login-page"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_55%)]"
        aria-hidden
      />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="bg-card/40 border-border/50 mb-5 flex h-28 w-28 items-center justify-center rounded-2xl border p-3 shadow-sm backdrop-blur-sm">
            <img
              src={logoSrc}
              alt=""
              className="h-full w-full object-contain"
              data-cy="dental-login-logo"
            />
          </div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">{practiceName}</h1>
          <p className="text-muted-foreground mt-1.5 max-w-sm text-sm leading-relaxed">
            Sign in to access the dental imaging viewer
          </p>
        </div>

        <div className="border-border/60 bg-card/95 w-full rounded-xl border p-6 shadow-lg backdrop-blur-sm sm:p-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="space-y-1.5">
              <Label
                htmlFor="dental-email"
                className="text-sm font-medium"
              >
                Email
              </Label>
              <Input
                id="dental-email"
                type="email"
                autoComplete="username"
                placeholder="you@practice.com"
                className="h-10 text-sm"
                {...register('email')}
                data-cy="dental-login-email"
              />
              {errors.email && (
                <p className="text-destructive text-xs">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="dental-password"
                className="text-sm font-medium"
              >
                Password
              </Label>
              <Input
                id="dental-password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                className="h-10 text-sm"
                {...register('password')}
                data-cy="dental-login-password"
              />
              {errors.password && (
                <p className="text-destructive text-xs">{errors.password.message}</p>
              )}
            </div>

            {errors.root && (
              <p
                className="text-destructive rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm"
                data-cy="dental-login-error"
                role="alert"
              >
                {errors.root.message}
              </p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 h-10 w-full text-sm font-medium"
              data-cy="dental-login-submit"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>

        <p className="text-muted-foreground mt-5 text-center text-xs leading-relaxed">
          Demo credentials: <span className="text-foreground/80">admin@example.com</span> /{' '}
          <span className="text-foreground/80">change-me-strongly</span>
        </p>
      </div>
    </div>
  );
}

export default DentalLoginPage;
