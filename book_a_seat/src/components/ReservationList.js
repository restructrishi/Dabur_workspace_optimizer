import React, { useState, useEffect, useContext } from 'react';
import CalendarContainer from './CalendarContainer.js'
import Modal from './Modal.js'
import Alert from './Alert.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash, faPlus, faCalendarAlt, faClock } from '@fortawesome/free-solid-svg-icons'
import Button from 'react-bootstrap/Button'
import styled from 'styled-components'
import moment from 'moment'
import utils from '../api/utils.ts'
import AuthContext from '../context/AuthProvider'

const ElementStyle = styled.div`
  margin-top: 24px;
  width: 100%;
  max-width: 800px;
  animation: fadeIn 0.5s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .glass-panel {
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(12px);
    border-radius: 16px;
    padding: 24px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  }

  h4 {
    font-family: 'Playfair Display', serif;
    color: #1a4d2e;
    margin-bottom: 20px;
    border-bottom: 1px solid rgba(26, 77, 46, 0.1);
    padding-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .booking-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 400px;
    overflow-y: auto;
    padding-right: 8px;

    /* Custom Scrollbar */
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-track {
      background: rgba(0,0,0,0.05);
      border-radius: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(26, 77, 46, 0.2);
      border-radius: 4px;
    }
    &::-webkit-scrollbar-thumb:hover {
      background: rgba(26, 77, 46, 0.4);
    }
  }

  .booking-item {
    background: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(209, 162, 114, 0.2);
    border-radius: 12px;
    padding: 16px;
    transition: all 0.2s ease;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      background: rgba(255, 255, 255, 0.9);
      border-color: #D1A272;
    }

    &.selected {
      border-color: #1a4d2e;
      background: rgba(26, 77, 46, 0.05);
    }
  }

  .booking-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    .user {
      font-family: 'Outfit', sans-serif;
      font-weight: 600;
      color: #1a4d2e;
      font-size: 16px;
    }

    .time {
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      color: #666;
      display: flex;
      gap: 16px;
      align-items: center;
      
      span {
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }
  }

  .actions {
    display: flex;
    gap: 8px;
    
    button {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: all 0.2s;
      
      &.btn-edit {
        background: rgba(26, 77, 46, 0.1);
        color: #1a4d2e;
        &:hover { background: #1a4d2e; color: white; }
      }
      
      &.btn-delete {
        background: rgba(139, 21, 56, 0.1);
        color: #8B1538;
        &:hover { background: #8B1538; color: white; }
      }
      
      &.disabled {
        opacity: 0.3;
        cursor: not-allowed;
        &:hover { background: inherit; color: inherit; }
      }
    }
  }

  .add-btn-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
`;

