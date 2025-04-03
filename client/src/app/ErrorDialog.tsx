import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ErrorDialogProps {
  message: string;
  descriptionMessage?: string;
  closeDialog?: () => void;
  showAdditionalButton?: boolean; // Flag to conditionally render the additional button
  taskId?: string;
  onAdditionalButtonClick?: () => void; // Handler for the additional button click
}

const ErrorDialog = ({
  message,
  closeDialog,
  descriptionMessage,
  showAdditionalButton = false, // Default to false
  onAdditionalButtonClick,
}: ErrorDialogProps) => {
  return (
    <Dialog
      open={true}
      onOpenChange={(open) => open && closeDialog && closeDialog()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{message}</DialogTitle>
        </DialogHeader>

        {/* Conditionally render descriptionMessage if provided */}
        {descriptionMessage && (
          <DialogDescription>{descriptionMessage}</DialogDescription>
        )}

        <DialogFooter>
          <button className="btn mr-4" onClick={closeDialog}>
            Cancel
          </button>

          {/* Conditionally render the additional button if the flag is true */}
          {showAdditionalButton && onAdditionalButtonClick && (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-black-500 transition duration-200"
              onClick={onAdditionalButtonClick}
            >
              Proceed
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ErrorDialog;
