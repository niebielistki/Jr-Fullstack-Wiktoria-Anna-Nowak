import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextField, Box, Snackbar, Alert } from '@mui/material';

const FileUpload = ({ onFileUpload, setSelectedFile }) => {
  const [file, setFile] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!file) {
      setSnackbarMessage('Please select a file first');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (file.name.split('.').pop().toLowerCase() !== 'csv') {
      setSnackbarMessage('Only .csv files can be imported into the program.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.message === 'File uploaded successfully') {
        onFileUpload(response.data.data); // Immediately display the uploaded file
        setSelectedFile(file.name); // Set the newly uploaded file as the selected file
        setSnackbarMessage('Your file has imported correctly. You will find it on the "Uploaded Files" list.');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
    } catch (error) {
      if (error.response && error.response.data.error === 'File already exists') {
        setSnackbarMessage('The file has already been imported before. Check the Uploaded Files section.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } else {
        console.error('Error uploading file:', error);
        setSnackbarMessage('Error uploading file. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box display="flex" alignItems="center" mt={2}>
      <Button
        variant="contained"
        component="label"
      >
        Choose File
        <input
          type="file"
          hidden
          onChange={handleFileChange}
        />
      </Button>
      {file && <TextField
        value={file.name}
        variant="outlined"
        size="small"
        margin="normal"
        disabled
        sx={{ ml: 2 }}
      />}
      <Button
        variant="contained"
        color="primary"
        onClick={handleFileUpload}
        sx={{ ml: 2 }}
      >
        Upload
      </Button>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FileUpload;
