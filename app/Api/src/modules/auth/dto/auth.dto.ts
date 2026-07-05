export class AuthUserDto {
  id!: string;
  email!: string;
  name!: string;
  roles?: string[];
  permissions?: string[];
}

export class AuthDto {
  token!: string;
  user!: AuthUserDto;
}

