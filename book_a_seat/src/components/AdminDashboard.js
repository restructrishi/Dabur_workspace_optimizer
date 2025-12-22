import React, { useState, useEffect, useContext } from 'react';
import axios from '../api/axios';
import AuthContext from '../context/AuthProvider';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faKey, faUser, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

const ElementStyle = styled.div`
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;

  h2 {
    font-family: 'Playfair Display', serif;
    color: #1a4d2e;
    margin-bottom: 24px;
  }

  h4 {
    font-family: 'Outfit', sans-serif;
    color: #D1A272;
    margin-top: 32px;
    margin-bottom: 16px;
    border-bottom: 1px solid rgba(209, 162, 114, 0.3);
    padding-bottom: 8px;
  }

  .glass-panel {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px);
    border-radius: 16px;
    padding: 24px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 4px 16px rgba(0,0,0,0.05);
    margin-bottom: 24px;
  }

  .table-responsive {
    border-radius: 12px;
    overflow: hidden;
  }

  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
  }

  th {
    background: #1a4d2e;
    color: white;
    padding: 12px 16px;
    font-weight: 500;
    text-align: left;
    font-size: 14px;
  }

  td {
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.5);
    border-bottom: 1px solid rgba(0,0,0,0.05);
    font-size: 14px;
    color: #333;
  }

  tr:last-child td {
    border-bottom: none;
  }

  .action-btn {
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    
    &.delete {
      background: rgba(220, 53, 69, 0.1);
      color: #dc3545;
      &:hover {
        background: #dc3545;
        color: white;
      }
    }

    &.reset {
      background: rgba(209, 162, 114, 0.1);
      color: #b88655;
      &:hover {
        background: #D1A272;
        color: white;
      }
    }
  }

  .stat-card {
    display: inline-block;
    padding: 16px 24px;
    background: linear-gradient(135deg, #1a4d2e 0%, #2a6f45 100%);
    color: white;
    border-radius: 12px;
    margin-right: 16px;
    box-shadow: 0 4px 12px rgba(26, 77, 46, 0.2);

    .count {
      font-size: 32px;
      font-weight: 700;
      font-family: 'Playfair Display', serif;
    }
    
    .label {
      opacity: 0.8;
      font-size: 14px;
    }
  }
`;

export default function AdminDashboard() {
    const { token } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [showResetModal, setShowResetModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');

    const fetchData = async () => {
        try {
            // Fetch Users
            const usersRes = await axios.get('/api/users');
            setUsers(usersRes.data.users || []);

            // Fetch All Reservations
            const resRes = await axios.get('/api/admin/reservations');
            setReservations(resRes.data.rslt || []);
        } catch (err) {
            console.error("Failed to fetch admin data", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteReservation = async (id) => {
        if (!window.confirm('Are you sure you want to delete this booking?')) return;
        try {
            await axios.delete(`/api/reservations?id=${id}`);
            fetchData(); // Refresh
        } catch (err) {
            console.error("Failed to delete", err);
        }
    };

    const openResetModal = (user) => {
        setSelectedUser(user);
        setNewPassword('');
        setShowResetModal(true);
    };

    const handleResetPassword = async () => {
        if (!newPassword || !selectedUser) return;
        try {
            await axios.post('/api/reset-password', {
                username: selectedUser.username,
                newPassword
            });
            setShowResetModal(false);
            alert(`Password for ${selectedUser.username} has been reset.`);
        } catch (err) {
            console.error("Failed to reset password", err);
        }
    };

    if (token.role !== 'admin') return null;

    return (
        <ElementStyle>
            <div className="flex items-center justify-between mb-8">
                <h2>Admin Dashboard</h2>
                <div className="flex gap-4">
                    <div className="stat-card">
                        <div className="count">{users.length}</div>
                        <div className="label">Total Users</div>
                    </div>
                    <div className="stat-card" style={{ background: 'linear-gradient(135deg, #D1A272 0%, #e0b486 100%)' }}>
                        <div className="count">{reservations.length}</div>
                        <div className="label">Active Bookings</div>
                    </div>
                </div>
            </div>

            <div className="glass-panel">
                <h4><FontAwesomeIcon icon={faUser} className="mr-2" /> Registered Users</h4>
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u, idx) => (
                                <tr key={idx}>
                                    <td>{u.username}</td>
                                    <td><span className={`badge ${u.role === 'admin' ? 'bg-warning text-dark' : 'bg-success'}`}>{u.role}</span></td>
                                    <td>
                                        <button className="action-btn reset" onClick={() => openResetModal(u)}>
                                            <FontAwesomeIcon icon={faKey} /> Reset Password
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="glass-panel">
                <h4><FontAwesomeIcon icon={faCalendarCheck} className="mr-2" /> All Reservations</h4>
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Seat ID</th>
                                <th>User</th>
                                <th>Start Time</th>
                                <th>End Time</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.length === 0 ? (
                                <tr><td colSpan="5" className="text-center">No active bookings found.</td></tr>
                            ) : (
                                reservations.map((r, idx) => (
                                    <tr key={idx}>
                                        <td>{r.seatid}</td>
                                        <td>{r.username}</td>
                                        <td>{new Date(r.startdate).toLocaleString()}</td>
                                        <td>{new Date(r.enddate).toLocaleString()}</td>
                                        <td>
                                            <button className="action-btn delete" onClick={() => handleDeleteReservation(r._id)}>
                                                <FontAwesomeIcon icon={faTrash} /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={showResetModal} onHide={() => setShowResetModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Reset Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>New Password for <strong>{selectedUser?.username}</strong></Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowResetModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleResetPassword} style={{ background: '#1a4d2e', border: 'none' }}>
                        Update Password
                    </Button>
                </Modal.Footer>
            </Modal>

        </ElementStyle>
    );
}
