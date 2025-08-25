import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '@/config';
import type { User } from '@/types/global';

class DatabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      config.database.supabaseUrl,
      config.database.supabaseServiceKey
    );
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }

    return data;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // no rows
      throw new Error(`Failed to get user by email: ${error.message}`);
    }

    return data;
  }

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updatedAt'>): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data;
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  async getUsers(page: number = 1, limit: number = 10): Promise<{
    users: User[];
    total: number;
  }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const [{ data: users, error }, { count, error: countError }] = await Promise.all([
      this.supabase
        .from('users')
        .select('*')
        .range(from, to)
        .order('created_at', { ascending: false }),
      this.supabase
        .from('users')
        .select(`*`, { count: 'exact', head: true })
    ]);

    if (error || countError) {
      throw new Error(`Failed to get users: ${error?.message || countError?.message}`);
    }

    return {
      users: users || [],
      total: count || 0,
    };
  }
}

export const dbService = new DatabaseService();