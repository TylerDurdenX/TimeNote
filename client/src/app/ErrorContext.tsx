"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";
import ErrorDialog from "./ErrorDialog";

// Create context type definition
interface ErrorContextType {
  triggerErrorDialog: (message: string) => void;
  closeErrorDialog: () => void;
}

// Default values for context
const defaultContextValues: ErrorContextType = {
  triggerErrorDialog: () => {},
  closeErrorDialog: () => {},
};

// Create the context
const ErrorContext = createContext<ErrorContextType>(defaultContextValues);

export const useErrorContext = () => {
  return useContext(ErrorContext);
};

// The ErrorProvider component that provides context to the app
interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const triggerErrorDialog = (message: string) => {
    setErrorMessage(message);
    setIsDialogOpen(true);
  };

  const closeErrorDialog = () => {
    setIsDialogOpen(false);
    setErrorMessage("");
  };

  return (
    <ErrorContext.Provider value={{ triggerErrorDialog, closeErrorDialog }}>
      {children}
      {isDialogOpen && (
        <ErrorDialog message={errorMessage} closeDialog={closeErrorDialog} />
      )}
    </ErrorContext.Provider>
  );
};
