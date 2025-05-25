'use client';

import { useState } from 'react';

type User = {
  id: string;
  name: string | null;
  created?: number | Date;
};

export default function UserList({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddUser = async () => {
    if (!userName.trim()) {
      setError('Please enter a name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/add-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: userName }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(errorData?.error || 'Failed to add user');
      }

      const data = (await response.json()) as User[];
      setUsers(data);
      setUserName('');
    } catch (err: unknown) {
      console.error('Error adding user:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      <div className="space-y-2">
        <div className="flex space-x-2">
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter a name"
            className="flex-1 bg-zinc-800 p-2 rounded-lg border-2 border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
            onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
          />
          <button
            onClick={handleAddUser}
            disabled={isLoading || !userName.trim()}
            className={`px-4 py-2 rounded-lg border-2 ${
              isLoading || !userName.trim() 
                ? 'bg-zinc-700 border-zinc-600 text-zinc-400 cursor-not-allowed' 
                : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-700'
            } transition-colors`}
          >
            {isLoading ? 'Adding...' : 'Add User'}
          </button>
        </div>
        {error && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
            {error}
          </div>
        )}
      </div>
      
      <div className="h-64 overflow-y-auto border-2 border-zinc-700 rounded-lg p-2">
        {users.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-400">
            No users yet. Add one above!
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div 
                key={user.id} 
                className="bg-zinc-800 p-3 rounded-lg border border-zinc-700 hover:bg-zinc-750 transition-colors"
              >
                <p className="text-white">{user.name}</p>
                {user.created && (
                  <p className="text-xs text-zinc-400 mt-1">
                    Created: {new Date(
                      typeof user.created === 'number' ? user.created : user.created
                    ).toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}