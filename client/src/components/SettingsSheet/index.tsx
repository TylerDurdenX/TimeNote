import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import * as React from "react";
import { Popover, PopoverContent } from "@/components/ui/popover";
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
import {
  AlertTriangle,
  Camera,
  Mail,
  Settings,
  Trash2,
  Upload,
} from "lucide-react";
import { useGetUserQuery, useUpdateProfilePictureMutation } from "@/store/api";
import { useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "../Sidebar/nav-user";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Typography } from "@mui/material";
import { useDispatch } from "react-redux";
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
    } catch (error) {
      toast.error("Some Error occurred");
      console.log(error);
    }
    // setOpen(false);
  };
  const handleImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]; // Get the selected file
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (typeof reader.result === "string") {
          try {
            const response = await updateProfilePic({
              email: userEmail!,
              base64: reader.result!,
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
              setBase64Image(reader.result);
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
        <button className="group relative p-2 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg">
          <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 group-hover:rotate-90 transition-all duration-300" />

          {/* Tooltip */}
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            Settings
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 dark:bg-gray-700 rotate-45"></div>
          </div>
        </button>
      </SheetTrigger>

      <SheetContent className="w-[400px] sm:w-[500px] bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-l border-gray-200 dark:border-gray-700">
        <SheetHeader className="pb-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Settings
              </SheetTitle>
              <SheetDescription className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your profile picture and account settings
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Profile Section */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Profile Information
            </h3>

            <div className="flex items-center gap-6">
              <Popover open={open} onOpenChange={setOpen}>
                <div className="relative group">
                  <button className="cursor-pointer transform transition-all duration-300 hover:scale-105">
                    <div className="relative">
                      <Avatar className="h-24 w-24 rounded-2xl shadow-lg ring-4 ring-blue-100 dark:ring-blue-900/30 group-hover:ring-blue-200 dark:group-hover:ring-blue-800/50 transition-all duration-300">
                        <AvatarImage
                          src={base64Image || user.avatar}
                          alt={user.name}
                          className="object-cover rounded-2xl"
                        />
                        <AvatarFallback className="rounded-2xl text-2xl font-bold bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                          {getInitials(user.name!)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Camera Icon Overlay */}
                      <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Camera className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </button>

                  <PopoverContent
                    className="w-64 p-3 rounded-xl shadow-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    style={{ zIndex: 1000 }}
                  >
                    <button
                      className="flex items-center justify-center w-full p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 dark:from-gray-700 dark:to-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 group"
                      onClick={() =>
                        document.getElementById("fileInput")?.click()
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg group-hover:bg-blue-600 transition-colors duration-300">
                          <Camera className="h-4 w-4 text-white" />
                        </div>
                        <Typography className="text-gray-700 dark:text-gray-200 font-medium">
                          Change Profile Picture
                        </Typography>
                      </div>
                    </button>
                  </PopoverContent>
                </div>
              </Popover>

              {/* Hidden file input */}
              <input
                type="file"
                id="fileInput"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />

              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  {user.name}
                </h4>
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {user.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Profile Actions
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {/* Update Picture Button */}
              <button
                className="group relative w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 ease-in-out hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
                onClick={() => document.getElementById("fileInput")?.click()}
              >
                <div className="flex items-center justify-center gap-3">
                  <Upload className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-semibold">Update Picture</span>
                </div>
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              {/* Remove Picture Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="group relative w-full py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 ease-in-out hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800">
                    <div className="flex items-center justify-center gap-3">
                      <Trash2 className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-semibold">Remove Picture</span>
                    </div>
                    <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </AlertDialogTrigger>

                <AlertDialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-3 text-xl text-gray-800 dark:text-gray-100">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      Are you sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">
                      Do you want to remove your profile picture? This action
                      will replace your current picture with your initials.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter className="gap-3 mt-6">
                    <AlertDialogCancel
                      onClick={() => setOpen(false)}
                      className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 rounded-lg font-medium transition-all duration-200"
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={removeProfilePicture}
                      className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Remove Picture
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
