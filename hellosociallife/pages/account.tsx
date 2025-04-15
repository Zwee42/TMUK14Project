// app/account/page.tsx
import { UserCircleIcon, CogIcon, BellIcon, ShieldCheckIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { User } from '@/models/User';
import React, { useState } from 'react';

export default function AccountPage() {
  // User data
  const userData = { 
    name: "John Johnsson",
    email: "john@gmail.com",
    bio: "",
    image: "imgs/bild1.png"
  };

  // State management
  const [text, setText] = useState<string>(userData.bio || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const user = new User(userData.name, userData.email, text, userData.image);

  // Event handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    if (!text.trim()) {
      setError('Bio cannot be empty');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would typically call your actual API:
      // const response = await fetch('/api/save-bio', {
      //   method: 'POST',
      //   body: JSON.stringify({ bio: text }),
      //   headers: { 'Content-Type': 'application/json' }
      // });
      // if (!response.ok) throw new Error('Failed to save bio');
      
      setSuccess('Bio saved successfully!');
      console.log('Bio saved:', text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save bio');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return <div>Please sign in to view your account</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-4 mb-8">
                <div className="relative">
                  {user.image ? (
                    <img
                      className="h-12 w-12 rounded-full"
                      src={user.image}
                      alt={user.name || 'User avatar'}
                    />
                  ) : (
                    <UserCircleIcon className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">{user.name}</h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                <a href="#" className="bg-gray-100 text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                  <UserCircleIcon className="text-gray-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
                  <span className="truncate">Profile</span>
                </a>
                <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                  <CogIcon className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
                  <span className="truncate">Settings</span>
                </a>
                <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                  <BellIcon className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
                  <span className="truncate">Notifications</span>
                </a>
                <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                  <ShieldCheckIcon className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
                  <span className="truncate">Security</span>
                </a>
              </nav>

              <div className="mt-8 pt-4 border-t border-gray-200">
                <button className="group flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 w-full">
                  <ArrowRightOnRectangleIcon className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white shadow rounded-lg mb-8">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Profile Information</h3>
              </div>
              <div className="px-6 py-5">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                        First name
                      </label>
                      <input
                        type="text"
                        name="first-name"
                        id="first-name"
                        defaultValue={user.name?.split(' ')[0] || ''}
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                        Last name
                      </label>
                      <input
                        type="text"
                        name="last-name"
                        id="last-name"
                        defaultValue={user.name?.split(' ')[1] || ''}
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <input
                      type="text"
                      name="email"
                      id="email"
                      defaultValue={user.email || ''}
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <input
                      type="text"
                      name="bio"
                      id="bio"
                      value={text}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Tell us a little about yourself"
                    />
                    {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
                    {success && <div className="text-green-500 text-sm mt-1">{success}</div>}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !text.trim()}
                    className={`px-4 py-2 rounded text-white ${
                      isSaving || !text.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}