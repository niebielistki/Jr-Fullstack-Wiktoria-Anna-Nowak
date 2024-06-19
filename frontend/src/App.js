import React, { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import Pagination from './Pagination';
import DataTable from './DataTable';
import DataEnrichment from './DataEnrichment';
import axios from 'axios';

const App = () => {
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
    try {
      const response = await axios.post('http://localhost:8000/api/enrich', {
        apiEndpoint,
        csvKeyColumn,
        apiResponseKey,
        fileName: selectedFile
      });
      setEnrichedData(response.data);
      fetchFiles();  // Refresh file list to include the new enriched file
    } catch (error) {
      console.error('Error enriching data:', error);
    }
  };

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = displayAll ? (selectedFile ? data : enrichedData) : (selectedFile ? data : enrichedData).slice(indexOfFirstRow, indexOfLastRow);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const handleDisplayAllToggle = () => setDisplayAll(!displayAll);

  return (
    <div>
      <h1>CSV File Upload and Preview</h1>
      <FileUpload onFileUpload={handleFileUpload} />
      <h2>Uploaded Files</h2>
      <ul>
        {files.map((file, index) => (
          <li key={index} onClick={() => handleFileClick(file)}>
            {file}
          </li>
        ))}
      </ul>
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
      <DataTable data={currentRows} />
      {((selectedFile ? data : enrichedData).length > rowsPerPage) && (
        <div>
          <Pagination
            rowsPerPage={rowsPerPage}
            totalRows={(selectedFile ? data : enrichedData).length}
            paginate={paginate}
            currentPage={currentPage}
          />
          <button onClick={handleDisplayAllToggle}>
            {displayAll ? 'Show Paginated' : 'Display All on One Page'}
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
