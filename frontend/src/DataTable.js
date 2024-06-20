import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TableSortLabel } from '@mui/material';

const DataTable = ({ data }) => {
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });

  // Ensure headers are always derived from data
  const headers = useMemo(() => {
    return data && data.length > 0 ? Object.keys(data[0]) : [];
  }, [data]);

  // Ensure sortedData is always derived from data and sortConfig
  const sortedData = useMemo(() => {
    if (!data) return [];

    let sortableData = [...data];
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
  }, [data, sortConfig]);

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

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {headers.map((header) => (
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
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map((row, index) => (
            <TableRow key={index}>
              {headers.map((header) => (
                <TableCell key={header} style={{ width: getColumnWidth(header), borderRight: '1px solid rgba(224, 224, 224, 1)' }}>
                  {row[header]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataTable;
