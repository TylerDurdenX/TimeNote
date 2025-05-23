import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React, { useRef, useState } from "react";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { Button } from "@mui/material";
import { useSearchParams } from "next/navigation";
import {
  useDeleteAlertConfigMutation,
  useGetConfiguredAlertsQuery,
  useUpdateAlertConfigDetailsMutation,
} from "@/store/api";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

interface AlertConfig {
  time: string;
  type: string;
  percentageCompletion: string;
  id: number;
}

function ConfiguredAlertsTable() {
  const userEmail = useSearchParams().get("email");

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const activeHoursRef = useRef<HTMLInputElement | null>(null);
  const timesheetHoursRef = useRef<HTMLInputElement | null>(null);
  const completionPercentageRef = useRef<HTMLInputElement | null>(null);

  const { data, isLoading } = useGetConfiguredAlertsQuery(
    {
      email: userEmail!,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [isOpen, setIsOpen] = React.useState(false);
  const [open, setOpen] = useState(false);
  const [activeHours, setActiveHours] = useState("");
  const [activeHoursUpdate, setActiveHoursUpdate] = useState("");
  const [alertType, setALertType] = useState("");
  const [timesheetHours, setTimesheetHours] = useState("");
  const [timesheetHoursUpdate, setTimesheetHoursUpdate] = useState("");
  const [completionPercentage, setCompletionPercentage] = useState("");
  const [completionPercentageUpdate, setCompletionPercentageUpdate] =
    useState("");

  const [deleteAlertConfig] = useDeleteAlertConfigMutation();

  const handleUpdateButtonClick = (rowData: AlertConfig) => {
    // Set the values for break name, description, and time based on rowData
    setSelectedId(rowData.id);
    if (rowData.type === "ActiveTimeAlert") {
      setTimesheetHours("");
      setTimesheetHoursUpdate("");
      setCompletionPercentage("");
      setCompletionPercentageUpdate("");
      setActiveHours(rowData.time);
      setActiveHoursUpdate(rowData.time);
    }
    setALertType(rowData.type);
    if (rowData.type === "TimesheetAlert") {
      setActiveHours("");
      setActiveHoursUpdate("");
      setCompletionPercentage("");
      setCompletionPercentageUpdate("");
      setTimesheetHours(rowData.time);
      setTimesheetHoursUpdate(rowData.time);
    }
    if (rowData.type === "ProjectTimelineAlert") {
      setActiveHours("");
      setActiveHoursUpdate("");
      setTimesheetHours("");
      setTimesheetHoursUpdate("");
      setCompletionPercentage(rowData.percentageCompletion);
      setCompletionPercentageUpdate(rowData.percentageCompletion);
    }
    // setBreakDescription(rowData.breakDescription);
    // setBreakTimeInMinutes(rowData.breakTimeInMinutes);
    // setId(rowData.id);
    setIsOpen(true); // Open the dialog
  };

  const isFormValid = () => {
    return activeHours || timesheetHours || completionPercentage;
  };

  const [updateAlertConfigDetails] = useUpdateAlertConfigDetailsMutation();

  const handleUpdateAlertConfigDetails = async () => {
    try {
      const response = await updateAlertConfigDetails({
        id: selectedId!,
        alertType: alertType,
        email: userEmail!,
        activeHours: activeHours,
        timesheetHours: timesheetHours,
        completionPercentage: completionPercentage,
      });
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
      setIsOpen(false);
    } catch (err) {
      setIsOpen(false);
      toast.error("Some Error occurred, please try again later");
    }
  };

  const handleActiveHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Get the current cursor position
    const cursorPosition = e.target.selectionStart;
    const value = e.target.value;
    // Only allow digits
    if (/^\d*$/.test(value)) {
      const num = parseInt(value, 10);

      if (value === "" || (!isNaN(num) && num < 10)) {
        setActiveHours(value);
      } else {
        toast.error("Number must be less than 10");
      }
    } else {
      toast.error("Only digits are allowed");
    }
    // After the state update, restore the cursor position
    setTimeout(() => {
      if (activeHoursRef.current) {
        activeHoursRef.current.setSelectionRange(
          cursorPosition,
          cursorPosition
        );
      }
    }, 0); // Ensures cursor position restoration happens after the state change
  };

  const handleTimesheetHoursChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Get the current cursor position
    const cursorPosition = e.target.selectionStart;
    const value = e.target.value;
    // Only allow digits
    if (/^\d*$/.test(value)) {
      const num = parseInt(value, 10);

      if (value === "" || (!isNaN(num) && num < 10)) {
        setTimesheetHours(value);
      } else {
        toast.error("Number must be less than 10");
      }
    } else {
      toast.error("Only digits are allowed");
    }

    setTimeout(() => {
      if (timesheetHoursRef.current) {
        timesheetHoursRef.current.setSelectionRange(
          cursorPosition,
          cursorPosition
        );
      }
    }, 0);
  };

  const handleCompletionPercentageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Get the current cursor position
    const cursorPosition = e.target.selectionStart;
    const value = e.target.value;
    // Only allow digits
    if (/^\d*$/.test(value)) {
      const num = parseInt(value, 10);

      if (value === "" || (!isNaN(num) && num < 100)) {
        setCompletionPercentage(value);
      } else {
        toast.error("Number must be less than 100");
      }
    } else {
      toast.error("Only digits are allowed");
    }

    setTimeout(() => {
      if (completionPercentageRef.current) {
        completionPercentageRef.current.setSelectionRange(
          cursorPosition,
          cursorPosition
        );
      }
    }, 0);
  };

  const handleDeleteConfirmation = async () => {
    if (selectedId !== null) {
      try {
        const response = await deleteAlertConfig({ alertId: selectedId });

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

  const handleBlur = () => {
    setActiveHoursUpdate("");
    setTimesheetHoursUpdate("");
  };

  const handleDeleteClick = (id: number) => {
    setSelectedId(id);

    setOpen(true);
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Title",
      flex: 1,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 3,
    },
    {
      field: "time",
      headerName: "Min. ActiveTime/Logged Hours",
      flex: 2,
    },
    {
      field: "percentageCompletion",
      headerName: "Percentage Completion",
      flex: 2,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => {
        return (
          <div
            style={{
              display: "flex",
              gap: "15px",
              justifyContent: "center",
              alignItems: "center",
            }}
            className=" w-full"
          >
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <div className="my-3 flex justify-center items-center">
                <DialogTrigger asChild>
                  <Button
                    variant="contained"
                    className="mb-5"
                    color="primary"
                    size="small"
                    onClick={() => handleUpdateButtonClick(params.row)} // Passing the current row's data
                    sx={{
                      backgroundColor: "#3f51b5", // Blue color
                      "&:hover": { backgroundColor: "#2c387e" },
                      borderRadius: "8px",
                    }}
                  >
                    Update
                  </Button>
                </DialogTrigger>

                {/* Dialog Content */}
                <DialogContent className="max-w-[65vw] max-h-[80vw] mt-5 mb-5 overflow-y-auto">
                  {" "}
                  {/* Set width to 70% of viewport height */}
                  <DialogHeader>
                    <DialogTitle>Update Alert</DialogTitle>
                  </DialogHeader>
                  <form>
                    <div className="grid gap-4 py-9">
                      <div className="grid grid-cols-8 items-center gap-4">
                        {activeHoursUpdate !== "" ? (
                          <>
                            <Label className="text-center">
                              Active Hours{" "}
                              <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                              ref={activeHoursRef} // Attach ref to keep track of the cursor position
                              value={activeHours}
                              onChange={handleActiveHoursChange}
                              className="col-span-7"
                              required
                            />
                          </>
                        ) : (
                          ""
                        )}
                        {timesheetHoursUpdate !== "" ? (
                          <>
                            <Label className="text-center">
                              Timesheet Hours{" "}
                              <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                              ref={timesheetHoursRef} // Attach ref to keep track of the cursor position
                              value={timesheetHours}
                              onChange={handleTimesheetHoursChange}
                              className="col-span-7"
                              required
                            />
                          </>
                        ) : (
                          ""
                        )}
                        {completionPercentageUpdate !== "" ? (
                          <>
                            <Label className="text-center">
                              Completion %{" "}
                              <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                              ref={completionPercentageRef} // Attach ref to keep track of the cursor position
                              value={completionPercentage}
                              onChange={handleCompletionPercentageChange}
                              className="col-span-7"
                              required
                            />
                          </>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        onClick={handleUpdateAlertConfigDetails}
                        variant="contained"
                        disabled={!isFormValid()}
                        sx={{
                          backgroundColor: "#3f51b5", // Blue color
                          "&:hover": { backgroundColor: "#2c387e" },
                          borderRadius: "8px",
                        }}
                      >
                        Save Changes
                      </Button>
                      <Button
                        onClick={() => setIsOpen(false)}
                        variant="contained"
                        sx={{
                          backgroundColor: "#3f51b5", // Blue color
                          "&:hover": { backgroundColor: "#2c387e" },
                          borderRadius: "8px",
                        }}
                      >
                        Close
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </div>
            </Dialog>
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
                    Do you want to delete this alerts configuration?
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
        pagination
        sx={dataGridSxStyles(false)}
      />
    </div>
  );
}

export default ConfiguredAlertsTable;
