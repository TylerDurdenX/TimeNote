import React, { useState } from "react";
import { CloudUpload, Download } from "@mui/icons-material"; // Use MUI icons for modern feel
import { Box, Button } from "@mui/material"; // MUI Button for better UI

const BulkCreate: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Half - File Drag and Drop */}
      <div className="w-1/2 flex flex-col items-center justify-center p-8 ">
        <div
          className="w-full h-64 border-dashed border-4 border-gray-300 rounded-xl flex flex-col items-center justify-center"
          onDrop={handleFileDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <CloudUpload className="text-gray-600 text-4xl" />
          <p className="text-gray-600 mt-4 text-lg">Drag & Drop a file here</p>
        </div>
      </div>

      {/* Right Half - Buttons Section */}
      <div className="w-1/2 flex flex-col items-center justify-center p-8">
      <Box className="flex flex-col items-center justify-center space-y-6 w-full">
      {/* Download Format Button */}
      <Button
        variant="contained"
        color="primary"
        startIcon={<Download />}
        className="w-64 py-3 text-lg font-medium rounded-xl shadow-lg hover:bg-blue-600 transition duration-300"
        //disabled={!file} // Disable if no file is selected
        sx={{
          textTransform: 'none', // Remove the uppercase text transform
          boxShadow: 3, // Adds a subtle shadow effect
          '&:hover': {
            boxShadow: 6, // Hover effect shadow
          }
        }}
      >
        Download Format
      </Button>

      {/* Choose File Button */}
      <input
        type="file"
        id="fileInput"
        className="hidden"
        onChange={handleFileSelect}
      />
      <label htmlFor="fileInput">
        <Button
          variant="outlined"
          color="secondary"
          className="w-64 py-3 text-lg font-medium rounded-xl shadow-lg hover:bg-gray-100 transition duration-300"
          sx={{
            textTransform: 'none', // Remove the uppercase text transform
            boxShadow: 3, // Adds a subtle shadow effect
            '&:hover': {
              boxShadow: 6, // Hover effect shadow
            }
          }}
        >
          Choose File
        </Button>
      </label>
    </Box>
      </div>
    </div>
  );
};

export default BulkCreate;
