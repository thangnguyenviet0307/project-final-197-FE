import { Outlet } from 'react-router-dom';
import { ChatWidget } from '@/features/ai/components/chat-widget';

import { StoreHeader } from './store-header';
import { StoreNavbar } from './store-navbar';
import { StoreFooter } from './store-footer';
import { StorefrontUiContext } from '@/context/storefront-ui-context';
import './storefront-ui.css';

export function StoreLayout() {
  return (
    <StorefrontUiContext.Provider value={true}>
      <div className="storefront-ui flex min-h-screen flex-col bg-white text-gray-900">
        {/* Header */}
        <StoreHeader />

        {/* Navigation */}
        <StoreNavbar />

        {/* Content from other team members */}
        <main id="main-content" className="w-full flex-1">
          <Outlet />
        </main>

        {/* Footer */}
        <StoreFooter />
        <ChatWidget />
      </div>
    </StorefrontUiContext.Provider>
  );
}
