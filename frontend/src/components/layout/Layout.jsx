import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const { isSignedIn } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex">
        {/* Show sidebar on desktop only when signed in, on mobile always show */}
        <div className={`${isSignedIn ? '' : 'lg:hidden'}`}>
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        <main className={`flex-1 ${isSignedIn ? 'lg:ml-0' : ''}`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
