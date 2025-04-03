"use client";

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React, { useRef, useState } from "react";
import { dataGridClassNames } from "@/lib/utils";
import {
  useDeleteBreakMutation,
  useGetBreaksQuery,
  useUpdateBreakDetailsMutation,
} from "@/store/api";
import { Button } from "@mui/material";
import { useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import toast from "react-hot-toast";
import CircularLoading from "@/components/Sidebar/loading";

interface BreakDetails {
  breakName: string;
  breakDescription: string;
  breakTimeInMinutes: string;
  id: number;
}

const BreaksTable = () => {
  const userEmail = useSearchParams().get("email");

  const [isOpen, setIsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: breakData, isLoading } = useGetBreaksQuery(
    { email: userEmail! },
    { refetchOnMountOrArgChange: true }
  );

  const [updateBreakDetails] = useUpdateBreakDetailsMutation();

  const [breakName, setBreakName] = useState("");
  const [breakDescription, setBreakDescription] = useState("");
  const [id, setId] = useState(0);
  const [breakTimeInMinutes, setBreakTimeInMinutes] = useState("");

  const breakNameRef = useRef<HTMLInputElement | null>(null);
  const breakDescriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const breakTimeInMinutesRef = useRef<HTMLInputElement | null>(null);

  const handleBreakNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Get the current cursor position
    const cursorPosition = e.target.selectionStart;
    const value = e.target.value;

    // Set the new value
    setBreakName(value);

    // After the state update, restore the cursor position
    setTimeout(() => {
      if (breakNameRef.current) {
        breakNameRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0); // Ensures cursor position restoration happens after the state change
  };

  const handleBreakDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    // Get the current cursor position
    const cursorPosition = e.target.selectionStart;
    const value = e.target.value;

    // Set the new value
    setBreakDescription(value);

    // After the state update, restore the cursor position
    setTimeout(() => {
      if (breakDescriptionRef.current) {
        breakDescriptionRef.current.setSelectionRange(
          cursorPosition,
          cursorPosition
        );
      }
    }, 0); // Ensures cursor position restoration happens after the state change
  };

  // Handle input change for break time with cursor position fix
  const handleBreakTimeInMinutesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Get the current cursor position
    const cursorPosition = e.target.selectionStart;
    const value = e.target.value;

    // Set the new value
    handleChange(value);

    // After the state update, restore the cursor position
    setTimeout(() => {
      if (breakTimeInMinutesRef.current) {
        breakTimeInMinutesRef.current.setSelectionRange(
          cursorPosition,
          cursorPosition
        );
      }
    }, 0); // Ensures cursor position restoration happens after the state change
  };

  const [deleteBreak] = useDeleteBreakMutation();

  const handleDeleteClick = (id: number) => {
    setSelectedId(id);
    setOpen(true);
  };

  const handleUpdateButtonClick = (rowData: BreakDetails) => {
    // Set the values for break name, description, and time based on rowData
    setBreakName(rowData.breakName);
    setBreakDescription(rowData.breakDescription);
    setBreakTimeInMinutes(rowData.breakTimeInMinutes);
    setId(rowData.id);
    setIsOpen(true); // Open the dialog
  };

  const isFormValid = () => {
    return breakName && breakDescription && breakTimeInMinutes;
  };

  const handleUpdateBreakDetails = async () => {
    try {
      const response = await updateBreakDetails({
        email: userEmail!,
        breakId: id,
        breakName: breakName,
        breakDescription: breakDescription,
        breakTimeInMinutes: breakTimeInMinutes,
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

  const handleDeleteConfirmation = async () => {
    if (selectedId !== null) {
      try {
        const response = await deleteBreak({ breakId: selectedId });

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

  const handleChange = (value: string) => {
    //const value = e.target.value;
    const regex = /^[0-9]*$/; // Only alphanumeric characters and underscore

    // Check if the value matches the regex
    if (regex.test(value)) {
      setBreakTimeInMinutes(value); // Update the state only if valid
    } else {
      // Show a toast message when an invalid character is entered
      toast.error("Invalid character! Only numbers are allowed.");
    }
  };

  const columns: GridColDef[] = [
    {
      field: "breakName",
      headerName: "Break Name",
      flex: 1,
    },
    {
      field: "breakDescription",
      headerName: "Break Description",
      flex: 2,
    },
    {
      field: "breakCode",
      headerName: "Break Code",
      flex: 2,
    },
    {
      field: "breakTimeInMinutes",
      headerName: "Break Time (in minutes)",
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
                    <DialogTitle>Update Break</DialogTitle>
                  </DialogHeader>
                  <form>
                    <div className="grid gap-4 py-9">
                      <div className="grid grid-cols-8 items-center gap-4">
                        <Label className="text-center">
                          Break Name<span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                          ref={breakNameRef} // Attach ref to keep track of the cursor position
                          value={breakName}
                          onChange={handleBreakNameChange}
                          className="col-span-7"
                          required
                        />
                        <Label className="text-center">
                          Break Description
                          <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <textarea
                          ref={breakDescriptionRef} // Attach ref to keep track of the cursor position
                          value={breakDescription}
                          onChange={handleBreakDescriptionChange}
                          className="col-span-7 shadow border"
                          required
                        />
                        <Label className="text-center">
                          Break Time<span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                          ref={breakTimeInMinutesRef} // Attach ref to keep track of the cursor position
                          value={breakTimeInMinutes}
                          onChange={handleBreakTimeInMinutesChange}
                          className="col-span-7"
                          required
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        onClick={handleUpdateBreakDetails}
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
                    Do you want to delete this break?
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
    <>
      {isLoading ? (
        <>
          <CircularLoading />
        </>
      ) : (
        <div className="h-full w-full px-4 pb-8 xl:px-6">
          <DataGrid
            rows={breakData || []}
            columns={columns}
            className={dataGridClassNames}
          />
        </div>
      )}
    </>
  );
};

export default BreaksTable;
