import { UserCircleIcon, CogIcon, BellIcon, ShieldCheckIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { User } from '@/models/User';
import { requireAuth } from '@/utils/auth';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await requireAuth(ctx) || { redirect: { destination: '/', permanent: false } };
};

export default function AccountPage({ user }: { user: User }) {
  // State management
  const [isSettingOpen, setIsSettingOpen] = useState (true);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const[isAboutOpen, setIsAboutOpen] = useState(false);
  const[isNotificationOpen, setIsNotificationOpen] = useState(false);
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

  const handleLogout = () => {
   window.location.href = "/login";
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your account?");
    if (!confirmDelete) return;

    const email = localStorage.getItem('userEmail');

    if (!email) {
      alert('No email found, please login again');
      return;
    }

    const res = await fetch('/api/deleteUser', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
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
    if (!formData.username && !formData.bio) {
      setError('No modifications were made');
      return;
    }
    if (formData.username.includes(" ")){
      setError('Spaces are not allowed in userame fomat');
      return;
    }
  
    setIsSaving(true);
    setError(null);
    setSuccess(null);
  
    try {
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          username: formData.username,
          bio: formData.bio
        }),
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error('Failed to update profile');
      }
  
      setSuccess('Profile updated successfully!');
    } catch (err:unknown) {
      setError('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setSettingsError('All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSettingsError("Passwords don't match");
      return;
    }

    if (newPassword.length < 8) {
      setSettingsError("Password must be at least 8 characters");
      return;
    }

    setIsPasswordLoading(true);
    setSettingsError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSettingsSuccess("Password changed successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setSettingsError("Failed to update password");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // Email change handler
  const handleChangeEmail = async () => {
    if (!currentPassword || !newEmail) {
      setSettingsError('Current password and new email are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setSettingsError("Please enter a valid email address");
      return;
    }

    setIsEmailLoading(true);
    setSettingsError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSettingsSuccess("Email change request sent! Please check your inbox.");
      setCurrentPassword('');
      setNewEmail('');
    } catch (error) {
      setSettingsError("Failed to update email");
    } finally {
      setIsEmailLoading(false);
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
                <button
                onClick={()=> {
                  setIsSettingOpen(true);
                  setIsSecurityOpen(false);
                  setIsAboutOpen(false);
                  setIsNotificationOpen(false)
                }}
                  className={`${isSettingOpen ? 'bg-[#003366] text-[#00bfff]' : 'bg-[#001a33] text-white '} group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full hover:bg-[#003366]`}
                  >
                  <UserCircleIcon className="text-[#00bfff] flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
                  <span className="truncate">Settings</span >
                </button>
                <button 
                onClick={() => {
                  setIsSecurityOpen (!isSecurityOpen);
                  setIsSettingOpen(false);
                  setIsAboutOpen(false);
                  setIsNotificationOpen(false)
                }}
                className={`${isSecurityOpen ? 'bg-[#003366] text-[#00bfff]' : 'bg-[#001a33] text-white '} group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full hover:bg-[#003366]`}
                >
                  <CogIcon className="text-[#00bfff] group-hover:text-[#00bfff] flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
                  <span className="truncate">Security</span>
                </button>
                <button 
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  setIsAboutOpen(false);
                  setIsSecurityOpen(false);
                  setIsSettingOpen(false)
                }}
                 className="text-gray-300 hover:bg-[#003366] hover:text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                  <BellIcon className="text-[#00bfff] group-hover:text-[#00bfff] flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
                  <span className="truncate">Notifications</span>
                </button>
                <button 
                onClick={()=> {
                  setIsAboutOpen (!isAboutOpen);
                  setIsSecurityOpen(false);
                  setIsSettingOpen(false);
                  setIsNotificationOpen(false)

                }}
                 className="text-gray-300 hover:bg-[#003366] hover:text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                  <ShieldCheckIcon className="text-[#00bfff] group-hover:text-[#00bfff] flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
                  <span className="truncate">About</span>
                </button>
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
        {isSettingOpen && (
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
                        value={formData.username}
                        onChange = {handleChange}
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
                        value={formData.email}
                        onChange = {handleChange}
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
                      disabled={isSaving || !formData.username || !formData.bio}
                      className={`px-4 py-2 rounded text-white ${
                        isSaving || !formData.username || !formData.bio
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
        )}
        {/*settings content */}
        {isSecurityOpen &&(
          <div className="flex-1">
          <div className="bg-[#001a33] shadow rounded-lg mb-8">
            <div className="px-6 py-5 border-b border-[#003366]">
              <h3 className="text-lg font-medium leading-6 text-white">Account Settings</h3>
            </div>
            <div className="px-6 py-5">
              {/* Success/Error Messages */}
              {settingsSuccess && (
                <div className="mb-4 p-3 bg-green-800/20 text-green-400 rounded text-sm">
                  {settingsSuccess}
                </div>
              )}
              {settingsError && (
                <div className="mb-4 p-3 bg-red-800/20 text-red-400 rounded text-sm">
                  {settingsError}
                </div>
              )}

              {/* Current Password (Shared for both operations) */}
              <div className="mb-6">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-[#001a33] border border-[#00bfff] rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-[#00bfff]"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Change Section */}
              <div className="mb-8">
                <h4 className="text-md font-medium text-white mb-4">Change Password</h4>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#001a33] border border-[#00bfff] rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-[#00bfff]"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#001a33] border border-[#00bfff] rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-[#00bfff]"
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleChangePassword}
                      disabled={isPasswordLoading}
                      className={`w-full py-2 px-4 rounded-md text-white font-medium ${isPasswordLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#00bfff] hover:bg-[#0086b3]'}`}
                    >
                      {isPasswordLoading ? 'Updating...' : 'Change Password'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Email Change Section */}
              <div>
                <h4 className="text-md font-medium text-white mb-4">Change Email</h4>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="newEmail" className="block text-sm font-medium text-gray-300 mb-1">
                      New Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="newEmail"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full bg-[#001a33] border border-[#00bfff] rounded-md py-2 pl-10 pr-3 text-white focus:outline-none focus:ring-1 focus:ring-[#00bfff]"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleChangeEmail}
                      disabled={isEmailLoading}
                      className={`w-full py-2 px-4 rounded-md text-white font-medium ${isEmailLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#00bfff] hover:bg-[#0086b3]'}`}
                    >
                      {isEmailLoading ? 'Updating...' : 'Change Email'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
       {/*About policy */}
     {isAboutOpen && (
          <div className="flex-1">
          <div className="bg-[#001a33] shadow rounded-lg mb-8">
            <div className="px-6 py-5 border-b border-[#003366]">
              <h3 className="text-lg font-medium leading-6 text-white">Privacy policy</h3>
            </div>
          </div>
          </div>
    )}

{isNotificationOpen && (
          <div className="flex-1">
          <div className="bg-[#001a33] shadow rounded-lg mb-8">
            <div className="px-6 py-5 border-b border-[#003366]">
              <h3 className="text-lg font-medium leading-6 text-white">Notifications</h3>
            </div>
          </div>
          </div>
    )}
      
        </div>
      </div>
    </div>
  );
};