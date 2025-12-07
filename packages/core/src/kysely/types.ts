import type { Generated } from 'kysely';

export type UsersTable = {
  id: Generated<number>;
  email: string;
  name: string | null;
  created_at: number;
  updated_at: number;
};

export type FinesTable = {
  id: Generated<number>;
  user_id: number;
  amount: number;
  reason: string;
  paid: number; // SQLite stores booleans as 0/1
  created_at: number;
  paid_at: number | null;
};

export type Database = {
  users: UsersTable;
  fines: FinesTable;
};
