import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCheckRoleCodeQuery, useCreateRoleMutation } from "@/store/api";
import { useState } from "react";
import Tags from "../AutoCompleteTags";
import { toast } from "react-hot-toast";

export function CreateRole() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAuthorities, setSelectedAuthorities] = useState<any[]>([]);
  const [error, setError] = useState("");

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

  const handleBlur = async () => {
    if (code.trim()) {
      try {
        // API call to check if the code exists in the database
        refetch();
        if (data?.flag) {
          setError("The code already exists.");
        } else {
          setError("");
        }
      } catch (error) {
        console.error("Error checking code existence:", error);
        setError("An error occurred. Please try again.");
      }
    }
  };

  const isFormValid = () => {
    return (
      name &&
      code &&
      description &&
      selectedAuthorities.length > 0 &&
      !data?.flag
    );
  };

  const [
    createRole,
    {
      isLoading: loading,
      isError: creationIsError,
      error: creationError,
      data: result,
    },
  ] = useCreateRoleMutation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Prepare the form data to submit
    const formData = {
      name,
      code,
      description,
      authorities: selectedAuthorities,
    };

    try {
      // Trigger the createRole mutation
      const response = await createRole(formData).unwrap(); // Use unwrap to handle the result directly
      toast.success(response.message);
    } catch (err: any) {
      toast.error(err.data.message);
      console.error("Error creating role:", err.data.Message);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Create Role</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Create Role</DialogTitle>
          <DialogDescription className="">
            To Create a new Role please fill the below data and click on save
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-9">
            <div className="grid grid-cols-8 items-center gap-4">
              <Label className="text-center">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-7"
              />
              <Label className="text-center">Code</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onBlur={handleBlur} // Trigger check when field loses focus
                className="col-span-7"
              />
              {/* Error Message Below Code Field */}
              <div className="col-span-8 flex justify-center">
                {error && <div className="text-red-500 text-sm">{error}</div>}
              </div>
              <Label className="text-center">Description</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-7 shadow border"
              />
              <Label className="text-right mt-3">Authorities</Label>
              <Tags
                setSelectedAuthorities={setSelectedAuthorities}
                overrideFlag={true}
                label="Authorities"
              />
            </div>
          </div>

          <DialogFooter>
            <button
              type="submit"
              className={`flex w-200px mt-4 justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm 
            hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus-offset-2 ${
              !isFormValid() || isLoading ? "cursor-not-allowed opacity-50" : ""
            }`}
              disabled={!isFormValid() || isLoading}
            >
              {loading ? "Creating..." : "Create Role"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
