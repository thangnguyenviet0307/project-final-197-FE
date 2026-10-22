import { useState } from "react"
import { ArrowUp, Mail } from "lucide-react"
import { Facebook, Instagram, Twitter, Youtube } from "@/components/icons/brand-icons"
import { Link } from "react-router-dom"

export function StorefrontFooter() {
  const [notice, setNotice] = useState("")
  return <footer className="sf-footer am-footer">
    <button className="am-back-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top"><ArrowUp size={18} /><span>TOP</span></button>
    <div className="sf-container am-footer-grid">
      <div className="am-footer-about"><Link to="/" className="sf-logo"><img src="/storefront/amanto/logo_trang.png" alt="amanto" width={230} height={53} /></Link><p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas..</p><p>E : <a href="mailto:hello@cbox2.com">hello@cbox2.com</a><br />UK : (303) 795-0928<br />International : +44203 788 7842</p><h3>Follow us</h3><div className="am-social-links"><a href="https://www.facebook.com/" aria-label="Facebook"><Facebook width={17} height={17} /></a><a href="https://www.instagram.com/" aria-label="Instagram"><Instagram width={17} height={17} /></a><a href="https://twitter.com/" aria-label="Twitter"><Twitter width={17} height={17} /></a><a href="https://www.youtube.com/" aria-label="YouTube"><Youtube width={17} height={17} /></a></div></div>
      <div><h3>ABOUT US</h3><Link to="/contact">Harman Corporate</Link><Link to="/contact">Careers</Link><Link to="/contact">Privacy Policy</Link><Link to="/contact">Terms of Use</Link><Link to="/contact">Why Buy Direct</Link><a href="#am-newsletter">Newsletter</a></div>
      <div><h3>SUPPORT</h3><Link to="/contact">Customer Support</Link><Link to="/contact#shipping">Shipping Policy</Link><Link to="/contact#shipping">Returns</Link><Link to="/contact">Order Status</Link><Link to="/contact">Bulk Purchase Form</Link><Link to="/contact">Contact Us</Link><Link to="/cart">Giỏ hàng của bạn</Link></div>
      <div id="am-newsletter"><h3>NEWLETTERS</h3><p>Learn about events, contests, designing tips and more? Of course you do!</p><form className="am-subscribe" onSubmit={event => { event.preventDefault(); setNotice("Demo only — newsletter registration is not connected yet.") }}><input type="email" required aria-label="Newsletter email" placeholder="Your email address" /><button aria-label="Subscribe"><Mail size={20} /></button></form>{notice && <p role="status">{notice}</p>}<h3 className="am-accept-heading">We Accept</h3><div className="sf-payment"><span>VISA</span><span>Mastercard</span><span>PayPal</span><span>Discover</span></div></div>
    </div>
    <div className="am-footer-bottom"><div className="sf-container"><span>© Copyright 2019 by EngoTheme. All Rights Reserved</span><div><Link to="/contact">ABOUT</Link><Link to="/contact">CUSTOMER SERVICE</Link><Link to="/contact">PRIVACY POLICY</Link><Link to="/contact">TERMS</Link></div></div></div>
  </footer>
}
