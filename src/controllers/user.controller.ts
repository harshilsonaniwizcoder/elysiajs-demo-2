import { dbService } from '@/services/database';
import { queueManager } from '@/queue/queue-manager';
import { ResponseBuilder } from '@/utils/response';
import { NotFoundError } from '@/utils/errors';
import { QUEUE_NAMES } from '@/utils/constants';
import { t } from '@/localization';
import type { CreateUserDTO, UpdateUserDTO, GetUsersQuery } from '@/schemas/user.schema';
import type { User } from '@/types/global';

export class UserController {
  async createUser(userData: CreateUserDTO): Promise<ReturnType<typeof ResponseBuilder.success<User>>> {
    const user = await dbService.createUser(userData);
    
    // Add job to queue for welcome email
    await queueManager.addJob(QUEUE_NAMES.EMAIL, {
      type: 'welcome-email',
      payload: { userId: user.id, email: user.email },
    });

    return ResponseBuilder.success(t('user.created'), user);
  }

  async getUserById(id: string): Promise<ReturnType<typeof ResponseBuilder.success<User>>> {
    const user = await dbService.getUserById(id);
    
    if (!user) {
      throw new NotFoundError(t('user.not_found'));
    }

    return ResponseBuilder.success('User retrieved successfully', user);
  }

  async updateUser(id: string, updates: UpdateUserDTO): Promise<ReturnType<typeof ResponseBuilder.success<User>>> {
    const existingUser = await dbService.getUserById(id);
    
    if (!existingUser) {
      throw new NotFoundError(t('user.not_found'));
    }

    const user = await dbService.updateUser(id, updates);

    return ResponseBuilder.success(t('user.updated'), user);
  }

  async deleteUser(id: string): Promise<ReturnType<typeof ResponseBuilder.success<null>>> {
    const existingUser = await dbService.getUserById(id);
    
    if (!existingUser) {
      throw new NotFoundError(t('user.not_found'));
    }

    await dbService.deleteUser(id);

    return ResponseBuilder.success(t('user.deleted'), null);
  }

  async getUsers(query: GetUsersQuery): Promise<ReturnType<typeof ResponseBuilder.paginated<User>>> {
    const { users, total } = await dbService.getUsers(query.page, query.limit);

    return ResponseBuilder.paginated(
      'Users retrieved successfully',
      users,
      {
        page: query.page,
        limit: query.limit,
        total,
      }
    );
  }
}

export const userController = new UserController();