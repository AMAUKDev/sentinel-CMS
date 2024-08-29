import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import axios from "axios";
import qs from "qs";

const JobContext = createContext();

export const useJobs = () => useContext(JobContext);

export const JobProvider = ({ children }) => {
  // Using a ref to track jobs instead of state
  const jobsRef = useRef([]);
  const ws = useRef(null);

  let defaultDataHandler = useCallback((data) => {
    console.log("defaultDataHandler in JobProvider", data);
  }, []);

  const [currentDataHandler, setCurrentDataHandler] = useState(() => defaultDataHandler);

  useEffect(() => {
    // Set up WebSocket
    let mode = import.meta.env.MODE
    if (mode === "development") {
      ws.current = new WebSocket('ws://'+ window.location.host +'/ws/jobs/');
    }
    else if (mode === "production") {
      ws.current = new WebSocket('wss://sentinel-pipeclam.onrender.com/ws/jobs/');
    }

    ws.current.onopen = () => console.log('WebSocket Connected');

    ws.current.onmessage = (e) => {
      console.log("Received message...")
      const parsedData = JSON.parse(e.data);
      let message = parsedData.message;

      if ("job_id" in message) {
        let updatedJobId = message.job_id;
        console.log(updatedJobId, " with message: ", message);

        // Update jobsRef.current directly without causing a re-render
        const jobIndex = jobsRef.current.findIndex((job) => job.jobId === updatedJobId);

        if (jobIndex !== -1) {
          let thisJob = jobsRef.current[jobIndex];
          let thisJobDataHandler = thisJob.dataHandler;
          thisJobDataHandler(message);
        }
      }

      ws.current.onerror = (error) => console.error('WebSocket error:', error);

      ws.current.onclose = () => console.log('WebSocket Disconnected');
    }

    // Cleanup
    return () => ws.current?.close();
  }, []);

  // Updated initiateJob function to modify jobsRef.current directly
  const initiateJob = useCallback(async (kwargs = {}) => {
    console.log("initiateJob kwargs: ", kwargs);
    const {
      endpoint = "/async_interpretations_view/",
      callbackName = "passthrough_data",
      createPayload = () => ({}),
      dataHandler = currentDataHandler,
      timeoutSeconds = 30,
    } = kwargs;

    const payload = createPayload();

    console.log("initiateJob payload: ", payload, dataHandler);

    const response = await axios.get(endpoint, {
      params: {
        callback: callbackName,
        ...payload,
      },
      paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })
    });

    console.log("initiateJob response: ", response);

    if ("job_id" in response.data) {
      let newJobId = response.data.job_id;

      // Directly modifying jobsRef.current without triggering re-render
      jobsRef.current.push({ jobId: newJobId, dataHandler: dataHandler });

      setTimeout(() => {
        jobsRef.current = jobsRef.current.filter((j) => j.jobId !== newJobId);
      }, timeoutSeconds * 1000);
    }
  }, [currentDataHandler]);
  
  const setDataHandler = useCallback((newHandler) => {
    setCurrentDataHandler(() => newHandler);
  }, []);

  // Memoizing the context value to avoid unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    jobs: jobsRef.current, // Provide direct access to jobs data
    initiateJob,
    setDataHandler,
  }), [initiateJob, setDataHandler]);

  return (
    <JobContext.Provider value={contextValue}>
      {children}
    </JobContext.Provider>
  );
};
