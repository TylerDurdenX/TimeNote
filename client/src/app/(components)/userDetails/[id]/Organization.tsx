// components/UserHierarchy.tsx
import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
} from '@mui/material';

interface User {
  id: number;
  name: string;
  designation: string;
  imageUrl: string;
  reportsTo: string | null;
}

const orgHierarchy: User[] = [
  {
    id: 1,
    name: 'A',
    designation: 'CEO',
    imageUrl: 'https://example.com/john-doe.jpg',
    reportsTo: null,
  },
  {
    id: 2,
    name: 'B',
    designation: 'CTO',
    imageUrl: 'https://example.com/jane-smith.jpg',
    reportsTo: 'John Doe',
  },
  {
    id: 3,
    name: 'C',
    designation: 'Lead Developer',
    imageUrl: 'https://example.com/emily-davis.jpg',
    reportsTo: 'Jane Smith',
  },
  {
    id: 4,
    name: 'D',
    designation: 'COO',
    imageUrl: 'https://example.com/michael-brown.jpg',
    reportsTo: 'John Doe',
  },
  // New users reporting to CTO (Jane Smith)
  {
    id: 5,
    name: 'E',
    designation: 'Software Engineer',
    imageUrl: 'https://example.com/sarah-johnson.jpg',
    reportsTo: 'Jane Smith',
  },
  {
    id: 6,
    name: 'F',
    designation: 'Frontend Developer',
    imageUrl: 'https://example.com/david-lee.jpg',
    reportsTo: 'Jane Smith',
  },
  {
    id: 7,
    name: 'G',
    designation: 'Backend Developer',
    imageUrl: 'https://example.com/samantha-green.jpg',
    reportsTo: 'Jane Smith',
  },
];

// Function to render each user in the org hierarchy
const renderOrgTree = (orgHierarchy: User[]) => {
  return orgHierarchy.map((person) => (
    <Box key={person.id} sx={{ marginBottom: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      {/* Line to indicate report relationships */}
      {person.reportsTo && (
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: '-10px',
            width: '2px',
            height: '10px',
            backgroundColor: '#555',
            transform: 'translateX(-50%)',
          }}
        />
      )}
      <Paper
        elevation={3}
        sx={{
          padding: 2,
          display: 'flex',
          alignItems: 'center', // Align avatar and text horizontally
          backgroundColor: '#f5f5f5',
          borderRadius: 2,
          boxShadow: 2,
          width: '100%',
        }}
      >
        <Avatar sx={{ width: 60, height: 60, marginRight: 2 }} src={person.imageUrl} alt={person.name} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
            {person.name}
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '0.9rem', color: '#555' }}>
            {person.designation}
          </Typography>
          {person.reportsTo && (
            <Typography variant="caption" color="textSecondary" sx={{ marginTop: 0.5 }}>
              Reports to: {person.reportsTo}
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  ));
};

const Organization = () => {
  return (
    <div className="flex justify-center items-center py-8">
        <div className="pt-4">
          {/* Align CEO and CTO vertically */}
          <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
            {renderOrgTree([orgHierarchy[0], orgHierarchy[1]])}
          </Box>

          {/* Horizontal line connecting users reporting to the same person */}
          <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 4 }}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                width: '100%',
                height: '2px',
                backgroundColor: '#555',
                zIndex: -1,
              }}
            />
            {renderOrgTree([orgHierarchy[2], orgHierarchy[5], orgHierarchy[6]])}
          </Box>

          {/* Bottom row with 2 people reporting to COO */}
          <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', marginTop: 4 }}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                width: '100%',
                height: '2px',
                backgroundColor: '#555',
                zIndex: -1,
              }}
            />
            {renderOrgTree([orgHierarchy[3], orgHierarchy[4]])}
          </Box>
        </div>
    </div>
  );
};

export default Organization;
