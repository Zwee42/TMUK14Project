import { UserCircleIcon, CogIcon, BellIcon, ShieldCheckIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { User } from '@/models/User';
import { requireAuth } from '@/utils/auth';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await requireAuth(ctx) || { redirect: { destination: '/', permanent: false } };
};

export default function AccountPage({ user }: { user:User }) {
  // State management
 
  const [isSettingOpen, setIsSettingOpen] = useState (true);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const[isAboutOpen, setIsAboutOpen] = useState(false);
  const[isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    bio: user.bio || '',
    image : user.image || '',
  });
  console.log(user);
  console.log(formData);
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

  const fetchAccount = async () =>{
    console.log(currentpassword);
     const response = await fetch('/api/updateAccount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          username: formData.username,
          bio: formData.bio,
          image : formData.image,
          email : newEmail || formData.email,
          currentpassword,


        }),
      });
      return response;

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
      const response = await fetchAccount();
      if (!response.ok) {
        //const data = await response.json();
        throw new Error('Failed to update profile');
      }
      const data = await response.json();
      setFormData({...formData, email: data.email, bio : data.bio, username: data.username, image: data.image });
      
        setSuccess('Profile is updated successfully!');
    } catch (err:unknown) {
      setError('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };
  const [showPassword, setShowPassword] = useState(false);
  const [currentpassword, setCurrentpassword] = useState('');

  const [newEmail, setNewEmail] = useState('');
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);


 

  // Email change handler
 const handleChangeEmail = async () => {
  if (!currentpassword || !newEmail) {
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
  setSuccess(null);
  setError(null);

  try {
    console.log(currentpassword);
    const response = await fetch('/api/change-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', 
      body: JSON.stringify({
        email: newEmail,  // Använd newEmail istället för email
        currentPassword : currentpassword,  // Se till att namnet matchar backend
      }),
    });

    const data = await response.json();
    console.log('Response:', response, 'Data:', data);

    if (!response.ok) {
      setSettingsError(data.message || 'Failed to update email!');
      return;  // Lägg till return här för att avbryta vid fel
    }

    setSuccess('Email is updated successfully!');
    setFormData({...formData, email: newEmail});
  } catch (err: unknown) {
    setError('Failed to save email');
    if (err instanceof Error) {
      setSettingsError(err.message);
    }
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
                    value={currentpassword}
                    onChange={(e) => setCurrentpassword(e.target.value)}
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
                        id="email"
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
     {/* About / Privacy policy */}
{isAboutOpen && (
  <div className="flex-1">
    <div className="bg-[#001a33] shadow rounded-lg mb-8">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#003366]">
        <h3 className="text-lg font-medium leading-6 text-white">
          Privacy Policy
        </h3>
      </div>

      {/* Policy content */}
      <div
        className="px-6 py-6 space-y-6 overflow-y-auto"
        style={{ maxHeight: "60vh" }}
      >
        <h4 className="text-white font-semibold">1. Eligibility</h4>
        <p className="text-gray-300 text-sm leading-relaxed">
          <strong>1.1 Age Requirement</strong> — Users must be at least 13 years old to create or access an account. We may request proof of age at any time. Accounts found to belong to individuals under 13 will be terminated and associated data deleted.
        </p>

        <h4 className="text-white font-semibold">2. Prohibited Conduct</h4>
        <p className="text-gray-300 text-sm leading-relaxed">
          <strong>2.1 Harassment & Bullying</strong><br />
          &nbsp;&nbsp;&bull; Targeted insults, threats, intimidation, doxxing, or any behavior intended to demean, shame, or silence another person is forbidden.<br />
          &nbsp;&nbsp;&bull; We operate a zero-tolerance approach: content or accounts engaged in harassment are subject to immediate removal.
        </p>
        <p className="text-gray-300 text-sm leading-relaxed">
          <strong>2.2 Self-Harm & Suicide Content</strong><br />
          &nbsp;&nbsp;&bull; Content that encourages, glorifies, or instructs suicide, self-harm, or eating disorders is strictly prohibited.
        </p>
        <p className="text-gray-300 text-sm leading-relaxed">
          <strong>2.3 Unauthorized Access & “Hacking”</strong><br />
          &nbsp;&nbsp;&bull; Any attempt to gain unauthorized access to another user’s account, personal data, or our systems—whether through password harvesting, social engineering, malware, or other techniques—violates this policy and may constitute a criminal offense.
        </p>
        <p className="text-gray-300 text-sm leading-relaxed">
          <strong>2.4 Impersonation & Naming Restrictions</strong><br />
          &nbsp;&nbsp;&bull; Users may not misrepresent their identity. Display names or handles that impersonate real persons, brands, or entities without clear satire or parody disclaimers are subject to removal.
        </p>

        <h4 className="text-white font-semibold">3. Enforcement</h4>
        <p className="text-gray-300 text-sm leading-relaxed">
          <strong>3.1 Moderation Actions</strong> — Violations may result in content removal, temporary suspension, permanent account termination, or referral to law enforcement. Moderation decisions are final unless successfully appealed.
        </p>
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


