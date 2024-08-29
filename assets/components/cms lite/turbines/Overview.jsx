import React, { useState, useEffect } from "react";
import { getAlarms } from '../../../common/cms/overviewAlarms';
import { Container, Row, Col } from "react-bootstrap";
import SiteCard from "./SiteCard";
import BarChart from "./BarChart";

/**
 * Overview component provides an overview of alarms and a bar chart.
 * @param {object} props - The props object.
 * @param {object<object>} props.data - The data containing alarm information.
 * @param {object.<string[]>} props.highLevelPaths - The high level paths for data filtering.
 * @returns {JSX.Element} - Returns the rendered Overview component.
 */
export default function Overview({ data, highLevelPaths }) {
  const [siteAlarms, setSiteAlarms] = useState([]);
  const [overviewGraph, setOverviewGraph] = useState([]);

  useEffect(() => {
    const [alarmData, graphData] = getAlarms(highLevelPaths, data);
    setSiteAlarms(alarmData);
    setOverviewGraph(graphData);
  }, [data, highLevelPaths]);

  return (
    <Container fluid className="mb-4" aria-label="Overview Container">
      <Row>
        <h3>Overview</h3>
        {Object.entries(siteAlarms).map(([site, turbines]) => (
          <Col xs='auto' key={site}>
            <SiteCard site={site} turbines={turbines} />
          </Col>
        ))}
      </Row>        
      {overviewGraph && (
        <Row>
          <Col aria-label="Bar Chart Column">
            <BarChart graphData={overviewGraph} />
          </Col>
        </Row>
      )}
    </Container>
  );
}
