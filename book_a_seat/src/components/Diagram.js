
import { useD3 } from '../use/useD3';
import SvgPlan from './SvgPlan';
import SeatsAndTablesClass from './SeatsAndTablesClass';
import Popup from './Popup';
import axios from '../api/axios';
import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTrash } from '@fortawesome/free-solid-svg-icons'
import Button from 'react-bootstrap/Button';
import AuthContext from '../context/AuthProvider';
import Form from 'react-bootstrap/Form';
import BModal from 'react-bootstrap/Modal';
import styled from 'styled-components';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const DIAGRAM_URL = SERVER_URL + 'api/seats';
const SVG_WIDTH = "175mm";
const SVG_HEIGHT = "125mm";

const ElementStyle = styled.div`  
  {
    margin: 5px 10px;
    // height: calc(100vh - 100px);
    position: relative;
  }

  button, label, input[type='text'] {
    font-size: 12px;
  }

  .wrapper-mngr-diagram, .wrapper-btn-save{
    display: flex;
    justify-content: normal;
    gap: 5px;
    align-items: flex-start;

    button{
      margin: 4px;
    }

  }
  
  .wrapper-mngr-diagram{
    text-align: left;
    margin: 5px 0;
  }

  .wrapper-btn-save{
    button{
      margin-top: 15px;
    }
  }

  .wrapper-svg{
    position: relative;

    svg {
      position: absolute;
      left: 0;
      top: 0;
    }
  }
`;

function Diagram(props) {
  let chairsMng = null;
  // const [svg, setSvg] = useState({});
  const { token } = useContext(AuthContext);
  const [showAlert, setShowAlert] = useState(null);
  const ref = useD3(
    (svg) => {
      // console.log("set svg")
      // setSvg(svg)
      loadData(svg);
    },
    []
  );

  const divStyle = {
    width: SVG_WIDTH,
    height: SVG_HEIGHT,
  };

  const loadData = function (svg) {
    console.log('load diagram!', svg);
    const loadRequest = async () => {
      try {
        const response = await axios.get(
          DIAGRAM_URL,
          // params,
          {
            withCredentials: true,
          }
        );
        console.log('=====> resp', response.data);
        if (chairsMng == null) {
          chairsMng = new SeatsAndTablesClass(svg, response.data, token.role, props.setSelSeat);
        }
      } catch (err) {
        console.log("ERROR loadData", err);
      }
    }
    loadRequest();
  }

  const save = function () {
    // console.log('save seatData!!!!!', chairsMng.seatData);
    const sendPostRequest = async () => {
      try {
        const params = { seats: chairsMng.seatData, tables: chairsMng.tableData };
        const response = await axios.post(
          DIAGRAM_URL,
          params,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          }
        );
        const resp = response.data;
        // console.log('=====>resp', resp.successful);
        setShowAlert('Row has been successfully saved!');
        setTimeout(() => { setShowAlert(null); }, 2500);
      } catch (err) {
        console.log("ERROR save diagram", err);
      }
    }
    sendPostRequest();
  }

  return (
    <ElementStyle>
      {/* Controls visible ONLY to ADMIN now (Reverted per user request) */}
      {token.role === 'admin' && (
        <div className='wrapper-mngr-diagram' style={{ marginBottom: '24px', padding: '16px', background: 'rgba(255,255,255,0.5)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <Button className='nav-btn-solid' style={{ border: 'none', background: '#1a4d2e' }} type="button" onClick={() => { chairsMng.addSeat(); }} >
              Add Chair <FontAwesomeIcon icon={faSave} className="ml-2" />
            </Button>
            <Button className='nav-btn-solid' style={{ border: 'none', background: '#1a4d2e' }} type="button" onClick={() => { chairsMng.addTable(); }} >
              Add Table <FontAwesomeIcon icon={faSave} className="ml-2" />
            </Button>
            <Button className='nav-btn-solid' style={{ border: 'none', background: '#8B1538' }} type="button" onClick={() => { chairsMng.deleteSeat(); }} >
              Delete Chair <FontAwesomeIcon icon={faTrash} className="ml-2" />
            </Button>
            <Button className='nav-btn-solid' style={{ border: 'none', background: '#8B1538' }} type="button" onClick={() => { chairsMng.deleteTable(); }} >
              Delete Table <FontAwesomeIcon icon={faTrash} className="ml-2" />
            </Button>
          </div>
        </div>
      )}

      <div className="wrapper-svg" style={{ ...divStyle, border: '1px solid #e0e0e0', borderRadius: '12px', background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <SvgPlan width={SVG_WIDTH} height={SVG_HEIGHT} />
        <svg ref={ref} id="svg_draw" width={SVG_WIDTH} height={SVG_HEIGHT} version="1.1" xmlns="http://www.w3.org/2000/svg">

        </svg>
      </div>

      {/* Save Button also visible ONLY for ADMIN */}
      {token.role === 'admin' && (
        <div className='wrapper-btn-save' style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <BModal show={showAlert ? true : false} size='sm' centered='true' backdrop="static">
            <BModal.Body>{showAlert}</BModal.Body>
            <BModal.Footer>
              <Button variant="secondary" onClick={() => setShowAlert(null)}>Close</Button>
            </BModal.Footer>
          </BModal>
          <Button className='auth-btn' style={{ width: 'auto', padding: '12px 32px', marginTop: '0' }} type="button" onClick={() => { save(); }} >
            Save Layout <FontAwesomeIcon icon={faSave} className="ml-2" />
          </Button>
        </div>
      )}
      <Popup />

    </ElementStyle>
  )
}

export default Diagram;