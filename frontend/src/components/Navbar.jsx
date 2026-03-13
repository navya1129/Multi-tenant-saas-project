import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(path);

  const navLinkStyle = (path) => ({
    textDecoration: 'none',
    color: isActive(path) ? 'var(--primary)' : 'var(--text-secondary)',
    fontWeight: isActive(path) ? '600' : '500',
    padding: '0.5rem 0',
    borderBottom: isActive(path) ? '2px solid var(--primary)' : '2px solid transparent',
    transition: 'var(--transition)'
  });

  return (
    <nav style={{ 
      background: 'rgba(255, 255, 255, 0.8)', 
      backdropFilter: 'blur(12px)',
      padding: '0.75rem 2rem', 
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      marginBottom: '2rem'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--primary) 0%, #818CF8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>S</div>
            <span style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1.25rem', letterSpacing: '-0.025em' }}>SaaSPlatform</span>
          </Link>
          {user && (
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '4px' }}>
              <Link to="/dashboard" style={navLinkStyle('/dashboard')}>Dashboard</Link>
              <Link to="/projects" style={navLinkStyle('/projects')}>Projects</Link>
              {(user.role === 'tenant_admin' || user.role === 'super_admin') && (
                <Link to="/users" style={navLinkStyle('/users')}>Users</Link>
              )}
              {user.role === 'super_admin' && (
                <Link to="/tenants" style={navLinkStyle('/tenants')}>Tenants</Link>
              )}
            </div>
          )}
        </div>
        
        {user && (
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              style={{ 
                background: 'var(--bg-color)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '9999px',
                padding: '0.375rem 0.75rem 0.375rem 0.375rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1.1' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>{user.fullName}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user.role}</span>
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginLeft: '0.25rem' }}>▼</span>
            </button>
            {showMenu && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 0.5rem)',
                background: 'var(--surface-color)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem',
                minWidth: '200px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 1000,
                animation: 'slideUp 0.2s ease-out'
              }}>
                <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
                  <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>{user.email}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  style={{ 
                    width: '100%', 
                    textAlign: 'left', 
                    padding: '0.5rem 0.75rem',
                    background: 'none',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    color: 'var(--danger)',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'var(--transition)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

