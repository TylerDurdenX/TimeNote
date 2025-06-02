import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { Button, Chip, Avatar, Box, Typography } from "@mui/material";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { SubTask } from "@/store/interfaces";
import SubTaskPage from "./SubTaskPage";
import { useTheme } from "next-themes";
import {
  CalendarToday,
  Schedule,
  Person,
  Assignment,
  Visibility,
  AccessTime,
} from "@mui/icons-material";

type Props = {
  subTasks: SubTask[];
  email: string;
  projectId: string;
};

const SubTaskTable = ({ subTasks, email, projectId }: Props) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      "To Do": {
        color: "#3B82F6",
        bgColor: "#EFF6FF",
        darkBgColor: "#1E3A8A",
        icon: "📋",
      },
      "Work In Progress": {
        color: "#10B981",
        bgColor: "#ECFDF5",
        darkBgColor: "#064E3B",
        icon: "⚡",
      },
      "Under Review": {
        color: "#F59E0B",
        bgColor: "#FFFBEB",
        darkBgColor: "#92400E",
        icon: "👀",
      },
      Completed: {
        color: "#8B5CF6",
        bgColor: "#F3E8FF",
        darkBgColor: "#581C87",
        icon: "✅",
      },
    };
    return (
      configs[status as keyof typeof configs] || {
        color: "#6B7280",
        bgColor: "#F9FAFB",
        darkBgColor: "#374151",
        icon: "❓",
      }
    );
  };

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Task Title",
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 2 }}>
          <Assignment sx={{ color: "#6B7280", fontSize: 18 }} />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: "text.primary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
      minWidth: 250,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            py: 2,
          }}
        >
          {params.value || "No description provided"}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 140,
      renderCell: (params) => {
        const config = getStatusConfig(params.value);
        const { theme } = useTheme();
        const isDark = theme === "dark";

        return (
          <Chip
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <span>{config.icon}</span>
                <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                  {params.value}
                </span>
              </Box>
            }
            sx={{
              backgroundColor: isDark ? config.darkBgColor : config.bgColor,
              color: isDark ? "#ffffff" : config.color,
              fontWeight: 600,
              border: `1px solid ${config.color}20`,
              "& .MuiChip-label": {
                px: 1.5,
                py: 0.5,
              },
            }}
            size="small"
          />
        );
      },
    },
    {
      field: "startDate",
      headerName: "Start Date",
      flex: 1,
      minWidth: 130,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 2 }}>
          <CalendarToday sx={{ color: "#10B981", fontSize: 16 }} />
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", fontSize: "0.8rem" }}
          >
            {formatDate(params.value)}
          </Typography>
        </Box>
      ),
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      flex: 1,
      minWidth: 130,
      renderCell: (params) => {
        const isOverdue =
          new Date(params.value) < new Date() &&
          params.row.status !== "Completed";
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 2 }}>
            <Schedule
              sx={{
                color: isOverdue ? "#EF4444" : "#F59E0B",
                fontSize: 16,
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: isOverdue ? "#EF4444" : "text.secondary",
                fontSize: "0.8rem",
                fontWeight: isOverdue ? 600 : 400,
              }}
            >
              {formatDate(params.value)}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "consumedTime",
      headerName: "Time Spent",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 2 }}>
          <AccessTime sx={{ color: "#8B5CF6", fontSize: 16 }} />
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", fontSize: "0.8rem" }}
          >
            {params.value || "0h"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "author",
      headerName: "Author",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 2 }}>
          <Avatar
            sx={{
              width: 24,
              height: 24,
              fontSize: "0.7rem",
              bgcolor: "#3B82F6",
            }}
          >
            {(params.value?.username || "U")[0].toUpperCase()}
          </Avatar>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", fontSize: "0.8rem" }}
          >
            {params.value?.username || "Unknown"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "assignee",
      headerName: "Assignee",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 2 }}>
          <Avatar
            sx={{
              width: 24,
              height: 24,
              fontSize: "0.7rem",
              bgcolor: params.value?.username ? "#10B981" : "#9CA3AF",
            }}
          >
            {(params.value?.username || "U")[0].toUpperCase()}
          </Avatar>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", fontSize: "0.8rem" }}
          >
            {params.value?.username || "Unassigned"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "id",
      headerName: "Actions",
      flex: 0.8,
      minWidth: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={
                    <Visibility sx={{ fontSize: "16px !important" }} />
                  }
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    px: 2,
                    py: 1,
                    boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                      transform: "translateY(-1px)",
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                    },
                    "&:active": {
                      transform: "translateY(0)",
                    },
                  }}
                >
                  View
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[85vw] mt-5 mb-5 overflow-y-auto">
                <SubTaskPage
                  subTaskId={params.value}
                  email={email}
                  projectId={projectId}
                />
              </DialogContent>
            </Dialog>
          </Box>
        );
      },
    },
  ];

  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const enhancedDataGridStyles = {
    ...dataGridSxStyles(isDarkMode),
    "& .MuiDataGrid-root": {
      border: "none",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: isDarkMode
        ? "0 4px 20px rgba(0, 0, 0, 0.3)"
        : "0 4px 20px rgba(0, 0, 0, 0.08)",
    },
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: isDarkMode ? "#1F2937" : "#F8FAFC",
      borderBottom: isDarkMode ? "1px solid #374151" : "1px solid #E2E8F0",
      fontSize: "0.85rem",
      fontWeight: 700,
      color: isDarkMode ? "#F3F4F6" : "#475569",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    "& .MuiDataGrid-columnHeader": {
      "&:focus, &:focus-within": {
        outline: "none",
      },
    },
    "& .MuiDataGrid-cell": {
      borderBottom: isDarkMode ? "1px solid #374151" : "1px solid #F1F5F9",
      fontSize: "0.875rem",
      "&:focus, &:focus-within": {
        outline: "none",
      },
    },
    "& .MuiDataGrid-row": {
      backgroundColor: isDarkMode ? "#111827" : "#FFFFFF",
      "&:hover": {
        backgroundColor: isDarkMode ? "#1F2937" : "#F8FAFC",
        transform: "scale(1.001)",
        transition: "all 0.2s ease-in-out",
      },
      "&.Mui-selected": {
        backgroundColor: isDarkMode ? "#1E3A8A" : "#EFF6FF",
        "&:hover": {
          backgroundColor: isDarkMode ? "#1E40AF" : "#DBEAFE",
        },
      },
    },
    "& .MuiDataGrid-footerContainer": {
      backgroundColor: isDarkMode ? "#1F2937" : "#F8FAFC",
      borderTop: isDarkMode ? "1px solid #374151" : "1px solid #E2E8F0",
    },
    "& .MuiDataGrid-overlay": {
      backgroundColor: isDarkMode ? "#111827" : "#FFFFFF",
    },
  };

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        px: { xs: 2, xl: 3 },
        pb: 4,
        "& .MuiDataGrid-root": {
          fontFamily: "inherit",
        },
      }}
    >
      <DataGrid
        rows={subTasks || []}
        columns={columns}
        className={dataGridClassNames}
        sx={enhancedDataGridStyles}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10, 25]}
        disableRowSelectionOnClick
        disableColumnMenu
        density="comfortable"
        getRowHeight={() => 60}
        getEstimatedRowHeight={() => 60}
      />
    </Box>
  );
};

export default SubTaskTable;
