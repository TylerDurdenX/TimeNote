import { getInitials } from "@/components/Sidebar/nav-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import AutocompleteTag from "./Autocomplete";
import {
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

const UserSettings = ({ id }: Props) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
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

  useEffect(() => {
    setInternalState(id);
  }, [id]);

  const {
    data: dataUser,
    isLoading: isLoadingUser,
    error: errorQuery,
  } = useGetUserDetailsQuery({
    id: id,
  },
  {
    refetchOnMountOrArgChange: true,
  });


  const [updateUserData] = useUpdateUserSettingsDataMutation();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch (error) {
      toast.error("Some Error occurred");
      console.log(error);
    }
    setOpen(false);
  };

  return (
    <div>
      {isLoadingUser ? (
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
                  selectedList={dataUser?.projects!}
                  key={internalState}
                  email={dataUser?.email!}
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
                  selectedList={dataUser?.teams!}
                  key={internalState}
                  email={dataUser?.email!}
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
                  selectedList={dataUser?.roles!}
                  key={internalState}
                  email={dataUser?.email!}
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
                  email={dataUser?.email!} 
                  key={internalState}
                  setSelectedReportsTo={setSelectedReportsTo}
                  reportsTo={dataUser?.reportsTo}
                />
                <div className="col-span-8 flex justify-center">
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                </div>
              </div>
            </div>
          </div>

          {/* <div className="flex  w-full">
            <div className="w-1/6 flex justify-center items-center p-4">
              <Label className="text-center">Reporting users</Label>
            </div>

            <div className="w-5/6 flex flex-col justify-center gap-4 p-4">
              <div className="">
                <AutocompleteTag
                  label=""
                  placeholder="Reporting Users"
                  entityName="User"
                  selectedList={dataUser?.reports!}
                  key={internalState}
                  email={dataUser?.email!}
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
          </div> */}

          <div className="flex justify-center items-center h-full">
            <AlertDialog onOpenChange={setOpen}>
              <AlertDialogTrigger asChild>
                <button
                  className={`flex w-[139px] mt-4 text-center bg-blue-600 rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm 
            hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus-offset-2 `} //${isLoading ? "cursor-not-allowed opacity-50" : ""}
                  //disabled={isLoading}
                >
                  {false ? "Saving..." : "Save Changes"}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will change the user settings! Kindly confirm if
                    you want to proceed with the changes
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
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
