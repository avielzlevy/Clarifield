import React, { useEffect, useState,useMemo } from 'react';
import axios from 'axios';
import { Box, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { DataGrid } from '@mui/x-data-grid';

// Helper function to parse logs text into structured objects
const parseLogs = (logsText) => {
  const logEntries = logsText.split('\n').filter((line) => line.trim() !== '');
  return logEntries.map((entry, index) => {
    // Regex to parse the log format
    const regex =
      /^(?<timestamp>[^|]+)\s*\|\s*(?<ip>[^|]+)\s*\|\s*(?<method>\w+)\s+(?<url>[^|]+)\s*\|\s*(?<status>\d{3})\s*\|\s*(?<responseTime>\d+ms)$/;
    const match = entry.match(regex);
    if (match && match.groups) {
      return {
        id: index, // Unique id for DataGrid
        timestamp: match.groups.timestamp.trim(),
        ip: match.groups.ip.trim(),
        method: match.groups.method.trim(),
        url: match.groups.url.trim(),
        status: match.groups.status.trim(),
        responseTime: match.groups.responseTime.trim(),
      };
    }
    // Fallback for non-parsable entries
    return {
      id: index,
      timestamp: entry,
      ip: '',
      method: '',
      url: '',
      status: '',
      responseTime: '',
    };
  });
};

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { t } = useTranslation();
  const { logout } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');

    (async () => {
      setLoading(true);
      try {
        const { status, data, statusText } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/logs`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (status !== 200) {
          throw new Error(`Error ${status}: ${statusText}`);
        }
        const parsedLogs = parseLogs(data);
        setLogs(parsedLogs);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          logout({ mode: 'bad_token' });
          return;
        }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [logout]);

  // Define columns for the DataGrid
  const columns = useMemo(()=>[
    { field: 'timestamp', headerName: t('timestamp'), width: 210 },
    { field: 'ip', headerName: t('ip_address'), width: 120 },
    { field: 'method', headerName: t('method'), width: 100 },
    { field: 'url', headerName: t('url'), flex: 1 },
    { field: 'status', headerName: t('status'), width: 70 },
    { field: 'responseTime', headerName: t('response_time'), width: 90 },
  ],[t]);

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color="error">
          {t('error_fetching_logs')}: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ height: '90vh', width: '100%' }}>
      <DataGrid
        rows={logs}
        columns={columns}
        loading={loading}
        pagination
        pageSizeOptions={[25, 50, 100]}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
        }}
      />
    </Paper>
  );
};

export default LogsPage;
