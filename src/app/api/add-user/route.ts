import type { NextRequest } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { v4 as uuidv4 } from 'uuid';
import { drizzle } from 'drizzle-orm/d1';
import { users } from '@schema/drizzle';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as { name: string };
    
    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Name is required and must be a non-empty string' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { env } = getRequestContext();
    
    if (!env || !env.DB) {
      console.error('DB is not available in the environment');
      return new Response(
        JSON.stringify({ error: 'Database connection not available' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const DB = drizzle(env.DB);
    
    try {
      await DB.insert(users).values([
        { id: uuidv4(), name: data.name.trim() },
      ]);

      const allUsers = await DB.select().from(users).all();
      
      return new Response(
        JSON.stringify(allUsers),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to insert user into database' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
