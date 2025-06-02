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
import { toast } from "react-hot-toast";
import AutocompleteTag from "../../userDetails/udComponents/Autocomplete";
import DropdownTag from "../../userDetails/udComponents/DropdownTag";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Users,
  Shield,
  UserCheck,
  Save,
  ArrowLeft,
  Edit3,
  Settings,
} from "lucide-react";

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
  const [autoCompleteRoles, setAutoCompleteRoles] = React.useState<any[]>([]);

  const [selectedTimeout, setSelectedTimeout] = useState(
    dataUser?.idleTimeOut || "NA"
  );
  const [workingHours, setWorkingHours] = useState(
    dataUser?.workingHours || ""
  );
  const [isSignoutEnabled, setIsSignoutEnabled] = useState(
    dataUser?.allowSignout || false
  );
  const [isProfilePicModificationEnabled, setIsProfilePicModificationEnabled] =
    useState(dataUser?.pictureModification || false);
  const [userName, setUserName] = useState(dataUser?.username);
  const [userEmail, setUserEmail] = useState(dataUser?.email);
  const [designation, setDesignation] = useState(dataUser?.designation);
  const [phone, setPhone] = useState(dataUser?.phoneNumber);

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
        .filter((item) => item !== undefined);

      if (matchedItems) {
        setSelectedProjects(matchedItems);
      } else {
        setSelectedProjects([]);
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
        .filter((item) => item !== undefined);

      if (matchedItems) {
        setSelectedRoles(matchedItems);
      } else {
        setSelectedRoles([]);
      }
    }
  }, [dataUser]);

  useEffect(() => {
    if (!isLoadingUser && !dropdownLoading && !roleLoading && !projectLoading) {
      if (
        userLoadingSuccess &&
        isSuccessDropdown &&
        isRoleAutocompleteSuccess &&
        isProjectAutocompleteSuccess
      ) {
        setQueriesLoaded(true);
      }
    }
  }, [
    isLoadingUser,
    dropdownLoading,
    roleLoading,
    projectLoading,
    userLoadingSuccess,
    isSuccessDropdown,
    isRoleAutocompleteSuccess,
    isProjectAutocompleteSuccess,
  ]);

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

  if (!queriesLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Settings className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Loading User Settings
            </h3>
            <p className="text-slate-500 text-center">
              Please wait while we fetch the user details...
            </p>
          </div>
          <CircularLoading />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                User Settings
              </h1>
              <p className="text-slate-500">
                Manage user permissions and assignments
              </p>
            </div>
          </div>
        </div>

        <form className="space-y-8">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32 relative">
              <div className="absolute inset-0 bg-black/10"></div>
            </div>

            <div className="px-8 pb-8 -mt-16 relative">
              <div className="flex flex-col lg:flex-row items-center lg:items-end gap-6">
                {/* Avatar Section */}
                <div className="relative">
                  <Avatar className="h-32 w-32 ring-4 ring-white shadow-xl bg-gradient-to-br from-blue-500 to-purple-600">
                    <AvatarImage
                      src={dataUser?.profilePicture?.base64}
                      alt={dataUser?.username}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-4xl font-bold text-white">
                      {getInitials(dataUser?.username || "XX")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center lg:text-left mt-4 lg:mt-0">
                  <h2 className="text-2xl font-bold mb-2 text-white">
                    {dataUser?.username}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                          Email
                        </p>
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {dataUser?.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Phone className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                          Phone
                        </p>
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {dataUser?.phoneNumber || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Briefcase className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                          Designation
                        </p>
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {dataUser?.designation || "Not specified"}
                        </p>
                      </div>
                    </div>

                    {/* <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <User className="w-4 h-4 text-orange-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                          Status
                        </p>
                        <p className="text-sm font-semibold text-green-600">
                          Active
                        </p>
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Sections */}
          <div className="grid gap-8">
            {/* Projects Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-white/20 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">
                    Project Assignments
                  </h3>
                  <p className="text-slate-500">
                    Manage user's project access and responsibilities
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-6">
                <AutocompleteTag
                  label=""
                  placeholder="Select projects to assign..."
                  entityName="Project"
                  selectedList={selectedProjects}
                  key={`projects-${internalState}`}
                  objectList={autoCompleteProjects}
                  setSelectedProjects={setSelectedProjects}
                  setSelectedReportingUsers={setSelectedReportingUsers}
                  setSelectedRoles={setSelectedRoles}
                  setSelectedTeams={setSelectedTeams}
                />
                {error && (
                  <div className="mt-3 text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Roles Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-white/20 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">
                    Role Assignments
                  </h3>
                  <p className="text-slate-500">
                    Define user permissions and access levels
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-6">
                <AutocompleteTag
                  label=""
                  placeholder="Select roles to assign..."
                  entityName="Role"
                  selectedList={selectedRoles}
                  key={`roles-${internalState}`}
                  objectList={autoCompleteRoles}
                  setSelectedProjects={setSelectedProjects}
                  setSelectedReportingUsers={setSelectedReportingUsers}
                  setSelectedRoles={setSelectedRoles}
                  setSelectedTeams={setSelectedTeams}
                />
                {error && (
                  <div className="mt-3 text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Reporting Structure */}
            <div className="bg-white rounded-2xl shadow-lg border border-white/20 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-100 rounded-xl">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">
                    Reporting Structure
                  </h3>
                  <p className="text-slate-500">
                    Set up organizational hierarchy and reporting lines
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-6">
                <div className="mb-4">
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Reports To
                  </Label>
                </div>
                <DropdownTag
                  objectList={dropdownData.objectList}
                  setSelectedReportsTo={setSelectedReportsTo}
                  selectedUser={dropdownSelectedUser}
                  setDropdownSelectedUser={setDropdownSelectedUser}
                />
                {error && (
                  <div className="mt-3 text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center pt-8">
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  className={`group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3 ${
                    isLoading
                      ? "cursor-not-allowed opacity-70"
                      : "hover:from-blue-700 hover:to-indigo-700"
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </AlertDialogTrigger>

              <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Edit3 className="w-5 h-5 text-amber-600" />
                    </div>
                    Confirm Changes
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-600 leading-relaxed pt-2">
                    You're about to update this user's settings, including their
                    project assignments, roles, and reporting structure. This
                    action will immediately affect their system access and
                    permissions.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3">
                  <AlertDialogCancel
                    onClick={() => setOpen(false)}
                    className="px-6 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                  >
                    Save Changes
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserSettingsHR;
