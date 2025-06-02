"use client";

import React, { useState, useCallback, useMemo } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { dataGridClassNames } from "@/lib/utils";
import {
  Button,
  DialogTitle,
  Alert,
  CircularProgress,
  Chip,
  Avatar,
  Box,
  Typography,
  Card,
  CardContent,
  Fade,
  Slide,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  LinearProgress,
  Dialog as MuiDialog,
  DialogContent as MuiDialogContent,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CheckCircle as ApprovedIcon,
  AccessTime as TimeIcon,
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  EventNote as EventNoteIcon,
  Group as GroupIcon,
  Analytics as AnalyticsIcon,
} from "@mui/icons-material";
import { useGetUsersTimesheetDataQuery } from "@/store/api";
import TimesheetDataTable from "./TimesheetDataTable";

type Props = {
  email: string;
  selectedDate: Date;
};

// Updated interface to match your API response
interface PendingTimesheetResponse {
  id: number;
  consumedHours?: string; // Made optional in case it's missing
  userId: number;
  username: string;
  projectId?: number;
  approvedHours?: string;
  // Add other properties that might exist in your API response
  hours?: string; // Alternative field name
  totalHours?: string; // Alternative field name
  loggedHours?: string; // Alternative field name
}

interface RowData extends PendingTimesheetResponse {
  consumedHours: string; // Ensure this is always available after processing
}

