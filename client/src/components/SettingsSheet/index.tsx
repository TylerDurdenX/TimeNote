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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import {Settings } from "lucide-react";
import { DialogDemo } from "./ProductivitySettings";
import { useGetUserQuery, useUpdateProfilePictureMutation } from "@/store/api";
import { useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "../Sidebar/nav-user";
import {useState } from "react";
import { toast } from "sonner";
import { CreateRole } from "./RoleSettings";

export function SheetDemo() {
  const userEmail = useSearchParams().get("email");
  const { data, isLoading, error } = useGetUserQuery({ email: userEmail! });
  const defaultUser ={
    name :"XXXX",
    email: "XXX@XXX.XXX",
    avatar: ""
  }
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [updateProfilePic] = useUpdateProfilePictureMutation()
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Get the selected file
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          try{
          updateProfilePic({email: userEmail!,base64: reader.result!});
          toast.success("Profile Picture Updated!");
          setBase64Image(reader.result);
          }catch(err){
            toast.error("Some Error occurred");
            console.log(err)
          }
        }
      };
      reader.readAsDataURL(file); // Read the file as base64
    }
  };

  const user = data?.user || defaultUser
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
        <button
        onClick={() => document.getElementById('fileInput')?.click()}
        className="cursor-pointer"
      >
        <Avatar className="h-20 w-20 rounded-full justify-center items-center">
          <AvatarImage src={base64Image || user.avatar} alt={user.name} />
          <AvatarFallback className="rounded-lg text-4xl">
            {getInitials(user.name!)} 
          </AvatarFallback>
        </Avatar>
      </button>

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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value="Pedro Duarte" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              value={data?.user.name}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogDemo />
        <CreateRole />
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
