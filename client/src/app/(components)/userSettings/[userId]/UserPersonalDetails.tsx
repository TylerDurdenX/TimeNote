import React, { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/components/Sidebar/nav-user";
import {
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
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";
import {
  Pen,
  User2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Shield,
  Heart,
  UserCheck,
  Briefcase,
  Monitor,
  Clock,
  Camera,
} from "lucide-react";

type Props = {
  id: number;
};

const UserPersonalDetails = ({ id }: Props) => {
  const { data: dataUser } = useGetUserPersonalDetailsQuery(
    {
      id: Number(id),
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

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
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function formatDisplayDate(dateString: string): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          try {
            setBase64Image(reader.result);
          } catch (err) {
            toast.error("Some error occurred");
            console.error(err);
          }
        }
      };

      reader.readAsDataURL(file);
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const InfoCard = ({ icon: Icon, label, value, className = "" }: any) => (
    <div
      className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          {value ? (
            <p className="text-gray-900 font-medium break-words">{value}</p>
          ) : (
            <span className="text-gray-400 italic text-sm">
              No data provided
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-full mx-auto space-y-6">
        {/* Header Profile Card */}
        <Card className="bg-white shadow-sm border-0 ring-1 ring-gray-200">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-32 w-32 ring-4 ring-white shadow-lg">
                    <AvatarImage
                      src={dataUser?.profilePicture?.base64}
                      alt={dataUser?.username}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-3xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getInitials(dataUser?.username || "XX")}
                    </AvatarFallback>
                  </Avatar>
                  {employeeStatus && (
                    <Badge
                      className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 ${getStatusColor(
                        employeeStatus
                      )} border`}
                    >
                      {employeeStatus}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Main Info Section */}
              <div className="flex-1 text-center lg:text-left space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {dataUser?.username || "Unknown User"}
                  </h1>
                  <p className="text-lg text-blue-600 font-medium mb-1">
                    {dataUser?.designation || "No designation"}
                  </p>
                  {employeeId && (
                    <p className="text-gray-600">Employee ID: {employeeId}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{dataUser?.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{dataUser?.phoneNumber}</span>
                  </div>
                  {department && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Building className="h-4 w-4" />
                      <span className="text-sm">{department}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                    <Pen className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                </DialogTrigger>

                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader className="pb-6">
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                      Edit User Details
                    </DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Profile Picture Section */}
                    <div className="flex flex-col items-center space-y-4 p-6 bg-gray-50 rounded-xl">
                      <button
                        type="button"
                        className="relative group cursor-pointer"
                        onClick={handleAvatarClick}
                      >
                        <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg group-hover:ring-blue-200 transition-all">
                          <AvatarImage src={base64Image || ""} alt="Profile" />
                          <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {username ? (
                              getInitials(username)
                            ) : (
                              <User2 className="h-12 w-12" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="h-6 w-6 text-white" />
                        </div>
                      </button>
                      <p className="text-sm text-gray-600 text-center">
                        Click to upload profile picture
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                      />
                    </div>

                    {/* Basic Information */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Username <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Email <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Designation <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Phone Number <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Employee Details */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                        Employee Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Employee ID
                          </Label>
                          <Input
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Department
                          </Label>
                          <Input
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Employee Grade
                          </Label>
                          <Input
                            value={employeeGrade}
                            onChange={(e) => setEmployeeGrade(e.target.value)}
                            className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Employment Type
                          </Label>
                          <Input
                            value={employmentType}
                            onChange={(e) => setEmploymentType(e.target.value)}
                            className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Employee Status
                          </Label>
                          <Input
                            value={employeeStatus}
                            onChange={(e) => setEmployeeStatus(e.target.value)}
                            className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Work Location
                          </Label>
                          <Input
                            value={workLocation}
                            onChange={(e) => setWorkLocation(e.target.value)}
                            className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Joining Date
                          </Label>
                          <Input
                            type="date"
                            value={joiningDate}
                            onChange={(e) => setJoiningDate(e.target.value)}
                            className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Total Leaves
                          </Label>
                          <Input
                            value={totalLeaves}
                            onChange={(e) => setTotalLeaves(e.target.value)}
                            className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Issued Devices
                          </Label>
                          <Input
                            value={issuedDevices}
                            onChange={(e) => setIssuedDevices(e.target.value)}
                            className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Personal Email
                          </Label>
                          <Input
                            value={personalEmail}
                            onChange={(e) => setPersonalEmail(e.target.value)}
                            className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Date of Birth
                          </Label>
                          <Input
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Gender
                          </Label>
                          <Select value={gender} onValueChange={setGender}>
                            <SelectTrigger className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Blood Group
                          </Label>
                          <Input
                            value={bloodGroup}
                            onChange={(e) => setBloodGroup(e.target.value)}
                            className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Emergency Contact
                          </Label>
                          <Input
                            value={emergencyContact}
                            onChange={(e) =>
                              setEmergencyContact(e.target.value)
                            }
                            className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Address
                        </Label>
                        <textarea
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          rows={3}
                          className="w-full rounded-lg shadow-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 p-3"
                          placeholder="Enter full address..."
                        />
                      </div>
                    </div>

                    <DialogFooter className="pt-6 border-t">
                      <button
                        type="submit"
                        disabled={!isFormValid() || isLoading}
                        className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl transition-all duration-200 ${
                          !isFormValid() || isLoading
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        }`}
                      >
                        {isLoading ? "Saving..." : "Save Changes"}
                      </button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Employee Information */}
          <InfoCard icon={UserCheck} label="Employee ID" value={employeeId} />
          <InfoCard icon={Building} label="Department" value={department} />
          <InfoCard
            icon={Briefcase}
            label="Employee Grade"
            value={employeeGrade}
          />
          <InfoCard
            icon={Calendar}
            label="Joining Date"
            value={joiningDate ? formatDisplayDate(joiningDate) : ""}
          />
          <InfoCard icon={MapPin} label="Work Location" value={workLocation} />
          <InfoCard
            icon={Shield}
            label="Employment Type"
            value={employmentType}
          />

          {/* Personal Information */}
          <InfoCard icon={Mail} label="Personal Email" value={personalEmail} />
          <InfoCard
            icon={Calendar}
            label="Date of Birth"
            value={dateOfBirth ? formatDisplayDate(dateOfBirth) : ""}
          />
          <InfoCard icon={User2} label="Gender" value={gender} />
          <InfoCard icon={Heart} label="Blood Group" value={bloodGroup} />
          <InfoCard
            icon={Phone}
            label="Emergency Contact"
            value={emergencyContact}
          />
          <InfoCard
            icon={Monitor}
            label="Issued Devices"
            value={issuedDevices}
          />

          {/* Leave Information */}
          <InfoCard icon={Clock} label="Total Leaves" value={totalLeaves} />
          <InfoCard icon={Clock} label="Claimed Leaves" value={claimedLeaves} />

          {/* Address - Full Width */}
          <div className="md:col-span-2 lg:col-span-3">
            <InfoCard
              icon={MapPin}
              label="Address"
              value={address}
              className="h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPersonalDetails;
