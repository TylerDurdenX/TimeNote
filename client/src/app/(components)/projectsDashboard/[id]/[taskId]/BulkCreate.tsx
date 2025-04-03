"use client";

import React, { useEffect, useState } from "react";
import { CloudUpload, Download } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import { SprintResponse, TaskFormData } from "@/store/interfaces";
import { toast } from "react-hot-toast";
import ExcelJS from "exceljs";
import { useCreateBulkTasksMutation } from "@/store/api";

type Props = {
  sprintList: SprintResponse[];
  email: string;
  projectId: number;
  setIsOpen: (isOpen: boolean) => void;
};

const BulkCreate = ({ sprintList, email, projectId, setIsOpen }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedData, setUploadedData] = useState<any[]>([]);

  const [createBulkTasks] = useCreateBulkTasksMutation();

  const allowedExtensions = [".xls", ".xlsx"];
  const maxSize = 1 * 1024 * 1024; // in bytes

  const [taskList, setTaskList] = useState<TaskFormData[]>();
  const [isOver, setIsOver] = useState(false);

  let sprints: string[] = [];
  sprintList.map((sprint) => {
    sprints.push(sprint.title);
  });

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const file = e.dataTransfer?.files[0];
    if (file) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (fileExtension && !allowedExtensions.includes(`.${fileExtension}`)) {
        toast.error("File extension not allowed!");
      } else if (file.size > maxSize) {
        toast.error("File size must be less than 1 MB!");
      } else {
        validateExcelData(file);
      }
    }
    setIsOver(false);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    document.addEventListener("dragover", handleGlobalDragOver);
    return () => {
      document.removeEventListener("dragover", handleGlobalDragOver);
    };
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (fileExtension && !allowedExtensions.includes(`.${fileExtension}`)) {
        toast.error("File extension not allowed!");
      } else if (file.size > maxSize) {
        toast.error("File size must be less than 1 MB!");
      } else {
        validateExcelData(file);
      }
    }
  };

  const validateExcelData = (file: File) => {
    const fileReader = new FileReader();

    // Read the file as binary string
    fileReader.readAsArrayBuffer(file);

    fileReader.onload = async () => {
      try {
        const workbook = new ExcelJS.Workbook();
        const buffer = fileReader.result as ArrayBuffer;
        await workbook.xlsx.load(buffer);

        const worksheet = workbook.worksheets[0];

        // Extract data from the worksheet
        const data: any[] = [];
        let errors: string[] = []; // To hold any validation errors
        let tasksList: TaskFormData[] = [];
        worksheet.eachRow({ includeEmpty: true }, (row, rowIndex) => {
          if (rowIndex === 1) return;

          const firstCell = row.getCell(1).text.trim();
          const secondCell = row.getCell(2).text.trim();
          if (!firstCell && !secondCell) return; // Skip rows where the first cell is empty

          const rowData: any = {};
          let rowIsValid = true;
          let rowTaskData: TaskFormData = Object.create(null);
          row.eachCell({ includeEmpty: true }, (cell, colIndex) => {
            rowData[`col${colIndex}`] = cell.text;
            if (colIndex > 9) return;

            if (colIndex === 1) {
              if (!cell.text.trim()) {
                rowIsValid = false;
                errors.push(`Row ${rowIndex} - Task Name cannot be empty.`);
              } else {
                if (cell.text.includes("?") || cell.text.includes("=")) {
                  rowIsValid = false;
                  errors.push(
                    `Row ${rowIndex} - Task Name cannot have special characters`
                  );
                } else {
                  rowTaskData.title = cell.text;
                  rowTaskData.authorUserId = email;
                  rowTaskData.projectId = projectId;
                }
              }
            }
            if (colIndex === 2) {
              if (!cell.text.trim()) {
                rowIsValid = false;
                errors.push(
                  `Row ${rowIndex} - Task Description cannot be empty.`
                );
              } else {
                rowTaskData.description = cell.text;
              }
            }
            if (colIndex === 3) {
              if (!cell.text.trim()) {
                rowIsValid = false;
                errors.push(`Row ${rowIndex} - Task Priority cannot be empty.`);
              } else {
                rowTaskData.priority = cell.text;
              }
            }
            if (colIndex === 4) {
              if (isNaN(Number(cell.text))) {
                errors.push(
                  `Row ${rowIndex} - Column ${colIndex} must be a number.`
                );
              } else {
                if (!cell.text.trim()) {
                  rowIsValid = false;
                  errors.push(
                    `Row ${rowIndex} - Estimated hours cannot be empty.`
                  );
                } else {
                  rowTaskData.points = cell.text;
                }
              }
            }
            if (colIndex === 5) {
              if (!cell.text.trim()) {
                rowIsValid = false;
                errors.push(`Row ${rowIndex} - Start Date cannot be empty.`);
              } else {
                rowTaskData.startDate = cell.value!.toString();
              }
            }
            if (colIndex === 6) {
              if (!cell.text.trim()) {
                rowIsValid = false;
                errors.push(`Row ${rowIndex} - Due Date cannot be empty.`);
              } else {
                rowTaskData.dueDate = cell.value!.toString();
              }
            }
            if (colIndex === 8) {
              if (!cell.text.trim()) {
                rowIsValid = false;
                errors.push(`Row ${rowIndex} - Assigne email cannot be empty.`);
              } else {
                rowTaskData.assignedUserId = cell.text;
              }
            }
            if (colIndex === 9) {
              const sprintValue = cell.text?.trim();
              if (!sprintValue) {
                rowIsValid = false;
                errors.push(`Row ${rowIndex} - Sprint cannot be empty.`);
              } else {
                if (!sprints.includes(cell.text.trim())) {
                  rowIsValid = false;
                  errors.push(
                    `Row ${rowIndex} - Column ${colIndex} value is not correct. Found "${cell.text}".`
                  );
                } else {
                  rowTaskData.sprintId = cell.text;
                }
              }
            }
          });
          tasksList.push(rowTaskData);
        });
        setTaskList(tasksList);
        if (errors.length > 0) {
          setError(errors.join(" ")); // Set the validation errors

          // Create a new workbook to log the errors
          const errorWorkbook = new ExcelJS.Workbook();
          const errorWorksheet =
            errorWorkbook.addWorksheet("Validation Errors");

          // Add a header row for errors
          errorWorksheet.addRow(["Error", "Error Message"]);

          // Add each error to the sheet
          errors.forEach((error, index) => {
            errorWorksheet.addRow([index + 1, error]);
          });

          // Trigger the download of the error report
          const buffer = await errorWorkbook.xlsx.writeBuffer();
          const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "validation_errors.xlsx";
          link.click();
        }
        try {
          const response = await createBulkTasks(tasksList!);
          setIsOpen(false);
          if (
            // @ts-ignore
            response.error?.data.status === "Error" ||
            // @ts-ignore
            response.error?.data.status === "Fail"
          ) {
            // @ts-ignore
            toast.error(response.error?.data.message);
          } else {
            toast.success(response.data?.message!);
          }
        } catch (err: any) {
          toast.error(err.data.message);
          console.error("Error creating role:", err.data.Message);
        }
      } catch (err) {
        setError("Error reading the Excel file. Please check the file format.");
        console.error(err);
      }
    };

    fileReader.onerror = () => {
      setError("Error reading the file.");
    };
  };

  const handleDownload = () => {
    toast.success("Please wait, the download will begin shortly");
    const link = document.createElement("a");
    link.href = "/assets/Create Tasks.xlsx";
    link.download = "Create Tasks.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-full">
      {/* Left Half - File Drag and Drop */}
      <div className="w-1/2 flex flex-col items-center justify-center p-8 ">
        <div className="w-full">
          {/* File input */}

          {/* Drag-and-drop area */}
          <div
            className={`w-full h-64 border-dashed border-4 border-gray-300 rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${
              isOver ? "bg-gray-200 scale-105 shadow-lg" : "bg-white"
            }`}
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            style={{
              position: "relative",
              zIndex: 1500,
            }}
          >
            <CloudUpload className="text-gray-600 text-4xl" />
            <p className="text-gray-600 mt-4 text-lg">
              Drag & Drop a file here
            </p>
          </div>
          {file && <div>Selected file: {file.name}</div>}
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
            onClick={handleDownload}
            className="w-64 py-3 text-lg font-medium rounded-xl shadow-lg hover:bg-blue-600 transition duration-300"
            //disabled={!file} // Disable if no file is selected
            sx={{
              textTransform: "none", // Remove the uppercase text transform
              boxShadow: 3, // Adds a subtle shadow effect
              "&:hover": {
                boxShadow: 6, // Hover effect shadow
              },
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
            accept=".xlsx, .xls"
          />
          <label htmlFor="fileInput">
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => document.getElementById("fileInput")?.click()}
              className="w-64 py-3 text-lg font-medium rounded-xl shadow-lg hover:bg-gray-100 transition duration-300"
              sx={{
                textTransform: "none",
                boxShadow: 3,
                "&:hover": {
                  boxShadow: 6,
                },
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
