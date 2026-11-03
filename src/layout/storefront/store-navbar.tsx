import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

import { StoreDepartmentsMenu } from './store-departments-menu';
import { LogoutButton } from '@/features/auth/components/logout-button';
import { useAuthStore } from '@/stores/auth.store';

export function StoreNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const customer = useAuthStore(
    (state) => state.user?.accountType === 'customer'
  );

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <nav
      className="relative z-40 w-full bg-[#55b000]"
      aria-label="Điều hướng cửa hàng"
    >
      <div className="store-container">
        <div className="flex min-h-14 items-center">
          {/* ALL DEPARTMENTS */}
          <div className="hidden shrink-0 lg:block">
            <StoreDepartmentsMenu />
          </div>

          {/* DESKTOP LINKS */}
          <div className="hidden h-14 min-w-0 flex-1 grid-cols-[1fr_1px_1fr_1px_1fr_1px_1fr] items-center lg:grid">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex h-full min-w-0 items-center justify-center text-center text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white ${isActive ? 'text-black' : 'text-white/90 hover:text-black'}`
              }
            >
              TRANG CHỦ
            </NavLink>

            <span aria-hidden="true" className="h-4 w-px bg-white/40" />

            <NavLink
              to="/shop"
              className={({ isActive }) =>
                `flex h-full min-w-0 items-center justify-center text-center text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white ${isActive ? 'text-black' : 'text-white/90 hover:text-black'}`
              }
            >
              KHÁM PHÁ
            </NavLink>

            <span aria-hidden="true" className="h-4 w-px bg-white/40" />

            <NavLink
              to="/bai-viet?type=news"
              className={({ isActive }) =>
                `flex h-full min-w-0 items-center justify-center text-center text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white ${isActive ? 'text-black' : 'text-white/90 hover:text-black'}`
              }
            >
              TIN TỨC
            </NavLink>

            <span aria-hidden="true" className="h-4 w-px bg-white/40" />

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `flex h-full min-w-0 items-center justify-center text-center text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white ${isActive ? 'text-black' : 'text-white/90 hover:text-black'}`
              }
            >
              LIÊN HỆ
            </NavLink>
          </div>

          {/* MOBILE NAVBAR */}
          <div className="flex h-14 w-full items-center justify-between lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen((previous) => !previous)}
              aria-label={
                mobileOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'
              }
              aria-expanded={mobileOpen}
              aria-controls="store-mobile-menu"
              className="rounded-md p-2 text-white hover:bg-white/15"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            {customer && (
              <LogoutButton
                redirectTo="/thanh-vien?act=login"
                showLabel
                className="border-white/40 bg-transparent text-white hover:bg-white/15 hover:text-white dark:border-white/40 dark:bg-transparent"
              />
            )}
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileOpen && (
          <div
            id="store-mobile-menu"
            className="border-t border-white/20 pb-4 lg:hidden"
          >
            <div className="space-y-1 py-3">
              <div className="px-1 py-2">
                <StoreDepartmentsMenu />
              </div>
              <NavLink
                to="/"
                end
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `block rounded-md px-4 py-3 text-center text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-white ${isActive ? 'text-black' : 'text-white/90 hover:bg-white/15'}`
                }
              >
                TRANG CHỦ
              </NavLink>

              <NavLink
                to="/shop"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `block rounded-md px-4 py-3 text-center text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-white ${isActive ? 'text-black' : 'text-white/90 hover:bg-white/15'}`
                }
              >
                KHÁM PHÁ
              </NavLink>

              <NavLink
                to="/bai-viet?type=news"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `block rounded-md px-4 py-3 text-center text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-white ${isActive ? 'text-black' : 'text-white/90 hover:bg-white/15'}`
                }
              >
                TIN TỨC
              </NavLink>

              <NavLink
                to="/contact"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `block rounded-md px-4 py-3 text-center text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-white ${isActive ? 'text-black' : 'text-white/90 hover:bg-white/15'}`
                }
              >
                LIÊN HỆ
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
