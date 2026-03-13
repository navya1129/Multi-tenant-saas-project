import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectAPI, taskAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const projectsRes = await projectAPI.listProjects({ limit: 5 });
      setRecentProjects(projectsRes.data.data.projects);
      setStats(prev => ({ ...prev, totalProjects: projectsRes.data.data.total }));

      const allTasks = [];
      for (const project of projectsRes.data.data.projects) {
        try {
          const tasksRes = await taskAPI.listTasks(project.id);
          allTasks.push(...tasksRes.data.data.tasks);
        } catch (err) {
          console.error('Error loading tasks:', err);
        }
      }

      const completed = allTasks.filter(t => t.status === 'completed').length;
      setStats(prev => ({
        ...prev,
        totalTasks: allTasks.length,
        completedTasks: completed,
        pendingTasks: allTasks.length - completed,
      }));

      if (user && user.id) {
        const myTasksList = allTasks.filter(t => t.assignedTo?.id === user.id);
        setMyTasks(myTasksList.slice(0, 10));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading your workspace...</div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Projects', value: stats.totalProjects, color: 'var(--primary)', bgColor: 'rgba(79, 70, 229, 0.1)' },
    { title: 'Total Tasks', value: stats.totalTasks, color: 'var(--info)', bgColor: 'rgba(59, 130, 246, 0.1)' },
    { title: 'Completed Tasks', value: stats.completedTasks, color: 'var(--success)', bgColor: 'rgba(16, 185, 129, 0.1)' },
    { title: 'Pending Tasks', value: stats.pendingTasks, color: 'var(--warning)', bgColor: 'rgba(245, 158, 11, 0.1)' },
  ];

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Overview</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Welcome back, {user.fullName.split(' ')[0]}</p>
        </div>
        <Link to="/projects" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
          + New Project
        </Link>
      </div>

      {/* Statistics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        {statCards.map((stat, idx) => (
          <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', padding: '1.5rem', marginBottom: 0 }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: stat.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: stat.color, borderRadius: '4px' }}></div>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>{stat.title}</p>
              <h3 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--text-primary)' }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }}>
        {/* Recent Projects */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Recent Projects</h2>
            <Link to="/projects" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500' }}>View All →</Link>
          </div>
          
          {recentProjects.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <p>No projects yet.</p>
              <Link to="/projects" className="btn btn-primary" style={{ marginTop: '1rem' }}>Create your first project</Link>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Status</th>
                    <th>Tasks</th>
                    <th>Created On</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recentProjects.map(project => (
                    <tr key={project.id}>
                      <td style={{ fontWeight: 500 }}>{project.name}</td>
                      <td>
                        <span className={`badge badge-${project.status === 'active' ? 'success' : 'warning'}`}>
                          {project.status}
                        </span>
                      </td>
                      <td><span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>{project.taskCount}</span></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to={`/projects/${project.id}`} className="btn btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* My Tasks */}
        {myTasks.length > 0 && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>My Tasks</h2>
            </div>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Task Title</th>
                    <th>Project</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {myTasks.map(task => (
                    <tr key={task.id}>
                      <td style={{ fontWeight: 500 }}>{task.title}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {recentProjects.find(p => p.id === task.projectId)?.name || 'N/A'}
                      </td>
                      <td>
                        <span className={`badge badge-${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'info'}`}>
                          {task.priority || 'high'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${task.status === 'completed' ? 'success' : 'warning'}`}>
                          {task.status || 'todo'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

