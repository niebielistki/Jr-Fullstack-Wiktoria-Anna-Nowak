import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Button,
  Box,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useTheme } from '@mui/material/styles';
import FileUpload from './FileUpload';
import Pagination from './Pagination';
import DataTable from './DataTable';
import DataEnrichment from './DataEnrichment';
import axios from 'axios';

const App = () => {
  const theme = useTheme();
  const [data, setData] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [csvKeyColumn, setCsvKeyColumn] = useState('');
  const [apiResponseKey, setApiResponseKey] = useState('');
  const [enrichedData, setEnrichedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(40); // Increased rows per page
  const [displayAll, setDisplayAll] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [newFileName, setNewFileName] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const fetchFiles = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/files');
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileUpload = (uploadedData) => {
    setData(uploadedData);
    setSelectedFile(uploadedData.fileName); // Automatically display the newly uploaded file
    fetchFiles();
  };

  const handleFileClick = async (fileName) => {
    if (selectedFile === fileName) {
      setSelectedFile(null);  // Collapse the view
      setData([]); // Clear the data
    } else {
      setSelectedFile(fileName);  // Expand the view
      try {
        const response = await axios.get(`http://localhost:8000/api/files/${fileName}`);
        setData(response.data);
        setCurrentPage(1); // Reset to first page on new file selection
      } catch (error) {
        console.error('Error fetching file content:', error);
      }
    }
  };

  const handleEnrichData = async (apiEndpoint, csvKeyColumn, apiResponseKey) => {
    if (!selectedFile) {
      setSnackbarMessage('Please select a file from the Uploaded Files list to enrich.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/enrich', {
        apiEndpoint,
        csvKeyColumn,
        apiResponseKey,
        fileName: selectedFile
      });
      setEnrichedData(response.data);
      fetchFiles();  // Refresh file list to include the new enriched file
      setSnackbarMessage(`Data enriched successfully. New file created: ${response.data.newFileName}`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setSelectedFile(response.data.newFileName); // Display the newly enriched file
      const enrichedFileResponse = await axios.get(`http://localhost:8000/api/files/${response.data.newFileName}`);
      setData(enrichedFileResponse.data);
    } catch (error) {
      console.error('Error enriching data:', error);
      setSnackbarMessage('Error enriching data. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteFile = async (fileName) => {
    try {
      await axios.delete(`http://localhost:8000/api/files/delete/${fileName}`);
      fetchFiles();
      setSnackbarMessage(`File "${fileName}" was deleted successfully.`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      if (selectedFile === fileName) {
        setSelectedFile(null);
        setData([]);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      setSnackbarMessage(`Failed to delete file "${fileName}".`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleRenameFile = async (fileName) => {
    if (newFileName.trim() === '') {
      alert('New file name cannot be empty');
      return;
    }
    try {
      await axios.put(`http://localhost:8000/api/files/rename/${fileName}`, { newFileName });
      fetchFiles();
      setEditingFile(null);
      setNewFileName('');
      setSnackbarMessage(`File "${fileName}" was renamed to "${newFileName}" successfully.`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      if (selectedFile === fileName) {
        setSelectedFile(newFileName);
      }
    } catch (error) {
      console.error('Error renaming file:', error);
      setSnackbarMessage(`Failed to rename file "${fileName}".`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = displayAll ? (selectedFile ? data : enrichedData) : (selectedFile ? data : enrichedData).slice(indexOfFirstRow, indexOfLastRow);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const handleDisplayAllToggle = () => setDisplayAll(!displayAll);

  return (
    <Container>
      <Typography variant="h2" gutterBottom>
        CSV File Upload and Preview
      </Typography>
      <FileUpload onFileUpload={handleFileUpload} setSelectedFile={setSelectedFile} />
      <Paper elevation={3} sx={{ mt: 2, p: 2 }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.secondary.dark }}>
              Uploaded Files
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {files.map((file, index) => (
                <ListItem
                  key={index}
                  button
                  selected={selectedFile === file}
                  onClick={() => handleFileClick(file)}
                  sx={{
                    '&:hover': {
                      backgroundColor: '#f1f1f1',
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#d3d3d3',
                      '&:hover': {
                        backgroundColor: '#c1c1c1',
                      },
                    },
                  }}
                >
                  {editingFile === file ? (
                    <TextField
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleRenameFile(file);
                        }
                      }}
                    />
                  ) : (
                    <ListItemText secondary={file} />
                  )}
                  {editingFile === file ? (
                    <IconButton onClick={() => handleRenameFile(file)}>
                      <SaveIcon />
                    </IconButton>
                  ) : (
                    <IconButton onClick={() => {
                      setEditingFile(file);
                      setNewFileName(file);
                    }}>
                      <EditIcon />
                    </IconButton>
                  )}
                  <IconButton onClick={() => handleDeleteFile(file)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      </Paper>
      <Paper elevation={3} sx={{ mt: 2, p: 2 }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.secondary.dark }}>
              Enrich Data
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <DataEnrichment
              apiEndpoint={apiEndpoint}
              setApiEndpoint={setApiEndpoint}
              csvKeyColumn={csvKeyColumn}
              setCsvKeyColumn={setCsvKeyColumn}
              apiResponseKey={apiResponseKey}
              setApiResponseKey={setApiResponseKey}
              onEnrichData={handleEnrichData}
              data={data}
            />
          </AccordionDetails>
        </Accordion>
      </Paper>
      {selectedFile && (
        <Box mt={4}>
          <Typography variant="h6">
            Currently Viewing: {selectedFile}
          </Typography>
        </Box>
      )}
      <DataTable data={currentRows} />
      {((selectedFile ? data : enrichedData).length > rowsPerPage) && (
        <Box mt={4}>
          <Pagination
            rowsPerPage={rowsPerPage}
            totalRows={(selectedFile ? data : enrichedData).length}
            paginate={paginate}
            currentPage={currentPage}
            handleDisplayAllToggle={handleDisplayAllToggle}
            displayAll={displayAll}
          />
        </Box>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default App;
