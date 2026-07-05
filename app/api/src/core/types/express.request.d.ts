declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      jwt?: string;
      auth?: {
        user?: unknown;
        roles?: string[];
        permissions?: string[];
        token?: string;
        _userEntity?: unknown;
      };
      user?: unknown;
    }
  }
}

export {};
