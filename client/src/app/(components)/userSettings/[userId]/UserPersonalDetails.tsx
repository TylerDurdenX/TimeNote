import React, { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { getInitials } from "@/components/Sidebar/nav-user";
import {
  useCreateUserMutation,
  useGetUserPersonalDetailsQuery,
  useUpdateUserDataMutation,
} from "@/store/api";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { add } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { Pen, PlusSquare, User2 } from "lucide-react";

interface EmployeeData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  position: string;
  department: string;
  employeeId: string;
  dob: string;
  startDate: string;
  salary: string;
  city: string;
  state: string;
  zip: string;
  emergencyContact: string;
  notes: string;
}

type Props = {
  id: number;
};

const UserPersonalDetails = ({ id }: Props) => {
  const {
    data: dataUser,
    isLoading: isLoadingUser,
    error: errorQuery,
    isSuccess: userLoadingSuccess,
  } = useGetUserPersonalDetailsQuery(
    {
      id: Number(id),
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const [profilePic, setProfilePic] = useState<File | null>(null);

  const [address, setAddress] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [department, setDepartment] = useState("");
  const [totalLeaves, setTotalLeaves] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [gender, setGender] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [employeeGrade, setEmployeeGrade] = useState("");
  const [employeeStatus, setEmployeeStatus] = useState("");
  const [issuedDevices, setIssuedDevices] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [claimedLeaves, setClaimedLeaves] = useState("");
  const [username, setUsername] = useState(dataUser?.username);
  const [email, setEmail] = useState(dataUser?.email);
  const [designation, setDesignation] = useState(dataUser?.designation);
  const [phoneNumber, setPhoneNumber] = useState(dataUser?.phoneNumber);
  const [isOpen, setIsOpen] = useState(false);

  function formatToYMD(dateString: string): string {
    if (dateString === "") {
      return "";
    }
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 0-indexed months
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    setUsername(dataUser?.username);
    setEmail(dataUser?.email);
    setDesignation(dataUser?.designation);
    setPhoneNumber(dataUser?.phoneNumber);
    setAddress(dataUser?.userDetails?.address || "");
    setJoiningDate(formatToYMD(dataUser?.userDetails?.joiningDate || "") || "");
    setTotalLeaves(dataUser?.userDetails?.totalLeaves || "");
    setEmployeeStatus(dataUser?.userDetails?.employeeStatus || "");
    setEmploymentType(dataUser?.userDetails?.employementType || "");
    setDateOfBirth(formatToYMD(dataUser?.userDetails?.dateOfBirth || "") || "");
    setPersonalEmail(dataUser?.userDetails?.personalEmail || "");
    setBloodGroup(dataUser?.userDetails?.bloodGroup || "");
    setGender(dataUser?.userDetails?.gender || "");
    setEmployeeId(dataUser?.userDetails?.employeeId || "");
    setEmergencyContact(dataUser?.userDetails?.emergencyContact || "");
    setEmployeeGrade(dataUser?.userDetails?.employeeGrade || "");
    setIssuedDevices(dataUser?.userDetails?.issuedDevices || "");
    setClaimedLeaves(dataUser?.userDetails?.claimedLeaves || "");
    setDepartment(dataUser?.userDetails?.department || "");
    setWorkLocation(dataUser?.userDetails?.workLocation || "");
  }, [dataUser]);

  const [base64Image, setBase64Image] = useState<string | null>(
    dataUser?.profilePicture?.base64 || null
  );

  const isFormValid = () => {
    return username && email && designation && phoneNumber;
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click(); // Trigger file input click when the avatar is clicked
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      // Event handler to run once the file is read
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          try {
            // Set the base64 result as the image
            setBase64Image(reader.result); // Update the state with the base64 string
          } catch (err) {
            toast.error("Some error occurred");
            console.error(err);
          }
        }
      };

      // Read the file as a data URL (base64 encoded)
      reader.readAsDataURL(file); // This triggers the reader.onloadend once file is read
    }
  };

  const [saveUserDetails, { isLoading }] = useUpdateUserDataMutation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const formData = {
      username: username!,
      email: email!,
      designation: designation!,
      phoneNumber: phoneNumber!,
      base64: base64Image,
      employeeId: employeeId,
      personalEmail: personalEmail,
      bloodGroup: bloodGroup,
      employeeGrade: employeeGrade,
      address: address,
      gender: gender,
      department: department,
      joiningDate: joiningDate,
      dateOfBirth: dateOfBirth,
      emergencyContact: emergencyContact,
      totalLeaves: totalLeaves,
      employeeStatus: employeeStatus,
      workLocation: workLocation,
      employmentType: employmentType,
      issuedDevices: issuedDevices,

      userId: Number(id),
    };
    try {
      const response = await saveUserDetails(formData);
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
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.data.message);
      console.error("Error saving data:", err.data.Message);
    }
  };

  return (
    <div className="overflow-y-auto mr-5">
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
      <div className="relative w-full h-full">
        <div className=" top-0 left-0 w-[calc(100%)] h-full">
          <form>
            <div className="grid gap-4 py-1">
              <div className="grid grid-cols-8 items-center gap-4 mr-1">
                <Label className="text-center">Employee Id</Label>
                <p className="col-span-3 text-gray-800 bg-gray-100 px-4 py-2 rounded-md shadow-inner min-h-[2.5rem]">
                  {employeeId || (
                    <span className="text-gray-400 italic">No data</span>
                  )}
                </p>
                <Label className="text-center">Personal Email</Label>
                <p className="col-span-3 text-gray-800 bg-gray-100 px-4 py-2 rounded-md shadow-inner min-h-[2.5rem]">
                  {personalEmail || (
                    <span className="text-gray-400 italic">No data</span>
                  )}
                </p>
                <Label className="text-center">Blood Group</Label>
                <p className="col-span-3 text-gray-800 bg-gray-100 px-4 py-2 rounded-md shadow-inner min-h-[2.5rem]">
                  {bloodGroup || (
                    <span className="text-gray-400 italic">No data</span>
                  )}
                </p>
                <Label className="text-center">Employee Grade</Label>
                <p className="col-span-3 text-gray-800 bg-gray-100 px-4 py-2 rounded-md shadow-inner min-h-[2.5rem]">
                  {employeeGrade || (
                    <span className="text-gray-400 italic">No data</span>
                  )}
                </p>
                <Label className="text-center">Address</Label>
                <div className="col-span-3 shadow border bg-gray-100 rounded-md px-4 py-2 min-h-[4rem] whitespace-pre-wrap text-gray-800">
                  {address || (
                    <span className="text-gray-400 italic">
                      No address provided
                    </span>
                  )}
                </div>

                <Label className="text-center">Gender</Label>
                <p className="col-span-3 text-gray-800 bg-gray-100 px-4 py-2 rounded-md shadow-inner min-h-[2.5rem]">
                  {gender || (
                    <span className="text-gray-400 italic">No data</span>
                  )}
                </p>
                <Label className="text-center">Department</Label>
                <p className="col-span-3 text-gray-800 bg-gray-100 px-4 py-2 rounded-md shadow-inner min-h-[2.5rem]">
                  {department || (
                    <span className="text-gray-400 italic">No data</span>
                  )}
                </p>

                <Label className="text-center">Joining Date</Label>
                <p className="col-span-3 text-gray-800 bg-gray-100 px-4 py-2 rounded-md shadow-inner min-h-[2.5rem]">
                  {joiningDate || (
                    <span className="text-gray-400 italic">No data</span>
                  )}
                </p>
                <Label className="text-center">Date Of birth</Label>
                <p className="col-span-3 text-gray-800 bg-gray-100 px-4 py-2 rounded-md shadow-inner min-h-[2.5rem]">
                  {dateOfBirth || (
                    <span className="text-gray-400 italic">No data</span>
                  )}
                </p>
                <Label className="text-center">Emergency Contact</Label>
                <p className="col-span-3 text-gray-800 bg-gray-100 px-4 py-2 rounded-md shadow-inner min-h-[2.5rem]">
                  {emergencyContact || (
                    <span className="text-gray-400 italic">No data</span>
                  )}
                </p>
                <Label className="text-center">Total Leaves</Label>
                <p className="col-span-3 text-gray-800 bg-gray-100 px-4 py-2 rounded-md shadow-inner min-h-[2.5rem]">
                  {totalLeaves || (
                    <span className="text-gray-400 italic">No data</span>
                  )}
                </p>
                <Label className="text-center">Claimed Leaves</Label>
                <p className="col-span-3 text-gray-800 bg-gray-100 px-4 py-2 rounded-md shadow-inner min-h-[2.5rem]">
                  {claimedLeaves || (
                    <span className="text-gray-400 italic">No data</span>
                  )}
                </p>
                <Label className="text-center">Employee Status</Label>
                <p className="col-span-3 text-gray-800 bg-gray-100 px-4 py-2 rounded-md shadow-inner min-h-[2.5rem]">
                  {employeeStatus || (
                    <span className="text-gray-400 italic">No data</span>
                  )}
                </p>
                <Label className="text-center">Work Location</Label>
                <p className="col-span-3 text-gray-800 bg-gray-100 px-4 py-2 rounded-md shadow-inner min-h-[2.5rem]">
                  {workLocation || (
                    <span className="text-gray-400 italic">No data</span>
                  )}
                </p>
                <Label className="text-center">Employement Type</Label>
                <p className="col-span-3 text-gray-800 bg-gray-100 px-4 py-2 rounded-md shadow-inner min-h-[2.5rem]">
                  {employmentType || (
                    <span className="text-gray-400 italic">No data</span>
                  )}
                </p>
                <Label className="text-center">Issued Devices</Label>
                <p className="col-span-3 text-gray-800 bg-gray-100 px-4 py-2 rounded-md shadow-inner min-h-[2.5rem]">
                  {issuedDevices || (
                    <span className="text-gray-400 italic">No data</span>
                  )}
                </p>
              </div>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center justify-center mx-auto mt-7 rounded-md bg-blue-800 px-4 py-2 text-white hover:bg-blue-500">
                  <Pen className="h-5 w-5 mr-2" />
                  Edit Details
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-[60vw] overflow-y-auto max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle className="mb-2">Edit User Details</DialogTitle>
                </DialogHeader>

                <div className="relative w-full h-full">
                  <div className=" top-0 left-0 w-[calc(100%)] h-full">
                    <form onSubmit={handleSubmit}>
                      <div className="grid gap-4 py-3">
                        <div className="flex flex-col justify-center items-center">
                          {/* Button wrapped around Avatar */}
                          <button
                            type="button" // Prevent form submission
                            className="cursor-pointer"
                            onClick={handleAvatarClick}
                          >
                            <Avatar className="h-32 w-32 rounded-full flex justify-center items-center">
                              {/* If base64Image exists, use it as the src, else show the fallback */}
                              <AvatarImage
                                src={base64Image || ""}
                                alt={"profilePic"}
                              />
                              {username !== "" ? (
                                <AvatarFallback className="rounded-lg text-4xl">
                                  {getInitials(username || "XX")}
                                </AvatarFallback>
                              ) : (
                                <AvatarFallback className="rounded-lg text-4xl">
                                  <User2 className="h-20 w-20" />
                                </AvatarFallback>
                              )}
                            </Avatar>
                          </button>

                          {/* Add the text under the avatar */}
                          <p className="mt-2 text-sm text-center">
                            Click above picture for uploading profile picture
                          </p>

                          {/* Hidden file input */}
                          <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileChange} // This handles the file selection
                            style={{ display: "none" }} // Hide the file input
                          />
                        </div>

                        <div className="grid grid-cols-8 items-center gap-4 mr-1">
                          <Label className="text-center col-span-2">
                            User Name
                            <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="col-span-6"
                          />
                          <Label className="text-center col-span-2">
                            Email<span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="col-span-6"
                          />

                          <Label className="text-center col-span-2">
                            Designation
                            <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Input
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            className="col-span-6"
                          />
                          <Label className="text-center col-span-2">
                            Phone Number
                            <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Input
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="col-span-6"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-8 items-center gap-4 mr-1">
                        <Label className="text-center">Employee Id</Label>
                        <Input
                          value={employeeId}
                          onChange={(e) => setEmployeeId(e.target.value)}
                          className="col-span-3"
                        />
                        <Label className="text-center">Personal Email</Label>
                        <Input
                          value={personalEmail}
                          onChange={(e) => setPersonalEmail(e.target.value)}
                          className="col-span-3"
                        />
                        <Label className="text-center">Blood Group</Label>
                        <Input
                          value={bloodGroup}
                          onChange={(e) => setBloodGroup(e.target.value)}
                          className="col-span-3"
                        />
                        <Label className="text-center">Employee Grade</Label>
                        <Input
                          value={employeeGrade}
                          onChange={(e) => setEmployeeGrade(e.target.value)}
                          className="col-span-3"
                        />
                        <Label className="text-center">Address</Label>
                        <textarea
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="col-span-3 shadow border"
                        />

                        <Label className="text-center">Gender</Label>
                        <Select
                          value={gender}
                          onValueChange={(value) => setGender(value)}
                        >
                          <SelectTrigger className="col-span-3 p-2 border rounded-md">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="others">Others</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <Label className="text-center">Department</Label>
                        <Input
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="col-span-3"
                        />

                        <Label className="text-center">Joining Date</Label>
                        <Input
                          type="date"
                          value={joiningDate}
                          onChange={(e) => setJoiningDate(e.target.value)}
                          className="col-span-3"
                        />
                        <Label className="text-center">Date Of birth</Label>
                        <Input
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          className="col-span-3"
                        />
                        <Label className="text-center">Emergency Contact</Label>
                        <Input
                          value={emergencyContact}
                          onChange={(e) => setEmergencyContact(e.target.value)}
                          className="col-span-3"
                        />
                        <Label className="text-center">Total Leaves</Label>
                        <Input
                          value={totalLeaves}
                          onChange={(e) => setTotalLeaves(e.target.value)}
                          className="col-span-3"
                        />
                        <Label className="text-center">Employee Status</Label>
                        <Input
                          value={employeeStatus}
                          onChange={(e) => setEmployeeStatus(e.target.value)}
                          className="col-span-3"
                        />
                        <Label className="text-center">Work Location</Label>
                        <Input
                          value={workLocation}
                          onChange={(e) => setWorkLocation(e.target.value)}
                          className="col-span-3"
                        />
                        <Label className="text-center">Employement Type</Label>
                        <Input
                          value={employmentType}
                          onChange={(e) => setEmploymentType(e.target.value)}
                          className="col-span-3"
                        />
                        <Label className="text-center">Issued Devices</Label>
                        <Input
                          value={issuedDevices}
                          onChange={(e) => setIssuedDevices(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <DialogFooter>
                        <button
                          type="submit"
                          className={`flex w-200px mt-5 justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm 
                                            hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus-offset-2 ${
                                              !isFormValid() || isLoading
                                                ? "cursor-not-allowed opacity-50"
                                                : ""
                                            }`}
                          disabled={!isFormValid() || isLoading}
                        >
                          {isLoading ? "Saving..." : "Save Details"}
                        </button>
                      </DialogFooter>
                    </form>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserPersonalDetails;
