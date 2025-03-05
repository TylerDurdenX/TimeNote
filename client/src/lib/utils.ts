import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const dataGridClassNames = 
"border border-gray-200 bg-white shadow dark:border-stroke-dark dark:bg-dark-secondary dark:text-gray-200"

export const dataGridSxStyles = (isDarkMode: boolean) => {
    return {
      // Target the entire grid's background and remove any surrounding borders
      "& .MuiDataGrid-root": {
        backgroundColor: `${isDarkMode ? "#121212" : "#ffffff"}`, // Set grid background color
        border: "none", // Remove grid border completely
      },
      // Target column headers
      "& .MuiDataGrid-columnHeaders": {
        color: `${isDarkMode ? "#e5e7eb" : "#000"}`, // Column header text color
        '& [role="row"] > *': {
          backgroundColor: `${isDarkMode ? "#1d1f21" : "#ffffff"}`, // Header background
          border: "none", // Remove border from column headers
        }
      },
      // Icon buttons and pagination
      "& .MuiIconButton-root": {
        color: `${isDarkMode ? "#a3a3a3" : "#000"}` // Icon button color
      },
      "& .MuiTablePagination-root": {
        color: `${isDarkMode ? "#a3a3a3" : "#000"}`, // Pagination color
        backgroundColor: `${isDarkMode ? "#1d1f21" : "#ffffff"}`, // Pagination background color
      },
      "& .MuiTablePagination-selectIcon": {
        color: `${isDarkMode ? "#a3a3a3" : "#000"}` // Pagination select icon color
      },
      //Target the cells (text and background color) and remove cell borders
      "& .MuiDataGrid-cell": {
        border: "none", // Remove cell borders
        color: `${isDarkMode ? "#e5e7eb" : "#000"}`, // Cell text color
        backgroundColor: `${isDarkMode ? "#1d1f21" : "#ffffff"}`, // Cell background color
      },
      // Rows styling (specific for dark/light mode) and removing borders
      "& .MuiDataGrid-row": {
        if(){

        },
        backgroundColor: `${isDarkMode ? "#1d1f21" : "#ffffff"}`, // Row background color
        borderBottom: "none", // Remove the border between rows
      },
      // Cells with specific borders (remove any borders in these cells as well)
      "& .MuiDataGrid-withBorderColor": {
        border: "none", // Remove any border color
      },
      // Footer and pagination styling for dark mode, remove footer border
      "& .MuiDataGrid-footerContainer": {
        backgroundColor: `${isDarkMode ? "#1d1f21" : "#ffffff"}`, // Footer background color
        color: `${isDarkMode ? "#a3a3a3" : "#000"}`, // Footer text color
        borderTop: "none", // Remove any border at the top of the footer container
      },
      "& .MuiPaginationItem-root": {
        color: `${isDarkMode ? "#a3a3a3" : "#000"}`, // Pagination item color
      },
      // Ensure the empty space between rows and footer has the correct background color
      "& .MuiDataGrid-virtualScroller": {
        backgroundColor: `${isDarkMode ? "#1d1f21" : "#ffffff"}`, // Background color for empty space between rows and footer
      },
      // Explicitly handle the footer area background and the spacing after rows
      "& .MuiDataGrid-footerContainer + .MuiDataGrid-virtualScroller": {
        backgroundColor: `${isDarkMode ? "#1d1f21" : "#ffffff"}`, // Preventing any remaining white space
      },
      // Remove borders that might be surrounding the table (e.g., grid container itself)
      "& .MuiDataGrid-viewport": {
        border: "none", // Remove border around the viewport container
      },
      // Remove last row borders if they are appearing as a white line
      "& .MuiDataGrid-row:last-child": {
        borderBottom: "none", // Ensure no border on the last row
      }
    };
  };
  
  
  
