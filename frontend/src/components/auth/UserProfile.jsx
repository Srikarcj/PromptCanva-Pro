import React, { useState } from 'react';
import { UserProfile as ClerkUserProfile } from '@clerk/clerk-react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui';
import { User, ChevronDown, ChevronUp } from 'lucide-react';

const UserProfile = () => {
  const { user } = useUser();
  const [isUserInfoExpanded, setIsUserInfoExpanded] = useState(true);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Mobile-optimized container with safe areas */}
      <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">

        {/* Smooth Header with better spacing */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                Profile Settings
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Manage your account settings
              </p>
            </div>
          </div>

          {/* Smooth User Info Card */}
          {user && (
            <Card className="mb-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-0">
                {/* Mobile-friendly collapsible header */}
                <div
                  className="p-4 cursor-pointer sm:cursor-default"
                  onClick={() => setIsUserInfoExpanded(!isUserInfoExpanded)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <img
                        src={user.imageUrl}
                        alt={user.fullName || user.emailAddresses[0]?.emailAddress}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-3 border-white shadow-md"
                      />
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                          {user.fullName || 'User'}
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 truncate">
                          {user.emailAddresses[0]?.emailAddress}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                          Member since {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Mobile expand/collapse indicator */}
                    <div className="sm:hidden ml-2">
                      {isUserInfoExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable stats section */}
                <div className={`
                  transition-all duration-300 ease-in-out overflow-hidden
                  ${isUserInfoExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 sm:max-h-96 sm:opacity-100'}
                `}>
                  <div className="px-4 pb-4 border-t border-gray-100 pt-4 sm:border-t-0 sm:pt-0">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                        <div className="text-xl sm:text-2xl font-bold text-blue-600">5</div>
                        <div className="text-xs sm:text-sm text-gray-600 font-medium">Images/day</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                        <div className="text-xl sm:text-2xl font-bold text-green-600">Free</div>
                        <div className="text-xs sm:text-sm text-gray-600 font-medium">Plan</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg col-span-2 sm:col-span-1">
                        <div className="text-xl sm:text-2xl font-bold text-purple-600">Active</div>
                        <div className="text-xs sm:text-sm text-gray-600 font-medium">Status</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Smooth Profile Management */}
        <Card className="shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-4 border-b border-gray-100">
            <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
              Account Management
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Update your personal information and preferences
            </p>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div
              className="w-full"
              style={{
                maxHeight: 'calc(100vh - 300px)',
                minHeight: '500px',
                overflowY: 'auto',
                overflowX: 'hidden'
              }}
            >
              <ClerkUserProfile
                appearance={{
                  elements: {
                    // Main containers
                    rootBox: "w-full max-w-none",
                    card: "shadow-none border-0 w-full bg-transparent max-w-none",
                    page: "w-full max-w-none",
                    pageScrollBox: "w-full max-w-none",

                    // Navigation - smooth and touch-friendly
                    navbar: "border-b border-gray-200 mb-6 pb-3 w-full",
                    navbarButton: "text-gray-600 hover:text-gray-900 px-4 py-3 rounded-lg hover:bg-gray-100 transition-all duration-200 text-sm font-medium whitespace-nowrap min-h-[44px] flex items-center justify-center",
                    navbarButtonActive: "text-blue-600 bg-blue-50 border border-blue-200 font-semibold shadow-sm",

                    // Buttons - larger touch targets
                    formButtonPrimary: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 text-sm min-h-[48px] w-full sm:w-auto shadow-sm hover:shadow-md",
                    formButtonSecondary: "bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-200 text-sm min-h-[48px] w-full sm:w-auto",

                    // Form fields - better mobile experience
                    formFieldInput: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-base min-h-[48px] placeholder-gray-400",
                    formFieldLabel: "text-sm font-semibold text-gray-700 mb-2 block",
                    formFieldHintText: "text-sm text-gray-500 mt-2",
                    formField: "w-full mb-6",
                    formFieldRow: "w-full",
                    formFieldAction: "w-full",

                    // Sections - clean spacing
                    profileSectionTitle: "text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200",
                    profileSectionContent: "space-y-6 w-full",
                    profileSection: "mb-8 pb-6 w-full",

                    // Avatar - centered and prominent
                    avatarBox: "w-20 h-20 sm:w-24 sm:h-24 rounded-full border-3 border-white shadow-lg mx-auto",
                    avatarImageActions: "mt-4 flex flex-col sm:flex-row gap-3 justify-center",
                    avatarImageActionsUpload: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 min-h-[48px] shadow-sm hover:shadow-md",
                    avatarImageActionsRemove: "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 min-h-[48px] shadow-sm hover:shadow-md",

                    // Page layout
                    profilePage: "space-y-8 w-full max-w-none",
                    profilePageContent: "space-y-8 w-full max-w-none",
                    profilePageHeader: "mb-6 w-full text-center",
                    profilePageHeaderTitle: "text-2xl font-bold text-gray-900 mb-2",
                    profilePageHeaderSubtitle: "text-gray-600 text-base",

                    // Status messages
                    formFieldSuccessText: "text-green-600 text-sm mt-2 font-medium",
                    formFieldErrorText: "text-red-600 text-sm mt-2 font-medium",
                    formFieldWarningText: "text-yellow-600 text-sm mt-2 font-medium",

                    // Links and interactive elements
                    formResendCodeLink: "text-blue-600 hover:text-blue-700 font-semibold text-sm underline",

                    // Identity previews
                    identityPreview: "p-4 border border-gray-200 rounded-lg bg-gray-50 w-full hover:bg-gray-100 transition-colors duration-200",
                    identityPreviewText: "text-gray-700 text-base",
                    identityPreviewEditButton: "text-blue-600 hover:text-blue-700 font-semibold text-sm ml-3 underline",

                    // Modals
                    modalContent: "max-h-[80vh] overflow-auto rounded-lg",
                    modalCloseButton: "text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2",

                    // Input groups
                    formFieldInputGroup: "w-full relative",
                    formFieldInputShowPasswordButton: "absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 text-gray-400 hover:text-gray-600 transition-colors duration-200",
                    formFieldInputShowPasswordIcon: "w-5 h-5",

                    // Additional elements
                    formFieldOptionalText: "text-sm text-gray-500 font-normal",
                    formFieldSuccessIcon: "w-5 h-5 text-green-600",
                    formFieldErrorIcon: "w-5 h-5 text-red-600",
                    formFieldWarningIcon: "w-5 h-5 text-yellow-600",
                  },
                  layout: {
                    socialButtonsPlacement: "bottom",
                    socialButtonsVariant: "blockButton",
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
