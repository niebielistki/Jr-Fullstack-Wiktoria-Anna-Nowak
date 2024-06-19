import React from 'react';

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
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          API Endpoint URL:
          <input
            type="text"
            value={apiEndpoint}
            onChange={(e) => setApiEndpoint(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          CSV Key Column:
          <select
            value={csvKeyColumn}
            onChange={(e) => setCsvKeyColumn(e.target.value)}
            required
          >
            {headers.map((header) => (
              <option key={header} value={header}>
                {header}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <label>
          API Response Key:
          <input
            type="text"
            value={apiResponseKey}
            onChange={(e) => setApiResponseKey(e.target.value)}
            required
          />
        </label>
      </div>
      <button type="submit">Enrich Data</button>
    </form>
  );
};

export default DataEnrichment;
