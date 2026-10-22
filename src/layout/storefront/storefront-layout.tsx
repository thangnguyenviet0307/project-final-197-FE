import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { StorefrontHeader, StorefrontNavbar } from "./header";
import { StorefrontFooter } from "./footer";
import "./storefront.css";
import "./amanto-theme.css";

export default function StorefrontLayout() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.title = "Amanto — Công nghệ cho cuộc sống";
  }, [pathname, search]);
  return (
    <div className="sf">
      <a href="#storefront-main" className="sf-skip">
        Đến nội dung chính
      </a>
      <StorefrontHeader />
      <StorefrontNavbar />
      <main id="storefront-main">
        <Outlet />
      </main>
      <StorefrontFooter />
    </div>
  );
}
