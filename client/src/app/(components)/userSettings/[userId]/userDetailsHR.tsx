"use client";

import { getInitials } from "@/components/Sidebar/nav-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";
import {
  useGetObjectListQuery,
  useGetUserDetailsQuery,
  useUpdateUserBasicSettingsDataMutation,
  useUpdateUserSettingsDataMutation,
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
import CircularLoading from "@/components/Sidebar/loading";
import { Switch } from "@/components/ui/switch";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import AutocompleteTag from "../../userDetails/udComponents/Autocomplete";
import DropdownTag from "../../userDetails/udComponents/DropdownTag";

interface DropdownData {
  objectList: { title: string; misc: string }[];
  isSuccessDropdown: boolean;
}

type Props = {
  id: number;
};

const UserSettingsHR = ({ id }: Props) => {
  const [selectedTeams, setSelectedTeams] = useState<any[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<any[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<any[]>([]);
  const [selectedReportingUsers, setSelectedReportingUsers] = useState<any[]>(
    []
  );
  const [selectedReportsTo, setSelectedReportsTo] = useState("");

  const {
    data: dataUser,
    isLoading: isLoadingUser,
    error: errorQuery,
    isSuccess: userLoadingSuccess,
  } = useGetUserDetailsQuery(
    {
      id: Number(id),
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const [error, setError] = useState("");
  const [internalState, setInternalState] = useState(id);
  const [open, setOpen] = useState(false);
  const [queriesLoaded, setQueriesLoaded] = useState(false);
  const [dropdownSelectedUser, setDropdownSelectedUser] =
    React.useState<string>("");
  const [autoCompleteProjects, setAutoCompleteProjects] = React.useState<any[]>(
    []
  );
  const [autoCompleteTeams, setAutoCompleteTeams] = React.useState<any[]>([]);
  const [autoCompleteRoles, setAutoCompleteRoles] = React.useState<any[]>([]);

  const idleTimeoutDropdownValues = [
    "NA",
    "5 min",
    "10 min",
    "15 min",
    "20 min",
    "30 min",
  ];

  const [selectedTimeout, setSelectedTimeout] = useState(
    dataUser?.idleTimeOut || "NA"
  );
  const [workingHours, setWorkingHours] = useState(
    dataUser?.workingHours || ""
  );

  const handleTimeoutChange = (value: string) => {
    setSelectedTimeout(value);
  };

  const [isSignoutEnabled, setIsSignoutEnabled] = useState(
    dataUser?.allowSignout || false
  ); // Set initial state
  const [isProfilePicModificationEnabled, setIsProfilePicModificationEnabled] =
    useState(dataUser?.pictureModification || false);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenUserData, setIsOpenUserData] = useState(false);
  const [userName, setUserName] = useState(dataUser?.username);
  const [userEmail, setUserEmail] = useState(dataUser?.email);
  const [designation, setDesignation] = useState(dataUser?.designation);
  const [phone, setPhone] = useState(dataUser?.phoneNumber);

  const handlePPModificationChange = (checked: boolean) => {
    setIsProfilePicModificationEnabled(checked); // Update the state with the new value of the switch
  };

  const handleToggle = (checked: boolean) => {
    setIsSignoutEnabled(checked); // Update the state to match the switch's checked value
  };

  const [dropdownData, setDropdownData] = useState<DropdownData>({
    objectList: [],
    isSuccessDropdown: false,
  });
  useEffect(() => {
    setInternalState(id);
  }, [id]);

  const {
    data: ObjectData,
    isLoading: dropdownLoading,
    error: dropdownError,
    isSuccess: isSuccessDropdown,
    refetch,
  } = useGetObjectListQuery(
    {
      entityName: "User",
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  useEffect(() => {
    // Force refetch every time the component is mounted
    refetch();
    localStorage.removeItem("persist:root");
  }, [id]);

  const {
    data: ObjectProjectData,
    isLoading: projectLoading,
    error: projectError,
    isSuccess: isProjectAutocompleteSuccess,
  } = useGetObjectListQuery(
    {
      entityName: "Project",
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const {
    data: ObjectTeamData,
    isLoading: teamLoading,
    error: teamError,
    isSuccess: isTeamAutocompleteSuccess,
  } = useGetObjectListQuery(
    {
      entityName: "Team",
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const {
    data: ObjectRoleData,
    isLoading: roleLoading,
    error: roleError,
    isSuccess: isRoleAutocompleteSuccess,
  } = useGetObjectListQuery(
    {
      entityName: "Role",
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  useEffect(() => {
    if (isSuccessDropdown) {
      let processedList =
        ObjectData?.map((obj) => ({
          title: obj.title,
          misc: obj.misc,
        })) || [];
      processedList = processedList.filter(
        (item) => item.misc !== dataUser?.email
      );
      if (dataUser?.reportsTo != null) {
        const matchingUser = processedList.find((item) => {
          return item.title === dataUser?.reportsTo?.username;
        });
        if (matchingUser) {
          setDropdownSelectedUser(matchingUser?.misc!);
          setSelectedReportsTo(matchingUser?.misc!);
        }
      } else {
        setDropdownSelectedUser("");
        setSelectedReportsTo("");
      }
      setDropdownData({
        objectList: processedList,
        isSuccessDropdown,
      });
    }
    setIsSignoutEnabled(dataUser?.allowSignout || false);
    setIsProfilePicModificationEnabled(dataUser?.pictureModification || false);
    setWorkingHours(dataUser?.workingHours || "");
    setSelectedTimeout(dataUser?.idleTimeOut || "NA");
    setUserEmail(dataUser?.email);
    setUserName(dataUser?.username);
    setDesignation(dataUser?.designation);
    setPhone(dataUser?.phoneNumber);
  }, [dataUser]);

  useEffect(() => {
    if (isProjectAutocompleteSuccess) {
      let objectList =
        ObjectProjectData?.map((obj) => ({
          title: obj.title,
          misc: obj.misc,
        })) || [];

      setAutoCompleteProjects(objectList);
      const matchedItems = dataUser
        ?.projects!.map((item) => {
          return objectList.find((obj) => {
            if (obj?.title && item?.name) {
              return obj.title.toLowerCase() === item.name.toLowerCase();
            }
            return false;
          });
        })
        .filter((item) => item !== undefined); // filter out undefined values

      if (matchedItems) {
        setSelectedProjects(matchedItems); // Set the matched values to the local state
      } else {
        setSelectedProjects([]); // Reset if no items
      }
    }
  }, [dataUser]);

  useEffect(() => {
    if (isTeamAutocompleteSuccess) {
      let objectList =
        ObjectTeamData?.map((obj) => ({
          title: obj.title,
          misc: obj.misc,
        })) || [];

      setAutoCompleteTeams(objectList);
      const matchedItems = dataUser
        ?.teams!.map((item) => {
          return objectList.find((obj) => {
            if (obj?.title && item?.name) {
              return obj.title.toLowerCase() === item.name.toLowerCase();
            }
            return false;
          });
        })
        .filter((item) => item !== undefined); // filter out undefined values

      if (matchedItems) {
        setSelectedTeams(matchedItems); // Set the matched values to the local state
      } else {
        setSelectedTeams([]); // Reset if no items
      }
    }
  }, [dataUser]);

  useEffect(() => {
    if (isRoleAutocompleteSuccess) {
      let objectList =
        ObjectRoleData?.map((obj) => ({
          title: obj.title,
          misc: obj.misc,
        })) || [];

      setAutoCompleteRoles(objectList);
      const matchedItems = dataUser
        ?.roles!.map((item) => {
          return objectList.find((obj) => {
            if (obj?.title && item?.name) {
              return obj.title.toLowerCase() === item.name.toLowerCase();
            }
            return false;
          });
        })
        .filter((item) => item !== undefined); // filter out undefined values

      if (matchedItems) {
        setSelectedRoles(matchedItems); // Set the matched values to the local state
      } else {
        setSelectedRoles([]); // Reset if no items
      }
    }
  }, [dataUser]);

  useEffect(() => {
    if (
      !isLoadingUser &&
      !dropdownLoading &&
      !teamLoading &&
      !roleLoading &&
      !projectLoading
    ) {
      // Ensure both queries have finished loading
      if (
        userLoadingSuccess &&
        isSuccessDropdown &&
        isTeamAutocompleteSuccess &&
        isRoleAutocompleteSuccess &&
        isProjectAutocompleteSuccess
      ) {
        setQueriesLoaded(true); // Set the flag indicating both queries are loaded
      }
    }
  }, [
    isLoadingUser,
    dropdownLoading,
    teamLoading,
    roleLoading,
    projectLoading,
    userLoadingSuccess,
    isSuccessDropdown,
    isTeamAutocompleteSuccess,
    isRoleAutocompleteSuccess,
    isProjectAutocompleteSuccess,
  ]);

  const isFormValid = () => {
    return userName && designation && phone && userEmail;
  };

  const [updateUserData, { isLoading }] = useUpdateUserSettingsDataMutation();
  const [updateUserBasicData, { isLoading: isLoadingUpdate }] =
    useUpdateUserBasicSettingsDataMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    try {
      const response = await updateUserData({
        email: dataUser?.email!,
        reportingUsers: selectedReportingUsers,
        reportsTo: selectedReportsTo,
        projects: selectedProjects,
        teams: selectedTeams,
        roles: selectedRoles,
        selectedTimeOut: selectedTimeout,
        workingHours: workingHours,
        isSignoutEnabled: isSignoutEnabled,
        isProfilePicModificationEnabled: isProfilePicModificationEnabled,
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
      setOpen(false);
    } catch (error) {
      toast.error("Some Error occurred");
      console.log(error);
    }
    setOpen(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    try {
      const response = await updateUserBasicData({
        userId: dataUser?.userId!,
        email: userEmail!,
        username: userName!,
        designation: designation!,
        phone: phone!,
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
      setIsOpenUserData(false);
    } catch (error) {
      toast.error("Some Error occurred");
      console.log(error);
    }
    setIsOpenUserData(false);
  };

  return (
    <div>
      {!queriesLoaded ? (
        <CircularLoading />
      ) : (
        <form>
          <div className="flex h-full w-full mt-7 mb-7">
            <div className="w-1/4 flex justify-center items-center p-4">
              <Avatar className="h-40 w-40 rounded-full justify-center items-center">
                <AvatarImage
                  src={dataUser?.profilePicture?.base64}
                  alt={dataUser?.username}
                />
                <AvatarFallback className="rounded-lg text-6xl">
                  {getInitials(dataUser?.username || "XX")}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Fields Section */}
            <div className="w-3/4 flex flex-col justify-center gap-4 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <p className="font-semibold">Username</p>
                  <p>{dataUser?.username}</p>
                </div>

                <div className="flex flex-col">
                  <p className="font-semibold">Email</p>
                  <p>{dataUser?.email}</p>
                </div>

                <div className="flex flex-col">
                  <p className="font-semibold">Phone</p>
                  <p>{dataUser?.phoneNumber}</p>
                </div>

                <div className="flex flex-col">
                  <p className="font-semibold">Designation</p>
                  <p>{dataUser?.designation}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex  w-full">
            <div className="w-1/6 flex justify-center items-center p-4">
              <Label className="text-center">Projects</Label>
            </div>

            <div className="w-5/6 flex flex-col justify-center gap-4 p-4">
              <div className="">
                <AutocompleteTag
                  label=""
                  placeholder="Projects"
                  entityName="Project"
                  selectedList={selectedProjects}
                  key={internalState}
                  objectList={autoCompleteProjects}
                  setSelectedProjects={setSelectedProjects}
                  setSelectedReportingUsers={setSelectedReportingUsers}
                  setSelectedRoles={setSelectedRoles}
                  setSelectedTeams={setSelectedTeams}
                />
                <div className="col-span-8 flex justify-center">
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                </div>
              </div>
            </div>
          </div>
          <div className="flex  w-full">
            <div className="w-1/6 flex justify-center items-center p-4">
              <Label className="text-center">Teams</Label>
            </div>

            <div className="w-5/6 flex flex-col justify-center gap-4 p-4">
              <div className="">
                <AutocompleteTag
                  label=""
                  placeholder="Teams"
                  entityName="Team"
                  selectedList={selectedTeams}
                  key={internalState}
                  objectList={autoCompleteTeams}
                  setSelectedProjects={setSelectedProjects}
                  setSelectedReportingUsers={setSelectedReportingUsers}
                  setSelectedRoles={setSelectedRoles}
                  setSelectedTeams={setSelectedTeams}
                />
                <div className="col-span-8 flex justify-center">
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                </div>
              </div>
            </div>
          </div>
          <div className="flex  w-full">
            <div className="w-1/6 flex justify-center items-center p-4">
              <Label className="text-center">Roles</Label>
            </div>

            <div className="w-5/6 flex flex-col justify-center gap-4 p-4">
              <div className="">
                <AutocompleteTag
                  label=""
                  placeholder="Roles"
                  entityName="Role"
                  selectedList={selectedRoles}
                  key={internalState}
                  objectList={autoCompleteRoles}
                  setSelectedProjects={setSelectedProjects}
                  setSelectedReportingUsers={setSelectedReportingUsers}
                  setSelectedRoles={setSelectedRoles}
                  setSelectedTeams={setSelectedTeams}
                />
                <div className="col-span-8 flex justify-center">
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                </div>
              </div>
            </div>
          </div>

          <div className="flex  w-full">
            <div className="w-1/6 flex justify-center items-center p-4">
              <Label className="text-center">Reports To</Label>
            </div>

            <div className="w-5/6 flex flex-col justify-center gap-4 p-4">
              <div className="">
                <DropdownTag
                  objectList={dropdownData.objectList}
                  // key={internalState}
                  setSelectedReportsTo={setSelectedReportsTo}
                  selectedUser={dropdownSelectedUser}
                  setDropdownSelectedUser={setDropdownSelectedUser}
                />
                <div className="col-span-8 flex justify-center">
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                </div>
              </div>
            </div>
          </div>
          <div className="flex  w-full col-span-6">
            <div className="w-1/6 flex justify-center items-center p-4">
              <Label className="text-center">Idle Timeout</Label>
            </div>

            <div className="w-3/6 flex flex-col justify-center gap-4 p-4">
              <div className="">
                <div>
                  <FormControl variant="standard" className="w-[100%]">
                    <InputLabel id="demo-simple-select-standard-label">
                      Idle Timeout
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-standard-label"
                      id="demo-simple-select-standard"
                      value={selectedTimeout} // Controlled select, value bound to user state
                      onChange={(e) => {
                        handleTimeoutChange(e.target.value);
                      }} // Handle change event to update state
                      label="Idle Timeout"
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {idleTimeoutDropdownValues.map((item) => (
                        <MenuItem key={item} value={item}>
                          {item}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div className="flex justify-center">
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                </div>
              </div>
            </div>
            <div className="w-1/6 flex flex-col justify-center items-center gap-4 p-4">
              <div className="">
                <Label htmlFor="airplane-mode" className="mt-5">
                  Allow Signout
                </Label>
              </div>
            </div>
            <div className="w-1/6 flex flex-col justify-center gap-4 p-4">
              <div className="">
                <Switch
                  className="ml-5"
                  id="airplane-mode"
                  checked={isSignoutEnabled}
                  onCheckedChange={handleToggle}
                />
              </div>
            </div>
          </div>
          <div className="flex  w-full col-span-6">
            <div className="w-1/6 flex justify-center items-center p-4">
              <Label className="text-center">Working Hours</Label>
            </div>

            <div className="w-3/6 flex flex-col justify-center gap-4 p-4">
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
                <div className="flex justify-center">
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                </div>
              </div>
            </div>
            <div className="w-1/6 flex flex-col justify-center items-center gap-4 p-4">
              <div className="">
                <Label htmlFor="airplane-mode" className="mt-5">
                  Allow Profile Picture Modification
                </Label>
              </div>
            </div>
            <div className="w-1/6 flex flex-col justify-center gap-4 p-4">
              <div className="">
                <Switch
                  className="ml-5"
                  id="airplane-mode"
                  checked={isProfilePicModificationEnabled}
                  onCheckedChange={handlePPModificationChange}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center h-full">
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger asChild>
                <button
                  className={`flex w-[139px] mt-4 text-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm 
          hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus-offset-2 ${
            isLoading ? "cursor-not-allowed opacity-50" : ""
          }`}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will change the user settings! Kindly confirm if
                    you want to proceed with the changes.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setOpen(false)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmit}>
                    Proceed
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </form>
      )}
    </div>
  );
};

export default UserSettingsHR;
