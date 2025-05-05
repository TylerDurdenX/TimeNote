import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React, { useState } from "react";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  useDeleteConfigReportsMutation,
  useGetConfiguredReportsQuery,
} from "@/store/api";
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

const ConfiguredReportsTable = () => {
  const email = useSearchParams().get("email");

  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleDeleteClick = (id: number) => {
    setSelectedId(id);
    setOpen(true);
  };

  const [deleteAutoReportConfig] = useDeleteConfigReportsMutation();

  const { data, isLoading, error, refetch } = useGetConfiguredReportsQuery(
    { email: email! },
    { refetchOnMountOrArgChange: true }
  );

  const handleDeleteConfirmation = async () => {
    if (selectedId !== null) {
      try {
        const response = await deleteAutoReportConfig({ reportId: selectedId });
        refetch();

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
      field: "ReportName",
      headerName: "Report Name",
      flex: 1,
      renderCell: (params) => {
        const reportName = params.row.ReportName;
        const formattedName = reportName.replace(/([a-zA-Z])([A-Z])/g, "$1 $2");
        return formattedName;
      },
    },
    {
      field: "ReportTime",
      headerName: "Auto Trigger Time",
      flex: 1,
      renderCell: (params) => {
        const reportTime = params.row.ReportTime;

        const formattedTime = reportTime.replace(/(\d)(AM|PM)/, "$1 $2");

        return formattedTime;
      },
    },
    {
      field: "ReportDuration",
      headerName: "Report Duration",
      flex: 1,
      renderCell: (params) => {
        const reportDuration = params.row.ReportDuration;

        let formattedDuration;
        switch (reportDuration) {
          case "LastMonth":
            formattedDuration = "Monthly";
            break;
          case "LastWeek":
            formattedDuration = "Weekly";
            break;
          case "Daily":
            formattedDuration = "Daily";
            break;
        }

        return formattedDuration;
      },
    },
    // {
    //   field: "ProjectTeam",
    //   headerName: "Project/Team Name",
    //   flex: 1,
    // },
    {
      field: "id",
      headerName: "",
      flex: 1,
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
                    Do you want to delete this configuration?
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
        rows={data || []}
        columns={columns}
        className={dataGridClassNames}
        sx={dataGridSxStyles(false)}
      />
    </div>
  );
};

export default ConfiguredReportsTable;
