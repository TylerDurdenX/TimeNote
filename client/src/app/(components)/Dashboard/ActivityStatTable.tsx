import * as React from 'react';
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, LinearProgress, Box, Button } from '@mui/material';

type Props = { 
    activeTrend: boolean;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.grey[50], // Very light gray background for the header
    color: theme.palette.text.primary, // Dark text for contrast
    fontWeight: 600,
    fontSize: 16,
    padding: '12px 16px',
    borderBottom: '2px solid #e0e0e0', // Light border for header
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    padding: '12px 16px', // Consistent padding for better spacing
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:last-child td, &:last-child th': {
    border: 0, // No border on last row
  },
}));

function createData(
  name: string,
  percentage: number,
  percentageText: number,
) {
  return { name, percentage, percentageText };
}

const rows = [
  createData('Mayank', 96, 96.0),
  createData('Harsh', 89, 89.0),
  createData('Aman', 91, 91.0),
];

export default function ActivityStatTables({activeTrend}: Props) {
    return (
        <TableContainer component={Paper} sx={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
          <Table sx={{ minWidth: 600 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell>#</StyledTableCell>
                <StyledTableCell>Name</StyledTableCell>
                <StyledTableCell align="center">Avg. Activity (Last 7 days)</StyledTableCell>
                <StyledTableCell align="right">Percentage</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => {
                const carbsPercentage = (row.percentage / 100) * 100;
                const proteinPercentage = (row.percentageText / 100) * 100;

                // Set percentage color based on value
                let percentageColor = 'red'; // Default color (below 50%)
                let buttonBgColor = 'rgba(255, 99, 71, 0.1)'; // Light red

                if (row.percentage > 75) {
                  percentageColor = 'green';
                  buttonBgColor = 'rgba(34, 139, 34, 0.1)'; // Light green
                } else if (row.percentage > 50) {
                  percentageColor = 'orange';
                  buttonBgColor = 'rgba(255, 165, 0, 0.1)'; // Light orange
                }

                return (
                  <StyledTableRow key={row.name}>
                    {/* Numbered column */}
                    <StyledTableCell component="th" scope="row">
                      {index + 1}
                    </StyledTableCell>

                    <StyledTableCell component="th" scope="row">
                      {row.name}
                    </StyledTableCell>

                    <StyledTableCell align="center">
                      <LinearProgress
                        variant="determinate"
                        value={carbsPercentage}
                        sx={{
                          height: 8,
                          borderRadius: 5,
                          backgroundColor: activeTrend 
                            ? 'rgba(154, 198, 247, 0.9)'  // Very light green background
                            : 'rgba(222, 84, 59, 0.4)', // Slightly darker light red background
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: activeTrend 
                              ? '#1E90FF'  // Vibrant green color for the progress bar
                              : '#FF4500', // Vibrant red color for the progress bar (OrangeRed)
                          },
                        }}
                      />
                    </StyledTableCell>

                    {/* Protein Percentage with outlined button */}
                    <StyledTableCell align="right">
                      <Button
                        variant="outlined"
                        sx={{
                          borderColor: percentageColor,
                          color: percentageColor,
                          fontWeight: 600,
                          borderRadius: '8px',
                          padding: '5px 10px',
                          minWidth: '60px',
                          backgroundColor: buttonBgColor,
                          '&:hover': {
                            backgroundColor: `${percentageColor}10`, // Lighter hover effect
                            borderColor: percentageColor,
                            color: `${percentageColor}D9`, // Slightly lighter color on hover
                          },
                        }}
                      >
                        {proteinPercentage.toFixed(1)}%
                      </Button>
                    </StyledTableCell>
                  </StyledTableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
    );
}
