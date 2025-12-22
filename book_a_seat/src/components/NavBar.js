import React, { useContext, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import AuthContext from '../context/AuthProvider';
import styled from 'styled-components';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Diagram from './Diagram';
import ReservationList from './ReservationList';
import MyBooking from './MyBooking';
import AdminDashboard from './AdminDashboard';

const ElementStyle = styled.div`
  .navbar {
     /* Handled by global .header-bar now, but overriding bootstrap specifics */
     background: transparent !important; 
     padding: 0;
  }
  
  /* Ensure tabs look premium */
  .nav-tabs {
    border-bottom: 2px solid rgba(209, 162, 114, 0.2);
    
    .nav-link {
       color: #1a4d2e;
       font-family: 'Outfit', sans-serif;
       font-weight: 500;
       border: none;
       background: transparent;
       margin-bottom: -2px;
       border-bottom: 2px solid transparent;
       
       &:hover {
         color: #D1A272;
       }
       
       &.active {
         color: #D1A272;
         background: transparent;
         border-bottom: 2px solid #D1A272;
         font-weight: 600;
       }
    }
  }

  .user-logo {
     display: inline-flex;
     align-items: center;
     gap: 8px;
     color: #1a4d2e;
     font-weight: 600;
     font-family: 'Outfit', sans-serif;
     cursor: pointer;
     transition: opacity 0.3s;
     
     &:hover {
        opacity: 0.8;
     }
  }

  /* Glass Container for Main Content */
  .tabs-container {
    margin-top: 32px;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 32px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  }

  .tab-content {
    margin-top: 20px;
  }
`;

function NavBar() {
  const { token, setToken } = useContext(AuthContext);

  // Luxury User Dropdown Trigger
  const user = (
    <span className="user-logo">
      <span>{token.user}</span>
      <div className="w-8 h-8 rounded-full bg-[#1a4d2e] text-white flex items-center justify-center text-xs">
        <FontAwesomeIcon icon={faUser} />
      </div>
    </span>
  );

  const logout = function () {
    console.log('logout');
    setToken(null);
  };

  const [keyBooking, setKeyBooking] = useState(0);
  const [keyDiagram, setKeyDiagram] = useState(token.role === 'admin' ? 1 : 0);
  const [selSeat, setSelSeat] = useState(null);

  function onSelectChange(tabElName) {
    if (tabElName === 'reservation') {
      setSelSeat(null);
      setKeyDiagram(keyDiagram + 1);
    } else {
      setKeyBooking(keyBooking + 1);
    }
  }

  function setSelSeatHandler(id) {
    setSelSeat(id);
  }

  return (
    <ElementStyle>
      {/* Luxury Header Bar (Same structure as Login.js for consistency) */}
      <div className="header-bar">
        <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Brand */}
          <a href="/" className="flex items-center gap-3 no-underline group hover:opacity-90 transition">
            <img src="https://img.etimg.com/thumb/width-1600,height-900,imgsize-34944,resizemode-75,msid-105238348/industry/cons-products/fmcg/140-year-old-dabur-family-hits-trouble-as-it-reinvents-its-business.jpg" alt="Dabur Logo" className="logo-img" />
            <span className="brand-text">Dabur Workspace</span>
          </a>

          {/* Actions / User Profile */}
          <NavDropdown title={user} id="navbarScrollingDropdown" align="end">
            <NavDropdown.Item href="#" onClick={logout} className="text-sm">
              Logout
            </NavDropdown.Item>
          </NavDropdown>
        </div>
      </div>

      <Container className="tabs-container">
        <Tabs
          onSelect={(tabElName) => onSelectChange(tabElName)}
          defaultActiveKey={token.role === 'user' ? 'booking' : 'reservation'}
          className="mb-3"
          id="dashboard-tabs"
        >


          {token.role === 'user' && (
            <Tab eventKey="booking" title="My Booking">
              <div className="tab-content">
                <MyBooking username={token.user} key={keyBooking} />
              </div>
            </Tab>
          )}

          {token.role === 'admin' && (
            <Tab eventKey="admin-panel" title="Admin Panel">
              <div className="tab-content">
                <AdminDashboard />
              </div>
            </Tab>
          )}

          <Tab eventKey="reservation" title="New Reservation">
            <div className="tab-content">
              {/* Removed H2 as checking role isn't needed visually here */}
              {keyDiagram > 0 && (
                <div className="wrapper-dashboard" key={'diagram_' + keyDiagram}>
                  <Diagram setSelSeat={setSelSeatHandler} />
                  <ReservationList selSeat={selSeat} />
                </div>
              )}
            </div>
          </Tab>
        </Tabs>
      </Container>
    </ElementStyle>
  );
}

export default NavBar;