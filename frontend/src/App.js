import React, { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import DataTable from './DataTable';
import axios from 'axios';

const App = () => {
  const [data, setData] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

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
      } catch (error) {
        console.error('Error fetching file content:', error);
      }
    }
  };

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
      <DataTable data={data} />
    </div>
  );
};

export default App;
