import React from 'react';
import { TextField, Button, MenuItem, Select, InputLabel, FormControl, Box, Typography } from '@mui/material';

const DataEnrichment = ({
  apiEndpoint,
  setApiEndpoint,
  csvKeyColumn,
  setCsvKeyColumn,
  apiResponseKey,
  setApiResponseKey,
  onEnrichData,
  data
}) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    onEnrichData(apiEndpoint, csvKeyColumn, apiResponseKey);
  };

  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        To properly enrich data, you must first select a file from the Uploaded Files list.
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <TextField
          label="API Endpoint URL"
          value={apiEndpoint}
          onChange={(e) => setApiEndpoint(e.target.value)}
          required
        />
      </FormControl>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>CSV Key Column</InputLabel>
        <Select
          value={csvKeyColumn}
          onChange={(e) => setCsvKeyColumn(e.target.value)}
          required
        >
          {headers.map((header) => (
            <MenuItem key={header} value={header}>
              {header}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <TextField
          label="API Response Key"
          value={apiResponseKey}
          onChange={(e) => setApiResponseKey(e.target.value)}
          required
        />
      </FormControl>
      <Button type="submit" variant="contained" color="primary">
        Enrich Data
      </Button>
    </Box>
  );
};

export default DataEnrichment;
