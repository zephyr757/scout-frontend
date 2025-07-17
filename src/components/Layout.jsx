// src/components/Layout.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ChartBarIcon, 
  PhotoIcon, 
  UsersIcon, 
  PresentationChartLineIcon,
  CogIcon 
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: ChartBarIcon },
  { name: 'Creators', href: '/creators', icon: UsersIcon },
  { name: 'Analytics', href: '/analytics', icon: PresentationChartLineIcon },
];

function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50 font-poppins font-thin">
      {/* Sidebar */}
      <div className="flex flex-col w-64 bg-gradient-brand">
        <div className="flex items-center justify-center h-16 px-4 bg-brand-navy/50">
          <h1 className="text-2xl font-light text-white tracking-wide">
            Scout
          </h1>
          <div className="ml-2 w-2 h-2 bg-brand-teal rounded-full animate-pulse-soft"></div>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-3 py-3 text-sm font-light rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-teal/20 text-white border-r-2 border-brand-gold shadow-soft'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center text-sm text-white/60 font-extralight">
            <CogIcon className="w-4 h-4 mr-2" />
            Canon Creator Monitor
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-soft border-b border-gray-100">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-light text-brand-navy tracking-wide">
                Instagram Creator Monitoring
              </h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-gray-500 font-light">
                  <div className="w-2 h-2 bg-brand-teal rounded-full mr-2 animate-pulse"></div>
                  System Active
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;