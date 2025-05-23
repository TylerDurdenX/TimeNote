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
import { Trash2 } from "lucide-react";
import { Typography } from "@mui/material";
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
              <Typography variant="body2" component="span">
                {beforeText}{" "}
                <Link href={href} passHref>
                  <Typography
                    variant="body2"
                    onClick={() => {
                      sessionStorage.setItem("taskId", String(extracted));
                    }}
                    component="span"
                    sx={{
                      color: "blue",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    {linkText}
                  </Typography>
                </Link>
              </Typography>
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
            <Typography variant="body2" component="span">
              {beforeText}{" "}
              <Dialog>
                <DialogTrigger asChild>
                  <Typography
                    variant="body2"
                    component="span"
                    sx={{
                      color: "blue",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Users List
                  </Typography>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[50vw] lg:max-w-[60vw] max-h-[38vw] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-semibold text-lg">
                      Users List
                    </DialogTitle>
                  </DialogHeader>
                  <Card className="p-5 bg-white shadow-md rounded-lg mt-4 min-h-[150px] flex text-gray-600">
                    <Typography variant="body2" component="div">
                      {numberedList.map((item, index) => (
                        // Render each numbered name on a new line
                        <div key={index}>{item}</div>
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
          );
        }
      },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        let bgColor, textColor;
        switch (params.value) {
          case "To Do":
            bgColor = "#2563EB";
            textColor = "#ffffff";
            break;
          case "Work In Progress":
            bgColor = "#059669";
            textColor = "#ffffff";
            break;
          case "Under Review":
            bgColor = "#D97706";
            textColor = "#ffffff";
            break;
          case "Completed":
            bgColor = "#000000";
            textColor = "#ffffff";
            break;
          default:
            bgColor = "#E5E7EB";
            textColor = "#000000";
        }

        return (
          <span
            className="inline-flex rounded-full px-2 text-xs font-semibold leading-5"
            style={{ backgroundColor: bgColor, color: textColor }}
          >
            {params.value}
          </span>
        );
      },
    },
    {
      field: "triggeredDate",
      headerName: "Triggered Date",
      flex: 0.7,
      renderCell: (params) => {
        return formatDate(params.value);
      },
    },
    {
      field: "id",
      headerName: "",
      flex: 0.7,
      renderCell: (params) => {
        return (
          <div className="flex justify-center items-center h-full">
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger asChild>
                <button
                  className="hover:from-red-400 hover:to-blue-500 px-6 py-2 rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-105 text-red-700"
                  onClick={() => handleDeleteClick(Number(params.id))}
                >
                  <Trash2 />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-700">
                    Do you want to delete this alert notification?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => {
                      setOpen(false);
                    }}
                  >
                    No
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteConfirmation}>
                    Yes
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
    <div className="h-full w-full px-4 pb-8 xl:px-6">
      <DataGrid
        rows={alertData || []}
        columns={columns}
        className={dataGridClassNames}
      />
    </div>
  );
};

export default AlertsPage;
