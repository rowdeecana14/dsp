import { faker } from '@faker-js/faker';
import { UserEntity } from '../../modules/users/entities/user.entity';

export class UserFactory {
  public static create(
    id?: string,
    name?: string,
    email?: string,
    password?: string,
  ): UserEntity {
    const user = new UserEntity();
    user.id = id ?? faker.string.uuid();
    user.name = name ?? faker.person.fullName();
    user.email = email ?? faker.internet.email();
    user.password = password ?? faker.internet.password();
    return user;
  }
}
