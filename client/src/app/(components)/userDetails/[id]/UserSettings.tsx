import Tags from "@/components/SettingsSheet/AutoCompleteTags";
import { getInitials } from "@/components/Sidebar/nav-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { toast } from "sonner";
import AutocompleteTag from "./Autocomplete";
import { useCheckRoleCodeQuery, useCreateRoleMutation } from "@/store/api";
import DropdownTag from "./DropdownTag";

type Props = {
  id: number;
};

const defaultUser = {
  name: "XXXX",
  email: "XXX@XXX.XXX",
  avatar: "",
};

const UserSettings = ({ id }: Props) => {
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAuthorities, setSelectedAuthorities] = useState<any[]>([]);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Prepare the form data to submit
    const formData = {
      name,
    };

    try {
      // Trigger the createRole mutation
      // const response = await createRole(formData).unwrap(); // Use unwrap to handle the result directly
      //toast.success(response.message)
    } catch (err: any) {
      toast.error(err.data.message);
      console.error("Error creating role:", err.data.Message);
    }
    console.log("Form Submitted with:", formData);
  };

  const isFormValid = () => {
    return name 
}

const {
    data,
    isLoading,
    isError,
    error: queryError,
    refetch, // This allows us to manually trigger the query
  } = useCheckRoleCodeQuery(
    { code }, // Pass code to query
    {
      skip: !code.trim(), // Skip automatic execution
    }
  );

const [createRole, { isLoading: loading, isError: creationIsError , error:creationError, data: result }] = useCreateRoleMutation();


  return (
    <form onSubmit={handleSubmit}>
      <div className="flex h-full w-full">
        {/* Profile Avatar */}
        <div className="w-1/4 flex justify-center items-center p-4">
          <Avatar className="h-20 w-20 rounded-full justify-center items-center">
            <AvatarImage src={defaultUser.avatar} alt={defaultUser.name} />
            <AvatarFallback className="rounded-lg text-4xl">
              {getInitials(defaultUser.name!)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Fields Section */}
        <div className="w-3/4 flex flex-col justify-center gap-4 p-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Username */}
            <div className="flex flex-col">
              <p className="font-semibold">Username</p>
              <p>nam</p>
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <p className="font-semibold">Email</p>
              <p>ema</p>
            </div>

            {/* Phone */}
            <div className="flex flex-col">
              <p className="font-semibold">Phone</p>
              <p>phone</p>
            </div>

            {/* Designation */}
            <div className="flex flex-col">
              <p className="font-semibold">Designation</p>
              <p>desgn</p>
            </div>
          </div>
        </div>
      </div>

      
      <div className="flex  w-full">
        <div className="w-1/6 flex justify-center items-center p-4">
        <Label className="text-center">Projects</Label>
        </div>

        {/* Fields Section */}
        <div className="w-5/6 flex flex-col justify-center gap-4 p-4">
          <div className="">
            {/* Username */}
            <AutocompleteTag  setSelectedOptions={setSelectedOptions} label="" placeholder="Projects"/>
          <div className="col-span-8 flex justify-center">
            {error && <div className="text-red-500 text-sm">{error}</div>}
          </div>
          </div>
        </div>
      </div>
      <div className="flex  w-full">
        {/* Teams */}
        <div className="w-1/6 flex justify-center items-center p-4">
        <Label className="text-center">Teams</Label>
        </div>

        {/* Fields Section */}
        <div className="w-5/6 flex flex-col justify-center gap-4 p-4">
          <div className="">
            {/* Username */}
            <AutocompleteTag  setSelectedOptions={setSelectedOptions} label="" placeholder="Teams"/>
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

        {/* Role */}
        <div className="w-5/6 flex flex-col justify-center gap-4 p-4">
          <div className="">
            <AutocompleteTag  setSelectedOptions={setSelectedOptions} label="" placeholder="Roles"/>
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

        {/* Reports To*/}
        <div className="w-5/6 flex flex-col justify-center gap-4 p-4">
          <div className="">
            <DropdownTag/>
          <div className="col-span-8 flex justify-center">
            {error && <div className="text-red-500 text-sm">{error}</div>}
          </div>
          </div>
        </div>
      </div>

      <div className="flex  w-full">
        <div className="w-1/6 flex justify-center items-center p-4">
        <Label className="text-center">Reporting users</Label>
        </div>

        {/* Reporting users */}
        <div className="w-5/6 flex flex-col justify-center gap-4 p-4">
          <div className="">
            <AutocompleteTag  setSelectedOptions={setSelectedOptions} label="" placeholder="Roles"/>
          <div className="col-span-8 flex justify-center">
            {error && <div className="text-red-500 text-sm">{error}</div>}
          </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center items-center h-full">
  <button
    type="submit"
    className={`flex w-[139px] mt-4 text-center bg-blue-600 rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm 
    hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus-offset-2 ${!isFormValid() || isLoading ? "cursor-not-allowed opacity-50" : ""}`}
    disabled={!isFormValid() || isLoading}
  >
    {loading ? "Saving..." : "Save Changes"}
  </button>
</div>


    </form>
  );
};

export default UserSettings;
