import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';

const MockEmail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');

  const handleAccept = async () => {
    setAccepting(true);
    setError('');
    
    try {
      await userAPI.acceptInvite(userId);
      
      setTimeout(() => {
        // Log out current admin if they are accidentally still logged in using the same browser
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login page and trigger a full reset
        navigate('/login');
        window.location.reload(); 
      }, 1500);
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to accept invitation. It may be invalid.');
      setAccepting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '450px', width: '100%', backgroundColor: 'white', padding: '3rem 2rem', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', textAlign: 'center' }}>
        
        <div style={{ width: '64px', height: '64px', backgroundColor: '#4f46e5', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: '0 auto 1.5rem auto' }}>
          S
        </div>
        
        <h1 style={{ fontSize: '1.5rem', color: '#111827', marginBottom: '1rem', fontWeight: 700 }}>
          Welcome to SaaSPlatform
        </h1>
        
        <p style={{ color: '#4b5563', lineHeight: '1.6', marginBottom: '2rem' }}>
          You have been invited to join a collaborative workspace. Click the button below to accept your invitation and activate your account.
        </p>
        
        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <button 
          onClick={handleAccept}
          disabled={accepting}
          style={{ 
            backgroundColor: '#4f46e5', 
            color: 'white', 
            padding: '1rem 2rem', 
            borderRadius: '6px', 
            border: 'none', 
            fontSize: '1rem', 
            fontWeight: 600, 
            cursor: accepting ? 'not-allowed' : 'pointer',
            width: '100%',
            opacity: accepting ? 0.7 : 1,
            transition: 'background-color 0.2s',
            boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.1)'
          }}
        >
          {accepting ? 'Activating Account...' : 'Accept Invitation & Login'}
        </button>
        
        <div style={{ marginTop: '2rem', color: '#9ca3af', fontSize: '0.75rem' }}>
          Secure, multi-tenant infrastructure.<br />
          © 2026 SaaSPlatform. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default MockEmail;
