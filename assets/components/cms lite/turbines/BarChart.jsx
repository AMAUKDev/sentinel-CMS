import React, { useCallback, useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import Plot from 'react-plotly.js';
import { useDarkMode } from '../../../context/DarkModeContext';

/**
 * BarChart component displays a bar chart using Plotly library.
 * @param {object} props - The props object.
 * @param {object} props.graphData - The data used to generate the bar chart.
 * @returns {JSX.Element} - Returns the rendered BarChart component.
 */
const BarChart = ({ graphData }) => {
  const [graphTraces, setGraphTraces] = useState([]);
  const { isDarkMode } = useDarkMode();

  /**
   * Converts the graph data to Plotly trace format.
   */
  const convertGraphData = useCallback(() => {
    const transformedData = [];

    for (const site in graphData) {
      for (const turbine in graphData[site]) {
        const nodeData = graphData[site][turbine];
        for (const node in nodeData) {
          const index = transformedData.findIndex(item => item.name === node);
          const xValue = `${site}/${turbine}`;
          const yValue = nodeData[node];
          
          if (index === -1) {
            transformedData.push({
              x: [xValue],
              y: [yValue],
              name: node,
              type: 'bar'
            });
          } else {
            transformedData[index].x.push(xValue);
            transformedData[index].y.push(yValue);
          }
        }
      }
    }

    setGraphTraces(transformedData);
  }, [graphData]);

  useEffect(() => {
    convertGraphData(graphData);
  }, [convertGraphData, graphData, isDarkMode]);

  /**
   * Handles click event on the plot.
   * @param {object} event - The click event object.
   */
  const handlePlotClick = (event) => {
    if (event.points.length > 0) {
      const clickedPoint = event.points[0].data;
      const siteName = event.points[0].label;
      const nodeName = clickedPoint.name;
      const xValues = clickedPoint.x;
      const nameIndex = xValues.indexOf(siteName);
      const yValue = clickedPoint.y[nameIndex];

      console.log('Site:', siteName);
      console.log('Node:', nodeName);
      console.log('Value:', yValue);
    }
  };

  const layout = {
  barmode: 'stack',
  title: {
    text: 'Percentage of Threshold Exceeded by Node Path and Type Path',
    font: {
      color: isDarkMode ? 'white' : 'black',
      size: 18 // Set the title font size
    }
  },
  xaxis: {
    title: {
      text: 'Monitor Path',
      font: {
        color: isDarkMode ? 'white' : 'black',
        size: 14 // Set the x-axis label font size
      }
    },
    tickfont: {
      color: isDarkMode ? 'white' : 'black',
      size: 12 // Set the x-axis tick font size
    },
    categoryorder: 'category ascending' // Fix x-axis order
  },
  yaxis: {
    title: {
      text: 'Percentage',
      font: {
        color: isDarkMode ? 'white' : 'black',
        size: 14 // Set the y-axis label font size
      }
    },
    tickfont: {
      color: isDarkMode ? 'white' : 'black',
      size: 12 // Set the y-axis tick font size
    }
  },
  legend: {
    font: {
      color: isDarkMode ? 'white' : 'black',
      size: 14 // Set the legend font size
    }
  },
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
};

  
  return (
    <Container fluid className='d-flex justify-content-center' aria-label="Bar Chart Container">
      <Plot
        data={graphTraces}
        layout={layout}
        onClick={handlePlotClick}
        aria-label="Bar Chart"
      />
    </Container>
  );
};

export default BarChart;
