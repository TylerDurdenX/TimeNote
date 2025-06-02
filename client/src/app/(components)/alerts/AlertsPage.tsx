"use client";

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React, { useState } from "react";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useDeleteTriggeredAlertsMutation,
  useGetAlertsQuery,
} from "@/store/api";
import { toast } from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { Trash2, Bell, Calendar, AlertTriangle } from "lucide-react";
import { Typography, Box, Chip } from "@mui/material";
import Link from "next/link";
import { Card } from "@/components/ui/card";

const AlertsPage = () => {
  const userEmail = useSearchParams().get("email");

  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: alertData, isLoading } = useGetAlertsQuery(
    { email: userEmail! },
    { refetchOnMountOrArgChange: true }
  );

  const handleDeleteClick = (id: number) => {
    setSelectedId(id);
    setOpen(true);
  };

  const email = useSearchParams().get("email");

  const [deleteAlert] = useDeleteTriggeredAlertsMutation();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const handleDeleteConfirmation = async () => {
    if (selectedId !== null) {
      try {
        const response = await deleteAlert({ alertId: selectedId });
        if (
          // @ts-ignore
          response.error?.data.status === "Error" ||
          // @ts-ignore
          response.error?.data.status === "Fail"
        ) {
          // @ts-ignore
          toast.error(response.error?.data.message);
        } else {
          // @ts-ignore
          toast.success(response.data?.message);
        }
      } catch (err: any) {
        toast.error(err.data.message);
        console.error("Error creating role:", err.data.Message);
      }

      setOpen(false);
      setSelectedId(null);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Title",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}>
          <Bell size={16} className="text-blue-600" />
          <Typography
            variant="body2"
            fontWeight="600"
            sx={{ color: "#1f2937" }}
          >
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      flex: 4,
      renderCell: (params) => {
        const value = params.value || "";
        if (value.includes(":")) {
          const parts = value.split(":");

          // Ensure there's text after ':'
          if (parts.length > 1) {
            const beforeText = parts[0] + ":";
            const linkText = parts.slice(1).join(":").trim(); // Handles multiple colons
            const match = linkText.match(/0000(\d+)/);
            const extracted = match ? match[1] : "";
            const href = `/task/${extracted}?email=${email}`; // Define your route

            return (
              <Box sx={{ py: 1 }}>
                <Typography
                  variant="body2"
                  component="span"
                  className="absolute mt-0"
                  sx={{ color: "#4b5563" }}
                >
                  {beforeText}{" "}
                  <Link href={href} passHref>
                    <Typography
                      variant="body2"
                      onClick={() => {
                        sessionStorage.setItem("taskId", String(extracted));
                      }}
                      component="span"
                      sx={{
                        color: "#2563eb",
                        cursor: "pointer",
                        textDecoration: "underline",
                        fontWeight: "500",
                        "&:hover": {
                          color: "#1d4ed8",
                          textDecoration: "none",
                        },
                      }}
                    >
                      {linkText}
                    </Typography>
                  </Link>
                </Typography>
              </Box>
            );
          }
        } else if (value.includes("#")) {
          const namePart = value.split("#");

          const beforeText = namePart[0] + ":";
          const afterText = namePart.slice(1);
          const numberedList = String(afterText)
            .split(",")
            .map(
              (name: string, index: number) => `${index + 1}. ${name.trim()}`
            );
          return (
            <Box sx={{ py: 1 }}>
              <Typography
                variant="body2"
                component="span"
                sx={{ color: "#4b5563" }}
              >
                {beforeText}{" "}
                <Dialog>
                  <DialogTrigger asChild>
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{
                        color: "#2563eb",
                        cursor: "pointer",
                        textDecoration: "underline",
                        fontWeight: "500",
                        "&:hover": {
                          color: "#1d4ed8",
                          textDecoration: "none",
                        },
                      }}
                    >
                      Users List
                    </Typography>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-[50vw] lg:max-w-[60vw] max-h-[38vw] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="font-semibold text-xl text-gray-800 flex items-center gap-2">
                        <Bell className="text-blue-600" size={20} />
                        Users List
                      </DialogTitle>
                    </DialogHeader>
                    <Card className="p-6 bg-gradient-to-br from-gray-50 to-white shadow-lg rounded-xl mt-4 min-h-[150px] border border-gray-100">
                      <Typography
                        variant="body2"
                        component="div"
                        sx={{ color: "#374151" }}
                      >
                        {numberedList.map((item, index) => (
                          // Render each numbered name on a new line
                          <div
                            key={index}
                            className="py-1 px-2 hover:bg-blue-50 rounded transition-colors duration-200"
                          >
                            {item}
                          </div>
                        ))}
                      </Typography>{" "}
                    </Card>
                    <DialogFooter className="w-full justify-between items-center">
                      <div className="absolute flex gap-4 left-10"></div>
                      <div className="flex items-center space-x-2"></div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </Typography>
            </Box>
          );
        }

        return (
          <Box sx={{ py: 1 }}>
            <Typography variant="body2" sx={{ color: "#4b5563" }}>
              {value}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        let bgColor, textColor, icon;
        switch (params.value) {
          case "To Do":
            bgColor = "linear-gradient(135deg, #3b82f6, #2563eb)";
            textColor = "#ffffff";
            icon = "📋";
            break;
          case "Work In Progress":
            bgColor = "linear-gradient(135deg, #10b981, #059669)";
            textColor = "#ffffff";
            icon = "⚡";
            break;
          case "Under Review":
            bgColor = "linear-gradient(135deg, #f59e0b, #d97706)";
            textColor = "#ffffff";
            icon = "👁️";
            break;
          case "Completed":
            bgColor = "linear-gradient(135deg, #374151, #111827)";
            textColor = "#ffffff";
            icon = "✅";
            break;
          default:
            bgColor = "linear-gradient(135deg, #e5e7eb, #d1d5db)";
            textColor = "#374151";
            icon = "❓";
        }

        return (
          <Box>
            <Chip
              className="absolute"
              label={
                <Box sx={{ alignItems: "center", gap: 0.5 }}>
                  <span style={{ fontSize: "12px" }}>{icon}</span>
                  <span style={{ fontSize: "11px", fontWeight: "600" }}>
                    {params.value}
                  </span>
                </Box>
              }
              sx={{
                background: bgColor,
                color: textColor,
                fontWeight: "bold",
                borderRadius: "20px",
                height: "28px",
                "& .MuiChip-label": {
                  px: 1.5,
                },
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            />
          </Box>
        );
      },
    },
    {
      field: "triggeredDate",
      headerName: "Triggered Date",
      flex: 0.8,
      renderCell: (params) => {
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}>
            <Calendar size={14} className="text-gray-500" />
            <Typography
              variant="body2"
              sx={{ color: "#6b7280", fontWeight: "500" }}
            >
              {formatDate(params.value)}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "id",
      headerName: "Actions",
      flex: 0.7,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        return (
          <div className="flex justify-center items-center h-full">
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger asChild>
                <button
                  className="group relative inline-flex items-center justify-center p-2.5 rounded-full bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border border-red-200 shadow-sm transform transition-all duration-200 ease-in-out hover:scale-110 hover:shadow-md"
                  onClick={() => handleDeleteClick(Number(params.id))}
                >
                  <Trash2
                    size={16}
                    className="text-red-600 group-hover:text-red-700 transition-colors duration-200"
                  />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    Delete Alert
                  </span>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="sm:max-w-[425px]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-gray-800">
                    <AlertTriangle className="text-red-500" size={20} />
                    Are you sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-600 mt-2">
                    Do you want to delete this alert notification? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <AlertDialogCancel
                    onClick={() => {
                      setOpen(false);
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                  >
                    No, Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteConfirmation}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md"
                  >
                    Yes, Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="px-6 py-8 xl:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md">
              <Bell className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">
              Alert Notifications
            </h1>
          </div>
          <p className="text-gray-600 ml-14">
            Manage and track your alert notifications
          </p>

          {/* Stats Cards */}
          <div className="flex gap-4 mt-6 ml-14">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Alerts</p>
                <p className="text-xl font-bold text-gray-800">
                  {alertData?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Alert History
            </h2>
          </div>

          <div className="p-6">
            <DataGrid
              rows={alertData || []}
              columns={columns}
              className={dataGridClassNames}
              sx={{
                border: "none",
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#f8fafc",
                  borderBottom: "2px solid #e2e8f0",
                  fontWeight: "600",
                  fontSize: "0.875rem",
                  color: "#374151",
                },
                "& .MuiDataGrid-row": {
                  borderBottom: "1px solid #f1f5f9",
                  "&:hover": {
                    backgroundColor: "#f8fafc",
                    transition: "background-color 0.2s ease",
                  },
                  "&:last-child": {
                    borderBottom: "none",
                  },
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "none",
                  padding: "12px 16px",
                },
                "& .MuiDataGrid-footerContainer": {
                  borderTop: "1px solid #e2e8f0",
                  backgroundColor: "#f8fafc",
                },
                minHeight: "400px",
                borderRadius: "12px",
              }}
              loading={isLoading}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10 },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;
