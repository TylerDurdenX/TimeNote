import { getInitials } from "@/components/Sidebar/nav-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import AutocompleteTag from "./Autocomplete";
import {
  useCheckRoleCodeQuery,
  useCreateRoleMutation,
  useGetUserDetailsQuery,
} from "@/store/api";
import DropdownTag from "./DropdownTag";
import { useSearchParams } from "next/navigation";

type Props = {
  id: number;
};

const UserSettings = ({ id }: Props) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAuthorities, setSelectedAuthorities] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [state, setState] = useState(id);
  const [internalState, setInternalState] = useState(id);

  useEffect(() => {
    setInternalState(id);
  }, [id]);

  const {
    data: dataUser,
    isLoading: isLoadingUser,
    error: errorQuery,
  } = useGetUserDetailsQuery({
    id: id,
  });

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
    return name;
  };

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

  const [
    createRole,
    {
      isLoading: loading,
      isError: creationIsError,
      error: creationError,
      data: result,
    },
  ] = useCreateRoleMutation();

  return (
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
            <DropdownTag email={dataUser?.email!} key={internalState}/>
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

        <div className="w-5/6 flex flex-col justify-center gap-4 p-4">
          <div className="">
            <AutocompleteTag
              label=""
              placeholder="Reporting Users"
              entityName="User"
              selectedList={dataUser?.reports!}
              key={internalState}
              email={dataUser?.email!}
            />
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
    hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus-offset-2 ${
      !isFormValid() || isLoading ? "cursor-not-allowed opacity-50" : ""
    }`}
          disabled={!isFormValid() || isLoading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default UserSettings;
