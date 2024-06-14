import React, { useState } from 'react';
import FileUpload from './FileUpload';
import DataTable from './DataTable';

const App = () => {
  const [data, setData] = useState([]);

  const handleFileUpload = (uploadedData) => {
    setData(uploadedData);
  };

  return (
    <div>
      <h1>CSV File Upload and Preview</h1>
      <FileUpload onFileUpload={handleFileUpload} />
      <DataTable data={data} />
    </div>
  );
};

export default App;