const UsersTimesheetTable = ({ email, selectedDate }: Props) => {
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<RowData | null>(null);

  const handleViewDetails = useCallback((row: RowData) => {
    setSelectedRow(row);
    setOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpen(false);
    setSelectedRow(null);
  }, []);

  // Fixed Dialog close handler for MUI Dialog
  const handleDialogClose = useCallback(
    (event: {}, reason: "backdropClick" | "escapeKeyDown") => {
      handleCloseDialog();
    },
    [handleCloseDialog]
  );

  const {
    data: usersTimesheetEntry,
    isLoading,
    error,
  } = useGetUsersTimesheetDataQuery(
    {
      email: email,
      date: selectedDate.toISOString(),
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !email || !selectedDate,
    }
  );

  // Process the data to ensure consumedHours exists
  const processedData = useMemo(() => {
    if (!usersTimesheetEntry) return [];

    return usersTimesheetEntry.map(
      (entry: any): RowData => ({
        ...entry,
        // Handle different possible field names for consumed hours
        consumedHours:
          entry.consumedHours ||
          entry.hours ||
          entry.totalHours ||
          entry.loggedHours ||
          "0",
      })
    );
  }, [usersTimesheetEntry]);

  const formatDate = useCallback((dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (consumed: string, approved?: string) => {
    const consumedNum = parseFloat(consumed) || 0;
    const approvedNum = parseFloat(approved || "0");

    if (approvedNum === consumedNum && approvedNum > 0) return "success";
    if (approvedNum > 0 && approvedNum < consumedNum) return "warning";
    if (consumedNum > 0 && !approvedNum) return "info";
    return "default";
  };

  const getProgressPercentage = (consumed: string, approved?: string) => {
    const consumedNum = parseFloat(consumed) || 0;
    const approvedNum = parseFloat(approved || "0");
    if (consumedNum === 0) return 0;
    return Math.min((approvedNum / consumedNum) * 100, 100);
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    ];
    return colors[index % colors.length];
  };

  // Calculate summary statistics using processed data
  const summaryStats = useMemo(() => {
    if (!processedData.length)
      return {
        totalUsers: 0,
        totalHours: 0,
        approvedHours: 0,
        pendingHours: 0,
      };

    const totalUsers = processedData.length;
    const totalHours = processedData.reduce(
      (sum, entry) => sum + (parseFloat(entry.consumedHours) || 0),
      0
    );
    const approvedHours = processedData.reduce(
      (sum, entry) => sum + parseFloat(entry.approvedHours || "0"),
      0
    );
    const pendingHours = totalHours - approvedHours;

    return { totalUsers, totalHours, approvedHours, pendingHours };
  }, [processedData]);

  const columns: GridColDef[] = [
    {
      field: "username",
      headerName: "Team Member",
      flex: 2.5,
      renderCell: (params: GridRenderCellParams) => {
        const index =
          processedData?.findIndex((user) => user.id === params.row.id) || 0;
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                width: 44,
                height: 44,
                background: getAvatarColor(index),
                fontSize: "14px",
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              {getInitials(params.value)}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {params.value}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: "consumedHours",
      headerName: "Logged Hours",
      flex: 1.8,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", mt: 1, gap: 1.5 }}>
          <TimeIcon sx={{ fontSize: 25, color: "primary.main" }} />
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Chip
              label={`${params.value || "0"}h`}
              size="small"
              variant="outlined"
              sx={{
                borderColor: "primary.main",
                color: "primary.main",
                fontWeight: 600,
                fontSize: "0.75rem",
                "& .MuiChip-label": { px: 1.5 },
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Total logged
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "approvedHours",
      headerName: "Approved Hours",
      flex: 2,
      renderCell: (params: GridRenderCellParams) => {
        const status = getStatusColor(params.row.consumedHours, params.value);
        const progress = getProgressPercentage(
          params.row.consumedHours,
          params.value
        );

        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <ApprovedIcon sx={{ fontSize: 20, color: `${status}.main` }} />
            <Box sx={{ minWidth: 80 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
              >
                <Chip
                  label={params.value ? `${params.value}h` : "Pending"}
                  size="small"
                  color={status}
                  variant={params.value ? "filled" : "outlined"}
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    "& .MuiChip-label": { px: 1.5 },
                  }}
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "grey.200",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 2,
                    backgroundColor:
                      status === "success"
                        ? "success.main"
                        : status === "warning"
                        ? "warning.main"
                        : "info.main",
                  },
                }}
              />
            </Box>
          </Box>
        );
      },
    },
    {
      field: "date",
      headerName: "Date",
      flex: 1.8,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 0.5 }}>
          <ScheduleIcon
            sx={{ fontSize: 20, color: "text.secondary", mt: 0.5 }}
          />
          <Box>
            <Typography
              variant="body2"
              color="text.primary"
              fontWeight={500}
              className="mt-1"
            >
              {formatDate(selectedDate)}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.5,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <div className="mt-0">
          <Tooltip title="View detailed timesheet" placement="top">
            <Button
              variant="contained"
              size="small"
              startIcon={<ViewIcon />}
              onClick={() => handleViewDetails(params.row)}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 4px 15px 0 rgba(102, 126, 234, 0.3)",
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 600,
                px: 2.5,
                py: 1,
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                  boxShadow: "0 6px 20px 0 rgba(102, 126, 234, 0.4)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              Details
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <Card
        sx={{ m: 3, borderRadius: 4, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
      >
        <CardContent sx={{ textAlign: "center", py: 6 }}>
          <Alert
            severity="error"
            sx={{
              borderRadius: 3,
              "& .MuiAlert-message": { fontWeight: 500, fontSize: "1rem" },
              boxShadow: "0 4px 20px rgba(244, 67, 54, 0.2)",
            }}
          >
            Failed to load timesheet data. Please try again later.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Fixed MUI Dialog with proper onClose handler */}
      <MuiDialog
        open={open}
        onClose={handleDialogClose}
        maxWidth="lg"
        fullWidth
        TransitionComponent={Fade}
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 4,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            overflow: "visible",
          },
        }}
      >
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            p: 4,
            borderRadius: "16px 16px 0 0",
            position: "relative",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: "rgba(255,255,255,0.2)",
                fontSize: "20px",
                fontWeight: 700,
              }}
            >
              {selectedRow ? getInitials(selectedRow.username) : <PersonIcon />}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {selectedRow?.username || "User Details"}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Timesheet for {formatDate(selectedDate)}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleCloseDialog}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              color: "white",
              bgcolor: "rgba(255,255,255,0.1)",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.2)",
                transform: "scale(1.1)",
              },
              transition: "all 0.2s ease",
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <MuiDialogContent className="bg-white min-h[70vh]">
          <Box sx={{ p: 4 }}>
            <TimesheetDataTable
              email={email}
              selectedDate={selectedDate}
              name={selectedRow?.username || ""}
              dialogFlag={true}
            />
          </Box>
        </MuiDialogContent>
      </MuiDialog>

      {/* Main Content */}
      <Box sx={{ p: { xs: 2, xl: 3 } }}>
        {/* Data Grid Section */}
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
            overflow: "hidden",
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          }}
        >
          <Box
            sx={{
              background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              p: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <EventNoteIcon sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Detailed Timesheet View
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Click "Details" to view individual timesheet entries
              </Typography>
            </Box>
          </Box>

          <CardContent sx={{ p: 0, backgroundColor: "white" }}>
            <Box
              sx={{
                height: 600,
                p: 3,
                "& .MuiDataGrid-root": {
                  border: "none",
                  borderRadius: 3,
                  backgroundColor: "white",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#f8fafc",
                    borderBottom: "2px solid #e2e8f0",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    "& .MuiDataGrid-columnHeader": {
                      color: "#374151",
                    },
                  },
                  "& .MuiDataGrid-row": {
                    borderBottom: "1px solid #f1f5f9",
                    "&:hover": {
                      backgroundColor: "#f8fafc",
                      transform: "scale(1.002)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    },
                    "&:last-child": {
                      borderBottom: "none",
                    },
                  },
                  "& .MuiDataGrid-cell": {
                    borderBottom: "none",
                    fontSize: "0.875rem",
                    py: 2,
                  },
                },
              }}
            >
              {isLoading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    flexDirection: "column",
                    gap: 3,
                  }}
                >
                  <CircularProgress size={60} thickness={4} />
                  <Typography variant="h6" color="text.secondary">
                    Loading timesheet data...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Please wait while we fetch the latest information
                  </Typography>
                </Box>
              ) : (
                <DataGrid
                  rows={processedData || []}
                  columns={columns}
                  disableRowSelectionOnClick
                  hideFooterSelectedRowCount
                  getRowHeight={() => 70}
                  getEstimatedRowHeight={() => 70}
                  pageSizeOptions={[5, 10, 25, 50]}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                  }}
                />
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default UsersTimesheetTable;
