import React from 'react';

const DataTable = ({ data }) => {
  if (!data || data.length === 0) return null;

  try {
    const headers = Object.keys(data[0]);

    return (
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {headers.map((header) => (
                <td key={header}>{row[header]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  } catch (error) {
    console.error('Error rendering table:', error);
    return <div>Failed to load data</div>;
  }
};

export default DataTable;
