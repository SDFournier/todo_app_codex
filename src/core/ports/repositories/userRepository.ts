import { User } from '../../domain/user/user.types';

export type CreateUserInput = {
  email: string;
  displayName: string;
  timezone: string;
};

/**
 * User repository port.
 */
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
}
