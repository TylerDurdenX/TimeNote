import { getInitials } from "@/components/Sidebar/nav-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import AutocompleteTag from "./Autocomplete";
import {
  useGetObjectListQuery,
  useGetUserDetailsQuery,
  useUpdateUserSettingsDataMutation,
} from "@/store/api";
import DropdownTag from "./DropdownTag";
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

type Props = {
  id: number;
};

interface DropdownData {
  objectList: { title: string; misc: string }[];
  isSuccessDropdown: boolean;
}

const UserSettings = ({ id }: Props) => {
  const [selectedTeams, setSelectedTeams] = useState<any[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<any[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<any[]>([]);
  const [selectedReportingUsers, setSelectedReportingUsers] = useState<any[]>(
    []
  );
  const [selectedReportsTo, setSelectedReportsTo] = useState("");

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

  const [dropdownData, setDropdownData] = useState<DropdownData>({
    objectList: [],
    isSuccessDropdown: false,
  });
  useEffect(() => {
    setInternalState(id);
  }, [id]);

  const {
    data: dataUser,
    isLoading: isLoadingUser,
    error: errorQuery,
    isSuccess: userLoadingSuccess,
  } = useGetUserDetailsQuery(
    {
      id: id,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const {
    data: ObjectData,
    isLoading: dropdownLoading,
    error: dropdownError,
    isSuccess: isSuccessDropdown,
  } = useGetObjectListQuery(
    {
      entityName: "User",
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

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

  const [updateUserData, { isLoading }] = useUpdateUserSettingsDataMutation();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;
    try {
      updateUserData({
        email: dataUser?.email!,
        reportingUsers: selectedReportingUsers,
        reportsTo: selectedReportsTo,
        projects: selectedProjects,
        teams: selectedTeams,
        roles: selectedRoles,
      });
      toast.success("UserData Updated Successfully!");
      setOpen(false);
    } catch (error) {
      toast.error("Some Error occurred");
      console.log(error);
    }
    setOpen(false);
  };

  return (
    <div>
      {!queriesLoaded ? (
        "Loading..."
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="flex h-full w-full">
            <div className="w-1/4 flex justify-center items-center p-4">
              <Avatar className="h-20 w-20 rounded-full justify-center items-center">
                <AvatarImage
                  src={dataUser?.profilePicture?.base64}
                  alt={dataUser?.username}
                />
                <AvatarFallback className="rounded-lg text-4xl">
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

          <div className="flex justify-center items-center h-full">
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger asChild>
                <button
                  className={`flex w-[139px] mt-4 text-center bg-blue-600 rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm 
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

export default UserSettings;
