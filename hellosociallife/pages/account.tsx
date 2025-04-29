import { UserCircleIcon, CogIcon, BellIcon, ShieldCheckIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { User } from '@/models/User';
import { requireAuth } from '@/utils/auth';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await requireAuth(ctx) || { redirect: { destination: '/', permanent: false } };
};

export default function AccountPage({ user }: { user: User }) {
  // State management
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    bio: user.bio || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
    setSuccess(null);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout', {
        method: 'POST',
      });

      if (res.ok) {
        window.location.href = '/login';
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your account?");
    if (!confirmDelete) return;

    const res = await fetch('/api/deleteUser', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const data = await res.json();

    if (res.ok) {
      alert('Account deleted successfully');
      localStorage.removeItem('userEmail');
      window.location.href = 'account/security';
    } else {
      alert('Failed to delete account: ' + data.error);
    }
  };

  const handleSave = async () => {
    if (!formData.bio.trim()) {
      setError('Bio cannot be empty');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          username: formData.username.trim(),
          email: formData.email.trim(),
          bio: formData.bio
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return <div>Please sign in to view your account</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#001a33] via-[#003366] to-[#004d7a] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-[#001a33] rounded-lg shadow p-6">
              <div className="flex items-center space-x-4 mb-8">
                <div className="relative">
                  {user.image ? (
                    <img
                      className="h-12 w-12 rounded-full"
                      src={user.image}
                      alt={user.username || 'User avatar'}
                    />
                  ) : (
                    <UserCircleIcon className="h-12 w-12 text-[#00bfff]" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-medium text-white">{user.username || user.email}</h2>
                  <p className="text-sm text-gray-300">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                <a href="#" className="bg-[#001a33] text-[#00bfff] group flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-[#003366]">
                  <UserCircleIcon className="text-[#00bfff] flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
                  <span className="truncate">Profile</span>
                </a>
                <a href="#" className="text-gray-300 hover:bg-[#003366] hover:text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                  <CogIcon className="text-[#00bfff] group-hover:text-[#00bfff] flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
                  <span className="truncate">Settings</span>
                </a>
                <a href="#" className="text-gray-300 hover:bg-[#003366] hover:text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                  <BellIcon className="text-[#00bfff] group-hover:text-[#00bfff] flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
                  <span className="truncate">Notifications</span>
                </a>
                <Link href="/account/security" className="text-gray-300 hover:bg-[#003366] hover:text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                  <ShieldCheckIcon className="text-[#00bfff] group-hover:text-[#00bfff] flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
                  <span className="truncate">Security</span>
                </Link>
              </nav>

              <div className="mt-8 pt-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="group flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 w-full">
                  <ArrowRightOnRectangleIcon className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-[#001a33] shadow rounded-lg mb-8">
              <div className="px-6 py-5 border-b border-[#003366]">
                <h3 className="text-lg font-medium leading-6 text-white">Profile Information</h3>
              </div>
              <div className="px-6 py-5">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        id="username"
                        value={formData.username}  // Binding correct username
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-[#00bfff] py-2 px-3 shadow-sm focus:border-[#00bfff] focus:outline-none focus:ring-[#00bfff] sm:text-sm text-white bg-[#001a33]"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                        Email address
                      </label>
                      <input
                        type="text"
                        name="email"
                        id="email"
                        value={formData.email}  // Binding email to the input
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-[#00bfff] py-2 px-3 shadow-sm focus:border-[#00bfff] focus:outline-none focus:ring-[#00bfff] sm:text-sm text-white bg-[#001a33]"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-300">
                      Bio
                    </label>
                    <input
                      type="text"
                      name="bio"
                      id="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-[#00bfff] shadow-sm py-2 px-3 focus:border-[#00bfff] focus:ring-[#00bfff] sm:text-sm text-white bg-[#001a33]"
                      placeholder="Tell us a little about yourself"
                    />
                    {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
                    {success && <div className="text-green-500 text-sm mt-1">{success}</div>}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !formData.bio.trim()}
                    className={`px-4 py-2 rounded text-white ${isSaving || !formData.bio.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#00bfff] hover:bg-[#008c99]'
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
