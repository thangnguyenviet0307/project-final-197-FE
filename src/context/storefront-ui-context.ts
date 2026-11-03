import { createContext } from 'react';

// React context follows portals, unlike CSS variables inherited from a layout DOM node.
export const StorefrontUiContext = createContext(false);
