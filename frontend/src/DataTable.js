import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText
} from '@mui/material';
import { CSVLink } from 'react-csv';

const DataTable = ({ data }) => {
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleColumns, setVisibleColumns] = useState([]);

  const headers = useMemo(() => {
    return data && data.length > 0 ? Object.keys(data[0]) : [];
  }, [data]);

  useEffect(() => {
    // Set all columns as visible by default
    setVisibleColumns(headers);
  }, [headers]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(row =>
      headers.some(header =>
        row[header]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm, headers]);

  const sortedData = useMemo(() => {
    if (!filteredData) return [];

    let sortableData = [...filteredData];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [filteredData, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getColumnWidth = (header) => {
    const lengths = data.map(row => (row[header] ? row[header].toString().length : 0));
    const maxLength = Math.max(...lengths);
    return `${Math.min(Math.max(maxLength, 10), 30)}ch`;
  };

  const handleColumnVisibilityChange = (event) => {
    const { value } = event.target;
    setVisibleColumns(value);
  };

  const handleSelectAllClick = () => {
    if (visibleColumns.length === headers.length) {
      setVisibleColumns([]);
    } else {
      setVisibleColumns(headers);
    }
  };

  const renderSelectedColumns = (selected) => {
    if (selected.length > 3) {
      return `${selected.slice(0, 3).join(', ')}...`;
    }
    return selected.join(', ');
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField
          label="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ width: '300px' }}
        />
        <CSVLink data={data} filename="table_data.csv" style={{ textDecoration: 'none' }}>
          <Button variant="contained" color="primary">
            Export to CSV
          </Button>
        </CSVLink>
      </Box>
      <FormControl variant="outlined" sx={{ mb: 2, minWidth: 300 }}>
        <InputLabel>Visible Columns</InputLabel>
        <Select
          multiple
          value={visibleColumns}
          onChange={handleColumnVisibilityChange}
          renderValue={renderSelectedColumns}
          label="Visible Columns"
        >
          <MenuItem>
            <Checkbox
              checked={visibleColumns.length === headers.length}
              indeterminate={visibleColumns.length > 0 && visibleColumns.length < headers.length}
              onClick={handleSelectAllClick}
            />
            <ListItemText primary="Select All" />
          </MenuItem>
          {headers.map((header) => (
            <MenuItem key={header} value={header}>
              <Checkbox checked={visibleColumns.includes(header)} />
              <ListItemText primary={header} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TableContainer component={Paper} sx={{ maxWidth: '100%' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                visibleColumns.includes(header) && (
                  <TableCell
                    key={header}
                    onClick={() => requestSort(header)}
                    style={{ width: getColumnWidth(header), borderRight: '1px solid rgba(224, 224, 224, 1)' }}
                  >
                    <TableSortLabel
                      active={sortConfig.key === header}
                      direction={sortConfig.direction}
                    >
                      {header}
                    </TableSortLabel>
                  </TableCell>
                )
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((row, index) => (
              <TableRow key={index}>
                {headers.map((header) => (
                  visibleColumns.includes(header) && (
                    <TableCell key={header} style={{ width: getColumnWidth(header), borderRight: '1px solid rgba(224, 224, 224, 1)' }}>
                      {row[header]}
                    </TableCell>
                  )
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DataTable;
