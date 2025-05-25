
import { getRequestContext } from "@cloudflare/next-on-pages";
import { drizzle } from "drizzle-orm/d1";
import { users, type User } from "@schema/drizzle";
import UserList from "@/app/UserList";

export const runtime = 'edge'

export default async function Home() {
  function ErrorBoundary({ error }: { error: Error }) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <h2 className="text-lg font-semibold text-red-800">Something went wrong</h2>
        <p className="text-red-700">{error.message}</p>
      </div>
    );
  }

  try {
    const { env } = getRequestContext();
    if (!env || !env.DB) {
      throw new Error('Database connection not available');
    }

    const DB = drizzle(env.DB);
    const userList = await DB.select().from(users).all() as User[];
    
    // Convert the database rows to the expected User type
    const formattedUsers = userList.map(user => ({
      id: user.id,
      name: user.name,
      created: user.created ? Number(user.created) : undefined
    }));

    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <UserList initialUsers={formattedUsers} />
      </main>
    );
  } catch (error) {
    console.error('Error in Home component:', error);
    const errorMessage = error instanceof Error ? error : new Error('An unknown error occurred');
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <ErrorBoundary error={errorMessage} />
      </main>
    );
  }
}
