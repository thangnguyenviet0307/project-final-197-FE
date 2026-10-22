import { Heart, ShoppingBag, Search, MapPin, Headphones, ChevronDown, Menu, ChevronRight, User, Truck, LogIn, Grid2X2, Laptop, Camera, Smartphone, Printer, Monitor, Speaker, Sparkles, Trophy } from "lucide-react"
import { useState } from "react"
import { Link, NavLink, useNavigate, useSearchParams, useLocation } from "react-router-dom"
import { categories, categoryUrl, money } from "@/features/storefront/catalog"
import { getCartLines } from "@/features/storefront/product-options"
import { useStorefront } from "@/features/storefront/store"

const departments = [
  { icon: Sparkles, name: "New Arrivals", to: "/shop" },
  { icon: Trophy, name: "Top 100 Best Seller", to: "/shop?sort=rating" },
  { icon: Monitor, name: "Tv & Video", category: "Electronics" },
  { icon: Speaker, name: "Home Audio & Theater", category: "Headphones" },
  { icon: Laptop, name: "Cell Phones & Laptop", category: "Electronics" },
  { icon: Camera, name: "Camera, Photo & Video", category: "Camera & Video" },
  { icon: Headphones, name: "Headphones", category: "Headphones" },
  { icon: Smartphone, name: "Smart phone & Tablets", category: "Electronics" },
  { icon: Printer, name: "Fax machine", category: "Accessories" },
  { icon: Printer, name: "Printer", category: "Electronics" },
]

export function StorefrontHeader() {
  const [params] = useSearchParams()
  const [query, setQuery] = useState(params.get("q") ?? "")
  const [category, setCategory] = useState("")
  const navigate = useNavigate()
  const { cart, wishlist, apiProducts } = useStorefront()
  const lines = getCartLines(cart, apiProducts)
  const count = lines.reduce((sum, line) => sum + line.quantity, 0)
  const total = lines.reduce((sum, line) => sum + line.price * line.quantity, 0)
  return <>
    <div className="sf-topbar"><div className="sf-container">
      <div><span>English <ChevronDown size={10} /></span><span>USD <ChevronDown size={10} /></span></div>
      <div><Link to="/contact"><MapPin size={14} /> Store Direction</Link><Link to="/contact"><Truck size={15} /> Track Your Order</Link><Link to="/contact"><User size={14} /> Create Account</Link><Link to="/login"><LogIn size={14} /> Login</Link></div>
    </div></div>
    <header className="sf-header sf-container">
      <Link to="/" className="sf-logo" aria-label="Amanto — Trang chủ"><img src="/storefront/amanto/logo.png" alt="amanto" width={230} height={53} /></Link>
      <form className="sf-search" role="search" onSubmit={event => { event.preventDefault(); const search = new URLSearchParams(); if (query.trim()) search.set("q", query.trim()); if (category) search.set("category", category); navigate(`/shop?${search}`) }}>
        <select aria-label="Danh mục tìm kiếm" value={category} onChange={event => setCategory(event.target.value)}><option value="">All categories</option>{categories.map(item => <option key={item}>{item}</option>)}</select>
        <input aria-label="Tìm kiếm sản phẩm" placeholder="Search keyword, category, brand or part" value={query} onChange={event => setQuery(event.target.value)} />
        <button aria-label="Tìm kiếm"><Search size={24} /></button>
      </form>
      <div className="sf-header-actions"><Link className="sf-icon-link" to="/wishlist" aria-label={`Yêu thích: ${wishlist.length} sản phẩm`}><Heart size={28} /><span>{wishlist.length}</span></Link><Link className="sf-cart-link" to="/cart" aria-label={`Giỏ hàng: ${count} sản phẩm`}><div className="sf-icon-link"><ShoppingBag size={29} /><span>{count}</span></div><strong>{money(total)}</strong></Link></div>
    </header>
  </>
}

export function StorefrontNavbar() {
  const { pathname } = useLocation()
  const [menu, setMenu] = useState<{ path: string; open: boolean } | null>(null)
  const homepage = pathname === "/"
  const menuOpen = menu?.path === pathname ? menu.open : homepage && window.innerWidth >= 992
  return <div className="sf-nav-wrap"><nav className="sf-container sf-nav" aria-label="Điều hướng chính">
    <div className="am-departments">
      <button className="am-department-toggle" aria-expanded={menuOpen} aria-controls="am-department-menu" onClick={() => setMenu({ path: pathname, open: !menuOpen })}><Menu size={20} />All Departments<ChevronDown size={14} /></button>
      {menuOpen && <div id="am-department-menu" className="am-department-menu">{departments.map(({ icon: Icon, name, to, category: itemCategory }) => <Link to={to ?? categoryUrl(itemCategory!)} key={name} onClick={() => setMenu({ path: pathname, open: false })}><Icon size={17} strokeWidth={1.3} /><span>{name}</span><ChevronRight size={12} /></Link>)}<Link to="/shop"><Grid2X2 size={17} strokeWidth={1.3} /><span>All Categories</span><ChevronRight size={12} /></Link></div>}
    </div>
    <div className="sf-nav-links">
      <NavLink to="/" end className="am-nav-home">Home <ChevronDown size={11} /><b>HOT</b></NavLink>
      <NavLink to="/shop" aria-label="Sản phẩm">Shop <ChevronDown size={11} /></NavLink>
      <div className="am-megamenu"><button>Megamenu <ChevronDown size={11} /><b>NEW</b></button><div className="am-megamenu-panel">{categories.map(item => <Link to={categoryUrl(item)} key={item}>{item}</Link>)}</div></div>
      <div className="am-megamenu"><button>Pages <ChevronDown size={11} /></button><div className="am-megamenu-panel"><Link to="/wishlist">My Wishlist</Link><Link to="/cart">Shopping Cart</Link><Link to="/contact">About Us</Link></div></div>
      <div className="am-megamenu"><button type="button">Blog <ChevronDown size={11} /></button><div className="am-megamenu-panel"><p className="px-2 py-3 text-xs text-neutral-500">Articles are coming soon.</p></div></div>
      <NavLink to="/contact">Contact Us</NavLink>
    </div>
    <a className="sf-hotline" href="tel:0800657972"><Headphones size={28} strokeWidth={1.4} /><strong>0 (800) 657 - 972</strong></a>
  </nav></div>
}
