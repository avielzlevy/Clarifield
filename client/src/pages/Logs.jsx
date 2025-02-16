// import React, { useEffect, useState, useMemo } from 'react';
// import axios from 'axios';
// import dayjs from 'dayjs';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TablePagination,
//   TableHead,
//   TableRow,
//   Paper,
//   CircularProgress,
//   Box,
// } from '@mui/material';
// import { useTranslation } from 'react-i18next';
// import { useAuth } from '../contexts/AuthContext';
// import LogFilter from '../components/LogFilter';

// const LogsPage = () => {
//   const [logs, setLogs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(25);
//   const { t } = useTranslation();
//   const { logout } = useAuth();

//   // Update filter state to support timestamp range filtering.
//   const [filter, setFilter] = useState({
//     timestampBefore: null, // Upper bound (logs before this time)
//     timestampAfter: null,  // Lower bound (logs after this time)
//     ip: '',
//     method: '',
//     url: '',
//     status: '',
//     responseTime: '',
//   });

//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(+event.target.value);
//     setPage(0);
//   };

//   // Update filter state when a filter value changes
//   const handleFilterChange = (field, value) => {
//     if (field === 'before') {
//       setFilter((prev) => ({ ...prev, timestampBefore: value }));
//     } else if (field === 'after') {
//       setFilter((prev) => ({ ...prev, timestampAfter: value }));
//     } else {
//       setFilter((prev) => ({ ...prev, [field]: value }));
//     }
//     setPage(0); // reset pagination when filtering
//   };

//   useEffect(() => {
//     const token = localStorage.getItem('token');

//     const fetchLogs = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/logs`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (response.status !== 200) {
//           throw new Error(`Error ${response.status}: ${response.statusText}`);
//         }

//         const logsData = await response.data;
//         const parsedLogs = parseLogs(logsData);
//         setLogs(parsedLogs);
//       } catch (err) {
//         if (err.response && err.response.status === 401) {
//           logout({ mode: 'bad_token' });
//           return;
//         }
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLogs();
//   }, [logout]);

//   // Function to parse raw logs into structured data
//   const parseLogs = (logsText) => {
//     const logEntries = logsText.split('\n').filter((line) => line.trim() !== '');
//     return logEntries.map((entry) => {
//       // Regex to parse the log format
//       const regex = /^(?<timestamp>[^|]+)\s*\|\s*(?<ip>[^|]+)\s*\|\s*(?<method>\w+)\s+(?<url>[^|]+)\s*\|\s*(?<status>\d{3})\s*\|\s*(?<responseTime>\d+ms)$/;
//       const match = entry.match(regex);
//       if (match && match.groups) {
//         return {
//           timestamp: match.groups.timestamp.trim(),
//           ip: match.groups.ip.trim(),
//           method: match.groups.method.trim(),
//           url: match.groups.url.trim(),
//           status: match.groups.status.trim(),
//           responseTime: match.groups.responseTime.trim(),
//         };
//       } else {
//         // If the line doesn't match, return it as a raw message
//         return { raw: entry };
//       }
//     });
//   };

//   // Compute filtered logs based on the filter state.
//   // For timestamp, we check if the log's timestamp is before the "before" date
//   // and after the "after" date.
//   const filteredLogs = useMemo(() => {
//     return logs.filter((log) => {
//       if (filter.timestampBefore && dayjs(log.timestamp).isAfter(dayjs(filter.timestampBefore))) {
//         return false;
//       }
//       if (filter.timestampAfter && dayjs(log.timestamp).isBefore(dayjs(filter.timestampAfter))) {
//         return false;
//       }
//       if (filter.ip && log.ip !== filter.ip) return false;
//       if (filter.method && log.method !== filter.method) return false;
//       if (filter.url && log.url !== filter.url) return false;
//       if (filter.status && log.status !== filter.status) return false;
//       if (filter.responseTime && log.responseTime !== filter.responseTime) return false;
//       return true;
//     });
//   }, [logs, filter]);

