import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const dataGridClassNames = 
"border border-gray-200 bg-white shadow dark:border-stroke-dark dark:bg-dark-secondary dark:text-gray-200"

export const dataGridSxStyles = (isDarkMode: boolean) => {
    return {
        // Target the entire grid's background
        "& .MuiDataGrid-root": {
            backgroundColor: `${isDarkMode ? "#121212" : "#ffffff"}`, // Set grid background color
        },
        // Target column headers
        "& .MuiDataGrid-columnHeaders": {
            color: `${isDarkMode ? "#e5e7eb" : "#000"}`, // Column header text color
            '& [role="row"] > *': {
                backgroundColor: `${isDarkMode ? "#1d1f21" : "#ffffff"}`, // Header background
                borderColor: `${isDarkMode ? "#2d3135" : "#e5e7eb"}`, // Header border color
            }
        },
        // Icon buttons and pagination
        "& .MuiIconButton-root": {
            color: `${isDarkMode ? "#a3a3a3" : "#000"}` // Icon button color
        },
        "& .MuiTablePagination-root": {
            color: `${isDarkMode ? "#a3a3a3" : "#000"}`, // Pagination color
            backgroundColor: `${isDarkMode ? "#121212" : "#ffffff"}`, // Pagination background color
        },
        "& .MuiTablePagination-selectIcon": {
            color: `${isDarkMode ? "#a3a3a3" : "#000"}` // Pagination select icon color
        },
        // Target the cells (text and background color)
        "& .MuiDataGrid-cell": {
            border: "none", // Removing cell borders
            color: `${isDarkMode ? "#e5e7eb" : "#000"}`, // Cell text color
            backgroundColor: `${isDarkMode ? "#1d1f21" : "#ffffff"}`, // Cell background color
        },
        // Rows styling (specific for dark/light mode)
        "& .MuiDataGrid-row": {
            backgroundColor: `${isDarkMode ? "#1d1f21" : "#ffffff"}`, // Row background color
            borderBottom: `1px solid ${isDarkMode ? "#2d3135" : "#e5e7eb"}`, // Row border color
        },
        // Cells with specific borders
        "& .MuiDataGrid-withBorderColor": {
            borderColor: `${isDarkMode ? "#2d3135" : "#e5e7eb"}` // Grid border color
        },
        // Footer and pagination styling for dark mode
        "& .MuiDataGrid-footerContainer": {
            backgroundColor: `${isDarkMode ? "#121212" : "#ffffff"}`, // Footer background color
            color: `${isDarkMode ? "#a3a3a3" : "#000"}`, // Footer text color
        },
        "& .MuiPaginationItem-root": {
            color: `${isDarkMode ? "#a3a3a3" : "#000"}`, // Pagination item color
        },
    };
};
