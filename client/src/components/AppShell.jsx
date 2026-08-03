import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiSearch, FiGrid, FiZap, FiMap, FiSun, FiMoon, FiLogOut, FiLogIn,
  FiMenu, FiX, FiUser,
} from 'react-icons/fi';
import { FaPlane } from 'react-icons/fa';
import useDarkMode from '../hooks/useDarkMode';
import useAuth from '../hooks/useAuth';
import '../styles/AppShell.css';

const NAV_ITEMS = [
  { to: '/', label: 'Search Flights', icon: FiSearch, match: (p) => p === '/' },
  { to: '/dashboard', label: 'Dashboard', icon: FiGrid, match: (p) => p.startsWith('/dashboard') || p.startsWith('/manual-flights') },
  { to: '/predictions', label: 'Price Predictions', icon: FiZap, match: (p) => p.startsWith('/predictions') },
  { to: '/heatmap', label: 'Popular Routes', icon: FiMap, match: (p) => p.startsWith('/heatmap') },
];

function Brand({ compact }) {
  return (
    <div className="sl-brand">
      <div className="sl-brand-mark"><FaPlane size={14} /></div>
      {!compact && <span className="sl-brand-name">Skylink</span>}
    </div>
  );
}

export default function AppShell({ children }) {
  const [dark, setDark] = useDarkMode();
  const { userId, refresh } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await fetch('/api/users/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // ignore
    }
    localStorage.removeItem('userId');
    await refresh();
    navigate('/login');
  };

  return (
    <div className="sl-shell">
      <aside className="sl-sidebar">
        <div className="sl-sidebar-header">
          <Brand />
        </div>
        <nav className="sl-nav">
          <p className="sl-nav-heading">Main</p>
          {NAV_ITEMS.map((item) => {
            const active = item.match(location.pathname);
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to} className={`sl-nav-item ${active ? 'active' : ''}`}>
                <Icon size={15} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="sl-sidebar-footer">
          <button className="sl-nav-item" onClick={() => setDark(!dark)}>
            {dark ? <FiSun size={15} /> : <FiMoon size={15} />}
            {dark ? 'Light mode' : 'Dark mode'}
          </button>
          {userId ? (
            <button className="sl-nav-item" onClick={handleSignOut}>
              <FiLogOut size={15} />
              Sign out
            </button>
          ) : (
            <Link className="sl-nav-item" to="/login">
              <FiLogIn size={15} />
              Sign in
            </Link>
          )}
          <div className="sl-user-row">
            <div className="sl-avatar"><FiUser size={13} /></div>
            <div className="sl-user-meta">
              <p className="sl-user-name">{userId ? `User #${userId}` : 'Guest'}</p>
              <p className="sl-user-sub">{userId ? 'Signed in' : 'Not signed in'}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="sl-main">
        <header className="sl-topbar sl-mobile-only">
          <button className="sl-icon-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <FiMenu size={18} />
          </button>
          <Brand compact />
          <div className="sl-topbar-spacer" />
          <button className="sl-icon-btn" onClick={() => setDark(!dark)} aria-label="Toggle theme">
            {dark ? <FiSun size={16} /> : <FiMoon size={16} />}
          </button>
        </header>

        <main className="sl-content">{children}</main>

        <nav className="sl-mobile-tabbar sl-mobile-only">
          {NAV_ITEMS.map((item) => {
            const active = item.match(location.pathname);
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to} className={`sl-tab-item ${active ? 'active' : ''}`}>
                <Icon size={17} />
              </Link>
            );
          })}
        </nav>
      </div>

      {mobileOpen && (
        <div className="sl-drawer-overlay" onClick={() => setMobileOpen(false)}>
          <div className="sl-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="sl-sidebar-header">
              <Brand />
              <button className="sl-icon-btn" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <FiX size={18} />
              </button>
            </div>
            <nav className="sl-nav">
              {NAV_ITEMS.map((item) => {
                const active = item.match(location.pathname);
                const Icon = item.icon;
                return (
                  <Link key={item.to} to={item.to} className={`sl-nav-item ${active ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
                    <Icon size={15} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="sl-sidebar-footer">
              {userId ? (
                <button className="sl-nav-item" onClick={handleSignOut}>
                  <FiLogOut size={15} />
                  Sign out
                </button>
              ) : (
                <Link className="sl-nav-item" to="/login" onClick={() => setMobileOpen(false)}>
                  <FiLogIn size={15} />
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}