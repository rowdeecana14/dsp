import { RbacService } from './rbac.service';

describe('RbacService', () => {
  it('matches required roles case-insensitively', () => {
    const service = new RbacService({} as any);

    expect(service.hasRole(['admin'], ['Admin'])).toBe(true);
    expect(service.hasRole(['Admin'], ['admin'])).toBe(true);
  });

  it('lets the superadmin role satisfy role and permission checks', async () => {
    const service = new RbacService({
      find: jest.fn().mockResolvedValue([]),
    } as any);

    expect(service.hasRole(['superadmin'], ['admin'])).toBe(true);
    expect(service.hasRole(['superadmin'], ['superadmin'])).toBe(true);
    await expect(service.hasPermission(['superadmin'], [], 'roles.read')).resolves.toBe(true);
  });
});
