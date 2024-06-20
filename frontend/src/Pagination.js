import React from 'react';
import { Box, Button, Pagination as MuiPagination, Stack } from '@mui/material';

const Pagination = ({ rowsPerPage, totalRows, paginate, currentPage, handleDisplayAllToggle, displayAll }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalRows / rowsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <Box display="flex" justifyContent="flex-end" alignItems="center" mt={2}>
      <Stack direction="row" spacing={2}>
        {!displayAll && (
          <MuiPagination
            count={pageNumbers.length}
            page={currentPage}
            onChange={(event, value) => paginate(value)}
            variant="outlined"
            color="secondary"
          />
        )}
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleDisplayAllToggle}
        >
          {displayAll ? 'Show Paginated' : 'Display All on One Page'}
        </Button>
      </Stack>
    </Box>
  );
};

export default Pagination;
