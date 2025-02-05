import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();
  const { logout } = useAuth();
  useEffect(() => {
    // Retrieve the authentication token (adjust according to your auth implementation)
    const token = localStorage.getItem('token');

    const fetchLogs = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/logs`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status !== 200) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const logsData = await response.data;
        const parsedLogs = parseLogs(logsData);
        setLogs(parsedLogs);
      } catch (err) {
        if(err.response.status === 401) {
          logout();
          return;
        }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Function to parse raw logs into structured data
  const parseLogs = (logsText) => {
    const logEntries = logsText.split('\n').filter((line) => line.trim() !== '');
    return logEntries.map((entry) => {
      // Regex to parse the log format
      const regex = /^(?<timestamp>[^|]+)\s*\|\s*(?<ip>[^|]+)\s*\|\s*(?<method>\w+)\s+(?<url>[^|]+)\s*\|\s*(?<status>\d{3})\s*\|\s*(?<responseTime>\d+ms)$/;
      const match = entry.match(regex);
      if (match && match.groups) {
        return {
          timestamp: match.groups.timestamp.trim(),
          ip: match.groups.ip.trim(),
          method: match.groups.method.trim(),
          url: match.groups.url.trim(),
          status: match.groups.status.trim(),
          responseTime: match.groups.responseTime.trim(),
        };
      } else {
        // If the line doesn't match, return it as a raw message
        return { raw: entry };
      }
    });
  };

  if (loading) {
    return <p>Loading logs...</p>;
  }

  if (error) {
    return <p>Error fetching logs: {error}</p>;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        {t('logs')}
      </Typography>
      <TableContainer component={Paper}>
        <Table aria-label="logs table">
          <TableHead>
            <TableRow>
              <TableCell>{t('timestamp')}</TableCell>
              <TableCell>{t('ip_address')}</TableCell>
              <TableCell>{t('method')}</TableCell>
              <TableCell>{t('url')}</TableCell>
              <TableCell>{t('status')}</TableCell>
              <TableCell>{t('response_time')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log, index) => (
              <TableRow key={index}>
                <TableCell>{log.timestamp || ''}</TableCell>
                <TableCell>{log.ip || ''}</TableCell>
                <TableCell>{log.method || ''}</TableCell>
                <TableCell dir='ltr'>{log.url || ''}</TableCell>
                <TableCell>{log.status || ''}</TableCell>
                <TableCell>{log.responseTime || ''}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default LogsPage;
