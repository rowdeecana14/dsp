import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';

export const API_KEY_PUBLIC_KEY = 'apiKeyPublic';
export const API_KEY_ONLY_KEY = 'apiKeyOnly';

/** Bypass API key check (e.g. login, register). */
export const ApiKeyPublic = () => SetMetadata(API_KEY_PUBLIC_KEY, true);

/** Route accepts API key only — no JWT required. */
export const ApiKeyOnly = () =>
  applyDecorators(SetMetadata(API_KEY_ONLY_KEY, true), ApiSecurity('API-key'));