function ReservationList(props) {
  const [isCalendarActive, setCalendarActive] = useState(false);
  const [selRow, setSelRow] = useState(null);
  const [childKey, setChildKey] = useState(0);
  const [idToDel, setIdToDel] = useState(null);
  const [showAlert, setShowAlert] = useState(null);
  const [showAlert2, setShowAlert2] = useState(null);
  const { token } = useContext(AuthContext);

  const [reservationData, setReservation] = useState([]);
  const currentDate = moment(new Date()).startOf('hour').add(1, 'hours').toDate();

  useEffect(() => {
    if (props.selSeat) loadData(props.selSeat);
  }, [props.selSeat]);

  // If Admin, do not render this component at all
  if (token.role === 'admin') return null;

  function loadData(selSeat) {
    const params = { selSeat: selSeat };
    const callback = function (r) {
      const rslt = r.map((val) => {
        if (typeof val.startdate === 'string') val.startDate = new Date(val.startdate);
        if (typeof val.enddate === 'string') val.endDate = new Date(val.enddate);
        // Fix for "Idundefined" - use _id or fallback
        val.name = val._id ? `Ref: ${String(val._id).slice(-4)}` : `Ref: New`;
        return val;
      });
      setReservation(rslt);
    }
    utils.getReservationDb(params, callback)
  }

  function onClickRow(_id) {
    setChildKey(_id);
    setCalendarActive(false);
    setSelRow(reservationData.find(item => item.id === _id));
  }

  function editRow(evt, _id) {
    evt.stopPropagation();
    setChildKey(_id);
    setCalendarActive(true);
    setSelRow(reservationData.find(item => item.id === _id));
  }

  function delRow(evt, _id, _startDate) {
    evt.stopPropagation();
    if (_startDate < currentDate) {
      setShowAlert2('Cannot delete a booking that has already started.');
    } else {
      setIdToDel(_id);
    }
  }

  function addRow() {
    const tomorrowAfternoon = moment(new Date()).startOf('date').add(42, 'hours').toDate();
    const newRow = {
      id: null, seatId: props.selSeat, user: token.user,
      startDate: currentDate, endDate: tomorrowAfternoon
    };
    setChildKey(null);
    setCalendarActive(true);
    setSelRow(newRow);
  }

  function checkIfDisabled(item) {
    if (item.username !== token.user || item.endDate < currentDate) return true;
    return false;
  }

  const handleClose = () => setIdToDel(false);
  const handleDel = () => {
    const callback = () => {
      refresh(utils.MSG.del);
      setIdToDel(null);
    }
    setChildKey(null);
    setReservation(reservationData.filter(item => item.id !== idToDel));
    utils.delReservationDb(idToDel, callback)
  }

  function refresh(msg) {
    loadData(props.selSeat);
    setCalendarActive(false);
    setSelRow(null);
    setShowAlert(msg);
    setTimeout(() => { setShowAlert(null); }, 2500);
  }

  function check(dateInterval, id) {
    const errorData = reservationData.filter(function (item) {
      return (item.id !== id && ((dateInterval[0] > item.startDate && dateInterval[0] < item.endDate)
        || (dateInterval[1] > item.startDate && dateInterval[1] < item.endDate)
        || (dateInterval[0] <= item.startDate && dateInterval[1] >= item.endDate)))
    })
    if (errorData.length === 0) return null;

    return (
      <div className="text-danger text-sm mt-2">
        Collision with existing booking!
      </div>
    );
  }

  return (
    <ElementStyle>
      <Alert show={!!showAlert} msg={showAlert} variant="success" setShow={setShowAlert} />
      <Alert show={!!showAlert2} msg={showAlert2} variant="danger" setShow={setShowAlert2} />
      <Modal idToDel={idToDel} handleClose={handleClose} handleDel={handleDel} />

      {/* Glass Panel Wrapper */}
      <div className='glass-panel'>
        <h4>
          <span>Bookings for Desk {props.selSeat}</span>
        </h4>

        <div className='booking-list'>
          {reservationData.length > 0 ? (
            reservationData.map((val, key) => {
              const mStartDate = moment(val.startDate);
              const mEndDate = moment(val.endDate);
              const isDisabled = checkIfDisabled(val);

              return (
                <div
                  key={key}
                  className={`booking-item ${selRow?.id === val.id ? 'selected' : ''}`}
                  onClick={() => onClickRow(val.id)}
                >
                  <div className="booking-info">
                    <div className="user">
                      {val.username === token.user ? 'My Reservation' : val.username}
                    </div>
                    <div className="time">
                      <span><FontAwesomeIcon icon={faCalendarAlt} /> {mStartDate.format('MMM D, YYYY')}</span>
                      <span><FontAwesomeIcon icon={faClock} /> {mStartDate.format('HH:mm')} - {mEndDate.format('HH:mm')}</span>
                    </div>
                  </div>

                  <div className="actions">
                    <button
                      className={`btn-edit ${isDisabled ? 'disabled' : ''}`}
                      onClick={(e) => !isDisabled && editRow(e, val.id)}
                      title="Edit Booking"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button
                      className={`btn-delete ${isDisabled ? 'disabled' : ''}`}
                      onClick={(e) => !isDisabled && delRow(e, val.id, val.startDate)}
                      title="Cancel Booking"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center p-4 text-gray-500 italic">No active bookings for this desk. Be the first!</div>
          )}
        </div>

        {props.selSeat && (
          <div className='add-btn-wrapper'>
            <Button className='auth-btn' onClick={() => addRow()}>
              New Booking <FontAwesomeIcon icon={faPlus} className="ml-2" />
            </Button>
          </div>
        )}
      </div>

      {selRow && (
        <CalendarContainer
          isCalendarActive={isCalendarActive}
          setSelRow={setSelRow}
          selSeat={selRow}
          user={token.user}
          key={childKey}
          refreshFn={refresh}
          msg={utils.MSG}
          check={check}
          currentDate={currentDate}
        />
      )}
    </ElementStyle>
  );
}

export default ReservationList;