//   if (loading) {
//     return (
//       <Box
//         sx={{
//           position: 'fixed',
//           top: 0,
//           left: 0,
//           width: '100%',
//           height: '100%',
//           backgroundColor: 'rgba(255, 255, 255, 0.2)',
//           backdropFilter: 'blur(5px)',
//           zIndex: 9999,
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//         }}
//       >
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (error) {
//     return <p>Error fetching logs: {error}</p>;
//   }

//   return (
//     <>
//       <TableContainer component={Paper} sx={{ maxHeight: '80vh' }}>
//         <Table stickyHeader aria-label="logs table">
//           <TableHead>
//             <TableRow>
//               <TableCell>
//                 {/* Timestamp range filter */}
//                 {Array.isArray(logs) && (
//                   <LogFilter
//                     logs={logs.map((log) => log.timestamp)}
//                     label={t('timestamp')}
//                     onFilterChange={(value, field) => handleFilterChange(field, value)}
//                   />
//                 )}
//               </TableCell>
//               <TableCell>
//                 {Array.isArray(logs) && (
//                   <LogFilter
//                     logs={logs.map((log) => log.ip)}
//                     label={t('ip_address')}
//                     onFilterChange={(value) => handleFilterChange('ip', value)}
//                   />
//                 )}
//               </TableCell>
//               <TableCell>
//                 {Array.isArray(logs) && (
//                   <LogFilter
//                     logs={logs.map((log) => log.method)}
//                     label={t('method')}
//                     onFilterChange={(value) => handleFilterChange('method', value)}
//                   />
//                 )}
//               </TableCell>
//               <TableCell>
//                 {Array.isArray(logs) && (
//                   <LogFilter
//                     logs={logs.map((log) => log.url)}
//                     label={t('url')}
//                     onFilterChange={(value) => handleFilterChange('url', value)}
//                   />
//                 )}
//               </TableCell>
//               <TableCell>
//                 {Array.isArray(logs) && (
//                   <LogFilter
//                     logs={logs.map((log) => log.status)}
//                     label={t('status')}
//                     onFilterChange={(value) => handleFilterChange('status', value)}
//                   />
//                 )}
//               </TableCell>
//               <TableCell>
//                 {Array.isArray(logs) && (
//                   <LogFilter
//                     logs={logs.map((log) => log.responseTime)}
//                     label={t('response_time')}
//                     onFilterChange={(value) => handleFilterChange('responseTime', value)}
//                   />
//                 )}
//               </TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {filteredLogs
//               .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//               .map((log, index) => (
//                 <TableRow key={index}>
//                   <TableCell>{log.timestamp || ''}</TableCell>
//                   <TableCell>{log.ip || ''}</TableCell>
//                   <TableCell>{log.method || ''}</TableCell>
//                   <TableCell dir="ltr">{log.url || ''}</TableCell>
//                   <TableCell>{log.status || ''}</TableCell>
//                   <TableCell>{log.responseTime || ''}</TableCell>
//                 </TableRow>
//               ))}
//           </TableBody>
//         </Table>
//       </TableContainer>
//       <TablePagination
//         rowsPerPageOptions={[25, 50, 100]}
//         component="div"
//         count={filteredLogs.length}
//         rowsPerPage={rowsPerPage}
//         page={page}
//         onPageChange={handleChangePage}
//         onRowsPerPageChange={handleChangeRowsPerPage}
//       />
//     </>
//   );
// };

// export default LogsPage;



import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { Box,Paper, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { DataGrid } from '@mui/x-data-grid';

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { t } = useTranslation();
  const { logout } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/logs`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.status !== 200) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const logsData = response.data;
        const parsedLogs = parseLogs(logsData);
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
    };

    fetchLogs();
  }, [logout]);

  // Parses the logs text into structured objects.
  // Each log entry is also given an 'id' for DataGrid.
  const parseLogs = (logsText) => {
    const logEntries = logsText.split('\n').filter((line) => line.trim() !== '');
    return logEntries.map((entry, index) => {
      // Regex to parse the log format
      const regex =
        /^(?<timestamp>[^|]+)\s*\|\s*(?<ip>[^|]+)\s*\|\s*(?<method>\w+)\s+(?<url>[^|]+)\s*\|\s*(?<status>\d{3})\s*\|\s*(?<responseTime>\d+ms)$/;
      const match = entry.match(regex);
      if (match && match.groups) {
        return {
          id: index, // DataGrid requires a unique 'id' field
          timestamp: match.groups.timestamp.trim(),
          ip: match.groups.ip.trim(),
          method: match.groups.method.trim(),
          url: match.groups.url.trim(),
          status: match.groups.status.trim(),
          responseTime: match.groups.responseTime.trim(),
        };
      } else {
        // For non-parsable entries, you can decide how to display them.
        return { id: index, timestamp: entry, ip: '', method: '', url: '', status: '', responseTime: '' };
      }
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(5px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <p>Error fetching logs: {error}</p>;
  }

  // Define columns for the DataGrid. You can adjust the widths or use 'flex' as needed.
  const columns = [
    { field: 'timestamp', headerName: t('timestamp'), width: 210 },
    { field: 'ip', headerName: t('ip_address'), width: 120 },
    { field: 'method', headerName: t('method'), width: 100 },
    { field: 'url', headerName: t('url'), flex: 1 },
    { field: 'status', headerName: t('status'), width: 70 },
    { field: 'responseTime', headerName: t('response_time'), width: 90 },
  ];

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
