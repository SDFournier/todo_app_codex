import { UserRepository, CreateUserInput } from '@/core/ports/repositories/userRepository';
import { User } from '@/core/domain/user/user.types';
import { prisma } from '@/infra/db/prismaClient';
import { mapUser } from './mappers';

export class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? mapUser(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? mapUser(user) : null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const user = await prisma.user.create({ data: input });
    return mapUser(user);
  }
}
