import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, tenantAPI } from '../services/api';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'user',
    isActive: true,
  });

  useEffect(() => {
    if (user && user.tenantId) {
      loadTenant();
      loadUsers();
    }
  }, [user]);

  const loadTenant = async () => {
    try {
      const response = await tenantAPI.getTenant(user.tenantId);
      setTenant(response.data.data);
    } catch (err) {
      console.error('Error loading tenant:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userAPI.listUsers(user.tenantId);
      setUsers(response.data.data.users);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await userAPI.updateUser(editingUser.id, {
          fullName: formData.fullName,
          role: formData.role,
          isActive: formData.isActive,
        });
      } else {
        await userAPI.addUser(user.tenantId, formData);
        // The backend will now automatically dispatch an email to the user via Nodemailer
        // No frontend simulation needed anymore!
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({ email: '', password: '', fullName: '', role: 'user', isActive: true });
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    }
  };

  const handleEdit = (userToEdit) => {
    setEditingUser(userToEdit);
    setFormData({
      email: userToEdit.email,
      password: '',
      fullName: userToEdit.fullName,
      role: userToEdit.role,
      isActive: userToEdit.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await userAPI.deleteUser(userId);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading user directory...</div>
      </div>
    );
  }

  if (user?.role !== 'tenant_admin' && user?.role !== 'super_admin') {
    return (
      <div className="container">
        <div style={{ padding: '2rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Access Denied</h2>
          <p>Only tenant administrators can manage users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Users & Permissions</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Manage your team members and their roles.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {tenant && (
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>Seats Used</span>
              <span style={{ fontSize: '1.125rem', fontWeight: 700, color: users.length >= tenant.maxUsers ? 'var(--danger)' : 'var(--text-primary)' }}>
                {users.length} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>/ {tenant.maxUsers}</span>
              </span>
            </div>
          )}
          <button className="btn btn-primary" onClick={() => { setEditingUser(null); setFormData({ email: '', password: '', fullName: '', role: 'user', isActive: true }); setShowModal(true); }} disabled={tenant && users.length >= tenant.maxUsers}>
            + Add Member
          </button>
        </div>
      </div>

      {error && <div className="error" style={{ marginBottom: '1.5rem', padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

      {users.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No users found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Add team members to start collaborating.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Invite Status</th>
                  <th>Account Status</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(userItem => (
                  <tr key={userItem.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary)' }}>
                          {userItem.fullName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{userItem.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{userItem.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${userItem.role === 'tenant_admin' ? 'info' : 'secondary'}`}>
                        {userItem.role === 'tenant_admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td>
                      {userItem.invitationStatus === 'pending' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="badge badge-warning" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }}>
                            Email Sent (Pending)
                          </span>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                            onClick={async () => {
                              await userAPI.acceptInvite(userItem.id);
                              loadUsers();
                            }}
                            title="Mock user clicking 'Accept' in their email"
                          >
                            Mock Accept
                          </button>
                        </div>
                      ) : (
                        <span className="badge badge-success">Accepted</span>
                      )}
                    </td>
                    <td>
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.375rem',
                        fontSize: '0.875rem',
                        color: userItem.isActive ? 'var(--success)' : 'var(--text-secondary)',
                        fontWeight: 500
                      }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
                        {userItem.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{new Date(userItem.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-secondary" onClick={() => handleEdit(userItem)} style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', marginRight: '0.5rem' }}>
                        Edit
                      </button>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => handleDelete(userItem.id)} 
                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'transparent', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? 'Edit User' : 'Add New Member'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              {!editingUser && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@company.com"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Temporary Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      required={!editingUser}
                      minLength={8}
                    />
                  </div>
                </div>
              )}
              
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Jane Doe"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Access Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="user">Member (Standard Access)</option>
                  <option value="tenant_admin">Admin (Full Access)</option>
                </select>
              </div>
              
              {editingUser && (
                <div className="form-group" style={{ 
                  marginTop: '1.5rem', 
                  padding: '1rem', 
                  backgroundColor: 'var(--bg-color)', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <input
                    type="checkbox"
                    id="userActiveToggle"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                  />
                  <label htmlFor="userActiveToggle" style={{ margin: 0, cursor: 'pointer', fontWeight: 600 }}>
                    Account is Active
                  </label>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingUser ? 'Save Changes' : 'Send Invite'}</button>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;

