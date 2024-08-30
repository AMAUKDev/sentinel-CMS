import React, { useState, useEffect, useCallback } from "react";
import { Card, Container, Row, Col, OverlayTrigger, Tooltip, Button } from "react-bootstrap";
import { toHumanReadable } from "../../../common/infoUtils";
import { useDarkMode } from "../../../context/DarkModeContext";

/**
 * SiteCard component renders a card for each site containing information about turbines and alarms.
 * @param {object} props - The props object.
 * @param {string} props.site - The name of the site.
 * @param {object} props.turbines - Object containing information about turbines and alarms.
 * @returns {JSX.Element} - Returns the rendered SiteCard component.
 */
function SiteCard({ site, turbines }) {
  const [nodeOrder, setNodeOrder] = useState([]);
  const { isDarkMode } = useDarkMode();

  /**
   * Function to set the order of nodes based on the maximum number of keys among turbines.
   */
  const getKeyOrders = useCallback(() => {
    const { maxTurbine } = Object.keys(turbines).reduce((acc, curr) => {
      const numKeys = Object.keys(turbines[curr]).length;
      return numKeys > acc.maxKeys ? { maxKeys: numKeys, maxTurbine: curr } : acc;
    }, { maxKeys: 0, maxTurbine: null });

    setNodeOrder(Object.keys(turbines[maxTurbine] || {}).sort());
  }, [turbines]);

  useEffect(() => {
    getKeyOrders();
  }, [getKeyOrders]);

  /**
   * Handler function for interpreting node information.
   * @param {string} site - The name of the site.
   * @param {string} turbineKey - The key of the turbine.
   * @param {string} nodeKey - The key of the node.
   */
  const handleNodeInterpretation = (site, turbineKey, nodeKey, alarms) => {
    let nodeAlarm;
    if (alarms[nodeKey] === undefined) {
      nodeAlarm = 'No data';
    } else {
      if (alarms[nodeKey]) {
        nodeAlarm = 'Alarm active';
      } else {
        nodeAlarm = 'No alarm';
      }
    }
  }

  const alarmKeyTooltip = (
    <Tooltip>
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        <li><span style={{ color: 'black' }}>•</span> No data</li>
        <li><span style={{ color: '#FF0000' }}>•</span> Alarm</li>
        <li><span style={{ color: '#00FF00' }}>•</span> No alarm</li>
      </ul>
    </Tooltip>
  );

  return (
    <Container fluid className="" aria-label={`Site Card for ${site}`}>
      <Card className={`dt-card mb-2 p-0 ${isDarkMode ? 'dark' : 'light'}`}>
        <OverlayTrigger overlay={alarmKeyTooltip} placement="right" aria-label="Alarm Key Tooltip">
          <Card.Header>
            <Card.Title>{site}</Card.Title>
          </Card.Header>
        </OverlayTrigger>
        <Card.Body>
          {Object.entries(turbines).map(([turbineKey, alarms]) => (
            <div className="d-flex" key={turbineKey}>
              <p className={`turbine-name ${isDarkMode ? "text-white" : "text-dark"} d-flex align-items-center mb-0 mx-3`}>{turbineKey}</p>
              <Row>
                {nodeOrder.map((nodeKey) => (
                  alarms[nodeKey] !== null && (
                    <Col xs={2} key={nodeKey}>
                      <OverlayTrigger
                        overlay={
                          <Tooltip className="node-tooltip" id={`tooltip-${nodeKey}`}>
                            {toHumanReadable(nodeKey)}: {alarms[nodeKey] === undefined ? 'No Data' : (alarms[nodeKey] ? 'Triggered' : 'No Alarm')}
                          </Tooltip>
                        }
                        aria-label={`Alarm Status for ${toHumanReadable(nodeKey)}: ${alarms[nodeKey] === undefined ? 'No Data' : (alarms[nodeKey] ? 'Triggered' : 'No Alarm')}`}
                      >
                        <p
                          className={`alarm-dot mb-0 ${alarms[nodeKey] === undefined ? 'no-data' : (alarms[nodeKey] ? 'alarm' : 'no-alarm')}`}
                          onClick={() => handleNodeInterpretation(site, turbineKey, nodeKey, alarms)} aria-label={alarms[nodeKey] === undefined ? 'No Data' : (alarms[nodeKey] ? 'Triggered' : 'No Alarm')}
                        >
                          &#8226;
                        </p>
                      </OverlayTrigger>
                    </Col>
                  )
                ))}
                <Col xs={4} className="d-flex align-items-center">
                  <Button variant={`outline-${isDarkMode ? 'light' : 'primary'}`} aria-label="View Button">View</Button>
                </Col>
              </Row>
            </div>
          ))}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default SiteCard;
