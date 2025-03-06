import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { Button } from "../ui/button";
import { Settings } from "lucide-react";
import { DialogDemo } from "./ProductivitySettings";
import { useGetUserQuery, useUpdateProfilePictureMutation } from "@/store/api";
import { useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "../Sidebar/nav-user";
import { useState } from "react";
import { toast } from "sonner";
import { CreateRole } from "./RoleSettings";
import { Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/store/authSlice";
import { useRouter } from "next/navigation";

export function SheetDemo() {
  const userEmail = useSearchParams().get("email");
  const { data, isLoading, error } = useGetUserQuery({ email: userEmail! });
  const [open, setOpen] = useState(false);
  const defaultUser = {
    name: "XXXX",
    email: "XXX@XXX.XXX",
    avatar: "",
  };

  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [updateProfilePic] = useUpdateProfilePictureMutation();
  const dispatch = useDispatch();
  const router = useRouter();
  const removeProfilePicture = async () => {
    try {
      const response = await updateProfilePic({
        email: userEmail!,
        base64: "",
      });
      // if (Number(res.status) === 401) {
      //   dispatch(setAuthUser(null));

      //   router.push("/");

      //   toast.success("Session Timeout, Please log in again!");
      // }

             // @ts-ignore
            if(response.error?.data.status === 'Error' || response.error?.data.status === 'Fail'){
               // @ts-ignore
               toast.error(response.error?.data.message)
             }else{
               toast.success(response.data?.message);
             }
    } catch (error) {
      toast.error("Some Error occurred");
      console.log(error);
    }
    setOpen(false);
  };
  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Get the selected file
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (typeof reader.result === "string") {
          try {
            const response = await updateProfilePic({ email: userEmail!, base64: reader.result! });
            // @ts-ignore
            if(response.error?.data.status === 'Error' || response.error?.data.status === 'Fail'){
              // @ts-ignore
              toast.error(response.error?.data.message)
            }else{
              toast.success(response.data?.message);
              setBase64Image(reader.result);
              window.location.reload()
            }
          } catch (err) {
            toast.error("Some Error occurred");
            console.log(err);
          }
        }
      };
      reader.readAsDataURL(file); // Read the file as base64
      setOpen(false);
    }
  };

  const user = data?.user || defaultUser;
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button>
          <Settings className="h-6 w-6  mt-2 cursor-pointer dark:text-white"/>
        </button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Make changes to your profile picture here.
          </SheetDescription>
        </SheetHeader>
        <div className="flex items-center mt-3 gap-5 border-y-[1.5px] border-gray-200 px-8 py-4 dark:border-gray-700">
          <Popover open={open} onOpenChange={setOpen}>
            {/* <PopoverTrigger> */}
              <button className="cursor-pointer">
                <Avatar className="h-20 w-20 rounded-full justify-center items-center">
                  <AvatarImage
                    src={base64Image || user.avatar}
                    alt={user.name}
                  />
                  <AvatarFallback className="rounded-lg text-4xl">
                    {getInitials(user.name!)}
                  </AvatarFallback>
                </Avatar>
              </button>
            {/* </PopoverTrigger> */}
            <PopoverContent className="flex flex-col p-2 rounded-lg shadow-lg bg-white min-w-[200px]" style={{ zIndex: 1000 }}>
              <button
                className="flex items-center justify-start w-full p-3 rounded-md hover:bg-gray-200 focus:outline-none transition duration-200"
                onClick={() => document.getElementById("fileInput")?.click()}
              >
                <Typography className="text-primary">
                  Change Profile Picture
                </Typography>
              </button>
              
            </PopoverContent>
          </Popover>

          {/* Hidden file input */}
          <input
            type="file"
            id="fileInput"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <div>
            <h3 className="font-bold text-md tracking-wide dark:text-gray-200">
              {user.name}
            </h3>
            <div className="mt-1 flex items-start gap-2">
              <p className="text-sx text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center h-20 rounded-lg">
  <div className="flex gap-1"> {/* Side-by-side layout */}
    {/* Update Picture Button */}
    <button
      className="w-44 bg-blue-800 text-white rounded-lg shadow-lg hover:bg-blue-600 transform transition duration-300 ease-in-out hover:scale-105 focus:outline-none"
      onClick={() => document.getElementById("fileInput")?.click()}
    >
      Update Picture
    </button>

    {/* Remove Picture Button */}
    <AlertDialog>
                <AlertDialogTrigger asChild>
                <button
      className="w-44 py-2 bg-blue-800 text-white rounded-lg shadow-lg hover:bg-blue-600 transform transition duration-300 ease-in-out hover:scale-105 focus:outline-none"
      
    >
      Remove Picture
    </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-700">
                      Do you want to remove your profile picture ?
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
                    <AlertDialogAction onClick={removeProfilePicture}>
                      Yes
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

  </div>
</div>

        {/* <DialogDemo />
        <CreateRole/> */}
        
      </SheetContent>
    </Sheet>
  );
}
