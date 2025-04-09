"use client";

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { dataGridClassNames } from "@/lib/utils";
import {
  useGetBreaksForTeamsQuery,
  useGetTeamsConfigurationQuery,
  useGetTeamsQuery,
  useUpdateTeamsConfigurationDataMutation,
} from "@/store/api";
import { Button, FormControl } from "@mui/material";
import { useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader } from "lucide-react";
import { Label } from "@/components/ui/label";
import Tags from "./AutoComplete";
import toast from "react-hot-toast";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TeamsPage = () => {
  const userEmail = useSearchParams().get("email");

  const [isOpen, setIsOpen] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<any[]>([]);
  const [selectedBreaks, setSelectedBreaks] = useState<any[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState(0);
  const [error, setError] = useState("");

  const { data: teamsData, isLoading } = useGetTeamsQuery(
    { email: userEmail! },
    { refetchOnMountOrArgChange: true }
  );

  const handleOpenDialog = (id: number) => {
    setIsOpen(true);
    setSelectedTeamId(id);
  };

  const { data: breaksList } = useGetBreaksForTeamsQuery(
    { email: userEmail! },
    { refetchOnMountOrArgChange: true }
  );

  const { data, refetch } = useGetTeamsConfigurationQuery({
    email: userEmail!,
    teamId: selectedTeamId,
  });

  useEffect(() => {
    refetch();
  }, [selectedTeamId]);

  const idleTimeoutDropdownValues = [
    "NA",
    "5 min",
    "10 min",
    "15 min",
    "20 min",
    "30 min",
  ];

  const handleSaveConfiguration = async () => {
    try {
      const response = await updateTeamConfiguration({
        email: userEmail!,
        teamId: selectedTeamId,
        projects: selectedProjects,
        breaks: selectedBreaks,
        idleTimeout: selectedTimeout || "",
        allowPictureModification: isProfilePicModificationEnabled || false,
        workingHours: workingHours || "",
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

  const [selectedTimeout, setSelectedTimeout] = useState(data?.idleTimeOut);
  const [isProfilePicModificationEnabled, setIsProfilePicModificationEnabled] =
    useState(data?.allowPictureModification);

  const [workingHours, setWorkingHours] = useState(data?.workingHours);

  const handlePPModificationChange = (checked: boolean) => {
    setIsProfilePicModificationEnabled(checked); // Update the state with the new value of the switch
  };

  const [updateTeamConfiguration, { isLoading: updateConfigLoading }] =
    useUpdateTeamsConfigurationDataMutation();

  useEffect(() => {
    setSelectedTimeout(data?.idleTimeOut);
    setIsProfilePicModificationEnabled(data?.allowPictureModification);
    setWorkingHours(data?.workingHours);
  }, [data]);

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Team Name",
      flex: 1,
    },
    {
      field: "description",
      headerName: "Team Description",
      flex: 2,
    },
    {
      field: "teamLeaderName",
      headerName: "Team Lead",
      flex: 2,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => {
        const rowData = params.row;
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
            <div className="my-3 flex justify-center items-center">
              <Button
                variant="contained"
                className="mb-5"
                color="primary"
                size="small"
                onClick={() => {
                  handleOpenDialog(params.row.id);
                }}
                sx={{
                  backgroundColor: "#3f51b5", // Blue color
                  "&:hover": { backgroundColor: "#2c387e" },
                  borderRadius: "8px",
                }}
              >
                View / Configure Details
              </Button>
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <div className="my-3 flex justify-center items-center">
          {/* Dialog Content */}
          <DialogContent className="max-w-[65vw] max-h-[80vw] mt-5 mb-5 overflow-y-auto">
            {" "}
            {/* Set width to 70% of viewport height */}
            <DialogHeader>
              <DialogTitle>Team Configuration</DialogTitle>
              <DialogDescription className="">
                Please make changes and click on save configuration button to
                save the changes
              </DialogDescription>
            </DialogHeader>
            <form>
              <div className="grid gap-4 py-9">
                <div className="grid grid-cols-8 items-center gap-4">
                  {/* <Label className="text-center">Projects</Label>
                  <div className="col-span-7">
                    <Tags
                      projectFlag={true}
                      userEmail={userEmail!}
                      projectsList={projectsList}
                      setSelectedProjects={setSelectedProjects}
                      setSelectedBreaks={setSelectedBreaks}
                      teamId={selectTeamId}
                      selectedList={selectedProjects}
                    />
                  </div> */}
                  <div className="col-span-8 flex justify-center"></div>
                  <Label className="text-center">Breaks</Label>
                  <div className="col-span-7">
                    <Tags
                      projectFlag={false}
                      userEmail={userEmail!}
                      breaksList={breaksList}
                      setSelectedBreaks={setSelectedBreaks}
                      setSelectedProjects={setSelectedProjects}
                      teamId={selectedTeamId}
                      selectedList={selectedBreaks}
                    />
                  </div>
                  <div className="col-span-8 flex justify-center"></div>
                  <Label className="text-center">Idle Timeout</Label>
                  <div className="col-span-7">
                    <Select
                      value={selectedTimeout}
                      onValueChange={(value) => setSelectedTimeout(value)}
                    >
                      <SelectTrigger className="col-span-7 p-2 border rounded-md">
                        <SelectValue defaultValue={selectedTimeout} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {idleTimeoutDropdownValues.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-8 flex justify-center"></div>
                  <Label className="text-center col-span-2">
                    Allow Picture Modification
                  </Label>
                  <div className="col-span-2">
                    <Switch
                      className="ml-5"
                      id="airplane-mode"
                      checked={isProfilePicModificationEnabled}
                      onCheckedChange={handlePPModificationChange}
                    />
                  </div>
                  <Label className="">Working Hours</Label>
                  <div className="col-span-3">
                    <div className="">
                      <div>
                        <FormControl variant="standard" className="w-[100%]">
                          <Input
                            value={workingHours}
                            onChange={(e) => setWorkingHours(e.target.value)}
                            placeholder="9:30-18:30"
                          />
                        </FormControl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                {!updateConfigLoading && (
                  <Button
                    onClick={handleSaveConfiguration}
                    variant="contained"
                    sx={{
                      backgroundColor: "#3f51b5", // Blue color
                      "&:hover": { backgroundColor: "#2c387e" },
                      borderRadius: "8px",
                    }}
                  >
                    Save Configuration
                  </Button>
                )}
                {updateConfigLoading && (
                  <Button
                    onClick={handleSaveConfiguration}
                    variant="contained"
                    sx={{
                      backgroundColor: "#3f51b5", // Blue color
                      "&:hover": { backgroundColor: "#2c387e" },
                      borderRadius: "8px",
                    }}
                  >
                    <Loader className="animate-spin" />
                  </Button>
                )}
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
      <div className="h-full w-full px-4 pb-8 xl:px-6">
        <DataGrid
          rows={teamsData || []}
          columns={columns}
          className={dataGridClassNames}
        />
      </div>
    </>
  );
};

export default TeamsPage;
