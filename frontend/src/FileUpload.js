import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextField, Box } from '@mui/material';

const FileUpload = ({ onFileUpload }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert('Please select a file first');
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
      }
    } catch (error) {
      if (error.response && error.response.data.error === 'File already exists') {
        alert('The file has already been imported before. Check the Uploaded Files section.');
      } else {
        console.error('Error uploading file:', error);
      }
    }
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
    </Box>
  );
};

export default FileUpload;
