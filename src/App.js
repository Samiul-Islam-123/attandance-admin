import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
} from '@mui/material';
import { CSVLink } from 'react-csv';
import { io } from 'socket.io-client';
import CircularProgress from '@mui/material/CircularProgress';

function App() {
  const socket = io('http://localhost:3001');
  const [loading, setLoading] = useState(false);

  const [tableData, setTableData] = useState([]);
  const [data, setData] = useState([]);

  useEffect(() => {
    socket.on('current-data', (data) => {
      setTableData(data);
      setData(data); // Initialize data state with the received data
    });

    socket.on('ready-camera', (status) => {
      setLoading(status);
    });
  }, [socket]);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    const filteredData = tableData.filter(
      (row) => row.time.toLowerCase().includes(term) || row.studentName.toLowerCase().includes(term)
    );
    setData(filteredData);
  };

  const handleSort = () => {
    const sortedData = [...data].sort((a, b) => {
      return sortDirection === 'asc' ? a.time.localeCompare(b.time) : b.time.localeCompare(a.time);
    });
    setData(sortedData);
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const csvData = [
    ['TIME', 'Student Name'],
    ...data.map((row) => [row.time, row.studentName]),
  ];

  return (
    <Container>
      <Typography variant="h4">Attendance Data</Typography>
      <Button variant='contained' onClick={()=>{
        socket.emit('start-camera');
      }}>start</Button>
      {loading && <CircularProgress />}
      {!loading && (
        <>
          <TextField
            label="Search"
            variant="outlined"
            margin="normal"
            value={searchTerm}
            onChange={handleSearch}
          />
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell onClick={handleSort}>TIME</TableCell>
                  <TableCell>Student Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.time}</TableCell>
                    <TableCell>{row.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Button variant="contained" color="primary" style={{ marginTop: '10px' }}>
            <CSVLink data={csvData} filename={'attendance-data.csv'}>
              Download CSV
            </CSVLink>
          </Button>
        </>
      )}
    </Container>
  );
}

export default App;
