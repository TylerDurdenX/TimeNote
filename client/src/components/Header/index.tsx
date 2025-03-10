'use client'

import React, { useRef, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Bell, CalendarClock, ChartCandlestick, ChartNoAxesCombined, FileChartColumnIncreasing, FileClock, FilterX, LaptopMinimal, MapPin, PlusSquare, ScreenShare, User, User2, UsersRound } from 'lucide-react'
import { Button } from '@mui/material'
import { DatePickerWithRange } from './DateRangePicker' 
import { DateRange } from 'react-day-picker'
import { useCreateUserMutation } from '@/store/api';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitials } from '../Sidebar/nav-user';
import { Toaster, toast } from 'react-hot-toast';

type Props = {
  name: string
  isSmallText?: boolean
  hasFilters?: boolean
  hasTeamFilter?: boolean
  date?: DateRange | undefined
  setDate?: React.Dispatch<React.SetStateAction<DateRange | undefined>>
  onRangeSelect?: () => void
  clearFilter?: () => void
  buttonName?: string
}

const Header = ({
  name,
  isSmallText = false,
  hasFilters,
  hasTeamFilter,
  date,
  setDate,
  onRangeSelect,
  clearFilter,
  buttonName
}: Props) => {

  let icon;

  switch (name) {
    case 'Dashboard':
      icon = <LaptopMinimal className='mr-2'/>;  
      break;
    case 'Screenshots':
      icon = <ScreenShare  className='mr-2'/>;  
      break;
    case 'Geo Tracking':
      icon = <MapPin className='mr-2'/>;  
      break;
    case 'Attendance':
      icon = <UsersRound className='mr-2'/>;  
      break;
    case 'Productivity':
      icon = <ChartNoAxesCombined className='mr-2'/>;  
      break;
    case 'Project Tasks Timeline':
      icon = <CalendarClock className='mr-2'/>;  
      break;
    case 'Activity':
      icon = <ChartCandlestick className='mr-2'/>;  
      break;
    case 'User Details':
      icon = <User className='mr-2'/>;  
      break;
    case 'Alerts':
      icon = <Bell className='mr-2'/>;  
      break;
    case 'Reports':
      icon = <FileChartColumnIncreasing className='mr-2'/>;  
      break;
      case 'Timesheet':
        icon = <FileClock className='mr-2'/>;  
        break;
  }

  const [isOpen, setIsOpen] = useState(false)
  const [username,setUsername] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [email, setEmail] = useState('')
  const [designation, setDesignation] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [base64Image, setBase64Image] = useState<string | null>(null);

  localStorage.removeItem('ally-supports-cache')
  localStorage.removeItem('persist:root')

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click(); // Trigger file input click when the avatar is clicked
  };

  // Handle file selection and file reading
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Selected file:', file);

      const reader = new FileReader();

      // Event handler to run once the file is read
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          try {
            // Set the base64 result as the image
            setBase64Image(reader.result); // Update the state with the base64 string
          } catch (err) {
            toast.error('Some error occurred');
            console.error(err);
          }
        }
      };

      // Read the file as a data URL (base64 encoded)
      reader.readAsDataURL(file); // This triggers the reader.onloadend once file is read
    }
  };

  const isFormValid = () => {
    return username && userPassword && email && designation && phoneNumber
  };

  const [createUser, {isLoading}] = useCreateUserMutation()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const formData = {
      username: username,
      password: userPassword,
      email: email,
      designation: designation,
      phoneNumber: phoneNumber,
      base64Image: base64Image
    };
    try {
      const response = await createUser(formData);
      console.log(response)
      setIsOpen(false);
      // @ts-ignore
      if(response.error?.data.status === 'Error' || response.error?.data.status === 'Fail'){
                            // @ts-ignore
                            toast.error(response.error?.data.message)
                          }else{
                            toast.success(response.data?.message!);
                          }
      setUsername("");
      setUserPassword("");
      setEmail("");
      setPhoneNumber("");
      setDesignation('')
      setBase64Image('')
    } catch (err: any) {
      toast.error(err.data.message);
      console.error("Error creating Project:", err.data.Message);
    }
  };

  const roles = sessionStorage.getItem('userRoles') || ""
  const [ADMINUser, setADMINUser] = useState(roles.split(',').includes('ADMIN'))

  return (
    <div className="flex relative w-full pl-5 h-[20px] mb-1 items-center justify-between">
      <h1 className={`${isSmallText ? 'text-lg' : 'text-2xl'} font-semibold dark:text-white flex items-center`}>
      {icon}
      {name}
      </h1>

      {hasFilters && (
        <div className="flex items-center space-x-4 mr-5 overflow-x-hidden">
          {hasTeamFilter && (
            <Select>
              <SelectTrigger className="w-[180px] text-gray-800">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>All Projects</SelectLabel>
                  <SelectItem value="apple">TCS</SelectItem>
                  <SelectItem value="banana">Infosys</SelectItem>
                  <SelectItem value="blueberry">KPMG</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
          <DatePickerWithRange
            date={date}
            setDate={setDate!}
            onRangeSelect={onRangeSelect!}
          />
          <Button className="bg-gray-200 hover:bg-gray-100" onClick={clearFilter}>
            <FilterX className="text-gray-800" />
          </Button>
        </div>
      )}
      {(buttonName === "Create User" && ADMINUser) ? <>
        <Dialog open={isOpen} onOpenChange={setIsOpen} >
          <DialogTrigger asChild>
            <button className="flex items-center rounded-md bg-blue-800 px-3 py-2 text-white hover:bg-blue-500 mr-7">
              <PlusSquare className="h-5 w-5 mr-2" />
              Add User
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[42vw] lg:max-w-[42vw] h-[33vw] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="mb-2">Add User</DialogTitle>
            </DialogHeader>

            <div
              className="relative w-full h-full"
              >
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
                      <Avatar className="h-28 w-28 rounded-full flex justify-center items-center">
                        {/* If base64Image exists, use it as the src, else show the fallback */}
                        <AvatarImage src={base64Image || ''} alt={'profilePic'} />
                        {username !== '' ? (
                          <AvatarFallback className="rounded-lg text-4xl">
                            {getInitials(username)}
                          </AvatarFallback>
                        ) : (
                          <AvatarFallback className="rounded-lg text-4xl">
                            <User2 className="h-16 w-16" />
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
                      style={{ display: 'none' }} // Hide the file input
                    />
                  </div>

                    <div className="grid grid-cols-8 items-center gap-4 mr-1">
                      <Label className="text-center ">User Name</Label>
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="col-span-7"
                      />
                      <Label className="text-center ">Email</Label>
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="col-span-7"
                      />
                      <Label className="text-center">Password</Label>
                      <Input
                        type='password'
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        className="col-span-7 shadow border"
                      />
                       <Label className="text-center ">Designation</Label>
                      <Input
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="col-span-7"
                      />
                      <Label className="text-center">Phone Number</Label>
                      <Input
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="col-span-7"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <button
                      type="submit"
                      className={`flex w-200px mt-2 justify-center bg-blue-600 rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm 
                                hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus-offset-2 ${
                                  !isFormValid() || isLoading
                                    ? "cursor-not-allowed opacity-50"
                                    : ""
                                }`}
                      disabled={!isFormValid() || isLoading}
                    >
                      {isLoading
                        ? "Creating..."
                        : "Create User"}
                    </button>
                  </DialogFooter>
                </form>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </> : ""}
    </div>
  )
}

export default Header
