import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import path from 'path';

const sqlitePath = path.join(process.cwd(), 'sqlite.db');

const client = createClient({ url: `file:${sqlitePath}` });
export const db = drizzle(client, { schema });
