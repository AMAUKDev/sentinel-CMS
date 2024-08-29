import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  Row, 
  Col,
  Button,
  Dropdown,
  Form,
  Container,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { useJobs } from "../../context/JobContext.jsx";
import { useDarkMode } from "../../context/DarkModeContext";
import Flatpickr from 'react-flatpickr';


/**
 * Selection area component for selecting interpretation options and displaying information.
 * @param {boolean} props.defaultDisplayed - Boolean indicating if default options are displayed.
 * @param {Function} props.setDefaultDisplayed - Function to set default display status.
 * @returns {JSX.Element} Selection area component.
 */
const SelectionArea = React.memo(({
  defaultDisplayed,
  setDefaultDisplayed,
  dashboardSetDefaultCallbackBool,
}) => {
  const [selectedInterpretation, setSelectedInterpretation] = useState(null);
  const [buttonText, setButtonText] = useState('Select Interpretation');
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedMonitors, setSelectedMonitors] = useState([]);
  const [interpretations, setInterpretations] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(new Date().toISOString());
  const [isRotating, setIsRotating] = useState(false);

  const { initiateJob } = useJobs();
  const { isDarkMode } = useDarkMode();

  const initiateJobRef = useRef(initiateJob);

  const handleAvailableInterpretationDataWithDefault = useCallback((data) => {
    delete data.job_id;
    setInterpretations(data);

    Object.keys(data).forEach((interpretationKey) => {
      const interpretationDict = data[interpretationKey];
      const defaultInterpretation = interpretationDict["default_interpretation"];

      if (defaultInterpretation) {
        const thisInterpretationSelectionPayload = {
          interpretation_key: interpretationKey,
          node_ids: [],
          monitor_ids: [],
          entity_ids: [],
        };

        initiateJobRef.current({
          "createPayload": () => thisInterpretationSelectionPayload,
        });
      }
    });
    setDefaultDisplayed(true);
  }, [setDefaultDisplayed]);

  const getInterpretationsAndDisplayDefault = useCallback(() => {
    if (defaultDisplayed) {
      return;
    }

    initiateJobRef.current({
        "dataHandler": (data) => handleAvailableInterpretationDataWithDefault(data),
    });

  }, [defaultDisplayed, handleAvailableInterpretationDataWithDefault]);

  useEffect(() => {
    if(dashboardSetDefaultCallbackBool){
      getInterpretationsAndDisplayDefault();
    }

  }, [getInterpretationsAndDisplayDefault, dashboardSetDefaultCallbackBool]);

  const isoformatStringOrNull = (value) => (value ? new Date(value).toISOString() : null);

  const interpretationSelectionPayload = useCallback(() => {
    if (!selectedInterpretation) return null;
    const ensureList = (value) => (Array.isArray(value) ? value : [value]);

    return {
      interpretation_key: selectedInterpretation,
      node_ids: ensureList(selectedNodes),
      monitor_ids: ensureList(selectedMonitors),
      entity_ids: ensureList(selectedNodes.concat(selectedMonitors)),
      start_datetime: isoformatStringOrNull(startDate),
      end_datetime: isoformatStringOrNull(endDate),
    };
  }, [selectedInterpretation, selectedNodes, selectedMonitors, startDate, endDate]);

  const handleAvailableInterpretationData = useCallback((data) => {
    delete data.job_id;
    setInterpretations(data);
  }, []);

  const getInterpretations = useCallback((event) => {
    const endpointToUse = event.shiftKey ? '/test_get_interpretations/' : '/async_interpretations_view/';
    initiateJob({
      "endpoint": endpointToUse,
      "dataHandler": (data) => handleAvailableInterpretationData(data),
    });
  }, [handleAvailableInterpretationData, initiateJob]);

  const displaySelectedInterpretation = useCallback((event) => {
    // if window width is less than 768px (mobile), then toggle the sidebar
    if(window.matchMedia('(max-width: 768px)').matches){
      const sidebarBurgerIcons = document.getElementById('main-dashboard-burger');
      const sidebarToggleBtn = document.getElementById('toggle-interpretation-button');
      sidebarBurgerIcons.click();
      sidebarToggleBtn.click();
    }
    const endpointToUse = event.shiftKey
      ? '/test_display_interpretation/'
      : '/async_interpretations_view/';

    
    const payload = interpretationSelectionPayload();
    if (payload || event.shiftKey) {
      initiateJob({
        "endpoint": endpointToUse,
        "createPayload": () => payload,
      });
    }
    

  }, [interpretationSelectionPayload, initiateJob]);

  const changeStartDate = (e) => {
    const timePeriods = {
      'last-year-btn': { unit: 'FullYear', amount: -1 },
      'last-6-months-btn': { unit: 'Month', amount: -6 },
      'last-3-months-btn': { unit: 'Month', amount: -3 },
      'last-month-btn': { unit: 'Month', amount: -1 },
      'last-week-btn': { unit: 'Date', amount: -7 },
      'last-day-btn': { unit: 'Date', amount: -1 }
    };
  
    const endDateObj = new Date(endDate);
    const { unit, amount } = timePeriods[e.target.id];
    const newStartDate = new Date(endDateObj);
    
    // Adjust the start date based on the time period
    switch (unit) {
      case 'FullYear':
        newStartDate.setFullYear(newStartDate.getFullYear() + amount);
        break;
      case 'Month':
        newStartDate.setMonth(newStartDate.getMonth() + amount);
        break;
      case 'Date':
        newStartDate.setDate(newStartDate.getDate() + amount);
        break;
      default:
        break;
    }
  
    setStartDate(newStartDate);
  };

  const handleInterpretationSelect = (key) => {
    setButtonText(interpretations[key].interpretation_name);
    setSelectedInterpretation(key);
    setSelectedNodes([]);
    setSelectedMonitors([]);
  };

  const handleRefreshButton= (e) => {
    getInterpretations(e);
    setIsRotating(true);
  };
  
  const handleAnimationEnd = () => {
    setIsRotating(false);
  };

  return (
    <Container fluid className='mt-5'>
      <Row className="my-3">
        <Col className="d-flex justify-content-center">
          <Dropdown onSelect={handleInterpretationSelect}>
            <Dropdown.Toggle id='dropdown-toggle' variant='primary' aria-label="Select Interpretation">
              {buttonText}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {Object.keys(interpretations).map(key => (
                <Dropdown.Item key={key} eventKey={key}>
                  {interpretations[key].interpretation_name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="refresh-tooltip">Refresh Interpretations</Tooltip>}
            >
              <FontAwesomeIcon
                id='refresh-icon'
                icon={faArrowsRotate}
                className={`mx-3 ${isRotating ? 'rotate' : ''}`}
                onAnimationEnd={handleAnimationEnd}
                onClick={handleRefreshButton}
                aria-label='Refresh Interpretations'
              />
            </OverlayTrigger>
          </Dropdown>
        </Col>
      </Row>
      <Row className='my-3'>
        <Col xs={6}>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="tooltip-1">
                Hold shift to select multiple objects. Ctrl + click to deselect individual objects.
              </Tooltip>
            }>
            <Form.Group controlId="nodeSelect" as={Row}>
              <Form.Label className='d-flex justify-content-center'>Select Objects For Information</Form.Label>
              <Col className='d-flex justify-content-center'>
                <Form.Control
                  className='w-75'
                  as="select"
                  multiple
                  onChange={e => setSelectedNodes(Array.from(e.target.selectedOptions, option => option.value))}
                >
                  {selectedInterpretation && interpretations[selectedInterpretation].nodes.map(node => (
                    <option key={node._id} value={node._id}>{node.node_path}</option>
                  ))}
                </Form.Control>
              </Col>
            </Form.Group>
          </OverlayTrigger>
        </Col>
        <Col xs={6}>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="tooltip-1">
                Hold shift to select multiple monitors. Ctrl + click to deselect individual monitors.
              </Tooltip>
            }>
            <Form.Group controlId="monitorSelect" as={Row}>
              <Form.Label className='d-flex justify-content-center'>Select Monitors For Information</Form.Label>
              <Col className='d-flex justify-content-center'>
                <Form.Control
                  className='w-75'
                  as="select"
                  multiple
                  onChange={e => setSelectedMonitors(Array.from(e.target.selectedOptions, option => option.value))}
                >
                  {selectedInterpretation && interpretations[selectedInterpretation].monitors.map(monitor => (
                    <option key={monitor._id} value={monitor._id}>{monitor.monitor_id}</option>
                  ))}
                </Form.Control>
              </Col>
            </Form.Group>
          </OverlayTrigger>
        </Col>
      </Row>
      <Row className="my-3 d-flex justify-content-center">
        <Col xs={12} md={3} className="d-flex flex-column align-items-center">
          <Row>
            <Col xs={4} className='mt-2 mt-md-1 p-0 align-items-center'>
              <h6 className='m-0'>Start Date</h6>
            </Col>
            <Col xs={8} className='p-0'>
              <Flatpickr
                className="form-control"
                value={startDate}
                onChange={setStartDate}
                options={{
                  enableTime: true,
                  dateFormat: 'd/m/Y H:i',
                  time_24hr: true
                }}
              />
            </Col>
          </Row>
        </Col>
        <Col xs={12} md={1} className='d-flex justify-content-center my-3 my-sm-0'>
          <Button variant={`outline-${isDarkMode ? 'light' : 'secondary' }`} id="last-year-btn" onClick={changeStartDate} aria-label="Select Last Year">
            Last Year
          </Button>
        </Col>
        <Col xs={12} md={1} className='d-flex justify-content-center my-3 my-sm-0'>
          <Button variant={`outline-${isDarkMode ? 'light' : 'secondary' }`} id="last-6-months-btn" onClick={changeStartDate} aria-label="Select Last 6 Months">
            Last 6 Months
          </Button>
        </Col>
        <Col xs={12} md={1} className='d-flex justify-content-center my-3 my-sm-0'>
          <Button variant={`outline-${isDarkMode ? 'light' : 'secondary' }`} id="last-3-months-btn" onClick={changeStartDate} aria-label="Select Last 3 Months">
            Last 3 Months
          </Button>
        </Col>
        <Col xs={12} md={1} className='d-flex justify-content-center my-3 my-sm-0'>
          <Button variant={`outline-${isDarkMode ? 'light' : 'secondary' }`} id="last-month-btn" onClick={changeStartDate} aria-label="Select Last Month">
            Last Month
          </Button>
        </Col>
        <Col xs={12} md={1} className='d-flex justify-content-center my-3 my-sm-0'>
          <Button variant={`outline-${isDarkMode ? 'light' : 'secondary' }`} id="last-week-btn" onClick={changeStartDate} aria-label="Select Last Week">
            Last Week
          </Button>
        </Col>
        <Col xs={12} md={1} className='d-flex justify-content-center my-3 my-sm-0'>
          <Button variant={`outline-${isDarkMode ? 'light' : 'secondary' }`} id="last-day-btn" onClick={changeStartDate} aria-label="Select Last Day">
            Last Day
          </Button>
        </Col>
        <Col xs={12} md={3} className="d-flex flex-column align-items-center">
          <Row>
            <Col xs={8} md={8} className='m-0'>
              <Flatpickr
                className="form-control"
                value={endDate}
                onChange={setEndDate}
                options={{
                  enableTime: true,
                  dateFormat: 'd/m/Y H:i',
                  time_24hr: true
                }}
              />
            </Col>
            <Col xs={4} md={4} className='mt-2 mt-md-1 align-items-center'>
              <h6 className='m-0'>End Date</h6>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col className="my-3 d-flex justify-content-center">
          <Button
            id="display-selected-interpretation-button"
            onClick={(event) => displaySelectedInterpretation(event)}
            variant="primary"
            aria-label="Display Selected Information"
          >
            Display Selected Information
          </Button>
        </Col>
      </Row>
    </Container>
  );
});

export default SelectionArea;
