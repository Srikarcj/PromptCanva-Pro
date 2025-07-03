import React from 'react';
import { UserButton as ClerkUserButton, useUser } from '@clerk/clerk-react';
import { User } from 'lucide-react';

const UserButton = ({ className = '' }) => {
  const { user } = useUser();

  if (!user) {
    return (
      <div className={`w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ${className}`}>
        <User className="w-4 h-4 text-gray-500" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <ClerkUserButton
        appearance={{
          elements: {
            avatarBox: "w-8 h-8 rounded-full border-2 border-gray-200 hover:border-blue-300 transition-colors duration-200",
            userButtonPopoverCard: "shadow-xl border border-gray-200 rounded-lg mt-2 min-w-[240px]",
            userButtonPopoverActionButton: "hover:bg-gray-50 text-gray-700 px-4 py-3 text-left w-full transition-colors duration-200",
            userButtonPopoverActionButtonText: "text-sm font-medium",
            userButtonPopoverActionButtonIcon: "w-4 h-4 mr-3",
            userButtonPopoverFooter: "border-t border-gray-200 pt-2 mt-2",
            userButtonPopoverMain: "p-2",
            userButtonPopoverActions: "space-y-1",
            userPreview: "p-4 border-b border-gray-200",
            userPreviewMainIdentifier: "font-medium text-gray-900",
            userPreviewSecondaryIdentifier: "text-sm text-gray-500",
          },
        }}
        userProfileMode="navigation"
        userProfileUrl="/profile"
        afterSignOutUrl="/"
        showName={false}
      />
    </div>
  );
};

export default UserButton;
