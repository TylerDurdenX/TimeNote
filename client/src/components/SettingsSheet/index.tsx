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
      const res = await updateProfilePic({
        email: userEmail!,
        base64: "",
      }).unwrap();
      console.log(res);
      if (Number(res.status) === 401) {
        dispatch(setAuthUser(null));

        router.push("/");

        toast.success("Session Timeout, Please log in again!");
      }
      toast.success("Profile Picture Removed Successfully!");
    } catch (error) {
      toast.error("Some Error occurred");
      console.log(error);
    }
    setOpen(false);
  };
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Get the selected file
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          try {
            updateProfilePic({ email: userEmail!, base64: reader.result! });
            toast.success("Profile Picture Updated!");
            setBase64Image(reader.result);
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
          <Settings className="h-6 w-6  mt-2 cursor-pointer dark:text-white" />
        </button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Make changes to your profile here.
          </SheetDescription>
        </SheetHeader>
        <div className="flex items-center mt-3 gap-5 border-y-[1.5px] border-gray-200 px-8 py-4 dark:border-gray-700">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger>
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
            </PopoverTrigger>
            <PopoverContent className="flex flex-col p-2 rounded-lg shadow-lg bg-white min-w-[200px]">
              <button
                className="flex items-center justify-start w-full p-3 rounded-md hover:bg-gray-200 focus:outline-none transition duration-200"
                onClick={() => document.getElementById("fileInput")?.click()}
              >
                <Typography className="text-primary">
                  Change Profile Picture
                </Typography>
              </button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="flex items-center justify-start w-full p-3 rounded-md hover:bg-gray-200 focus:outline-none transition duration-200">
                    <Typography className="text-primary">
                      Remove Profile Picture
                    </Typography>
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
        <div className="grid gap-4 py-4">
        </div>
        <DialogDemo />
        <CreateRole/>
        
      </SheetContent>
    </Sheet>
  );
}
