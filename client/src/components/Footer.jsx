import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-t from-app to-surface border-t border-app mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="text-3xl font-extrabold text-primary tracking-tight flex items-center gap-1">
              Flit<span className="text-foreground">Store</span>
            </div>
            <p className="mt-3 text-base text-muted leading-6">
              Premium shopping experience with trusted products, secure payments, and fast delivery.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" aria-label="Twitter" className="hover:text-primary transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.59-2.47.7a4.3 4.3 0 001.88-2.37 8.59 8.59 0 01-2.72 1.04A4.28 4.28 0 0016.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 9.13 4.07 7.38 1.64 4.7c-.37.64-.58 1.39-.58 2.19 0 1.51.77 2.85 1.95 3.63-.72-.02-1.4-.22-1.99-.55v.06c0 2.11 1.5 3.87 3.5 4.27-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.7 2.12 2.94 3.99 2.97A8.6 8.6 0 012 19.54c-.29 0-.57-.02-.85-.05A12.13 12.13 0 007.29 21c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.36-.02-.54A8.18 8.18 0 0024 4.59a8.36 8.36 0 01-2.54.7z" /></svg></a>
              <a href="#" aria-label="Instagram" className="hover:text-primary transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zm8.75 2.25a1 1 0 110 2 1 1 0 010-2zM12 7.25A4.75 4.75 0 1112 16.75a4.75 4.75 0 010-9.5zm0 1.5a3.25 3.25 0 100 6.5 3.25 3.25 0 000-6.5z" /></svg></a>
              <a href="#" aria-label="Facebook" className="hover:text-primary transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24H12.82v-9.294H9.692v-3.622h3.127V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0" /></svg></a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-extrabold uppercase tracking-widest text-muted">Explore</h4>
            <ul className="mt-4 space-y-2 text-base">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/cart" className="hover:text-primary transition-colors">Cart</Link></li>
              <li><Link to="/login" className="hover:text-primary transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-primary transition-colors">Create Account</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-extrabold uppercase tracking-widest text-muted">Support</h4>
            <ul className="mt-4 space-y-2 text-base">
              <li><span className="hover:text-primary transition-colors cursor-pointer">Help Center</span></li>
              <li><span className="hover:text-primary transition-colors cursor-pointer">Shipping & Returns</span></li>
              <li><span className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-primary transition-colors cursor-pointer">Terms of Service</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-extrabold uppercase tracking-widest text-muted">Contact</h4>
            <div className="mt-4 space-y-2 text-base text-muted">
              <p>support@flitstore.com</p>
              <p>+91 9909345049</p>
              <p>Mon–Sat, 9am–6pm</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-app flex flex-col md:flex-row items-center justify-between gap-4 text-base text-muted">
          <p>© 2026 FlitStore. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-muted">Powered by FlitStore</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
