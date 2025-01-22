import { getInitials } from "@/components/Sidebar/nav-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetUsersListQuery } from "@/store/api";
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";

type Props = {
  onSelectUser: (id: number) => void;
};

const UserList = ({ onSelectUser }: Props) => {
  const userEmail = useSearchParams().get("email");
  const { data, isLoading, error } = useGetUsersListQuery({
    email: userEmail!,
  });

  const [searchQuery, setSearchQuery] = useState("");

  const filteredEmployees =
    data && Array.isArray(data)
      ? data.filter((employee) =>
          employee.username.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];
  return (
    <Paper className="p-2 h-[calc(100%-2rem)] flex flex-col justify-start items-center">
      <Box className="flex-2 bg-white rounded-2xl flex flex-col w-full max-h-full w-full">
        <Typography variant="h6" gutterBottom>
          Users List
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search employees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-2"
        />
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            maxHeight: "500px",
          }}
        >
          <List>
            {filteredEmployees.map((employee) => (
              <React.Fragment key={employee.userId}>
                <button onClick={() => onSelectUser(employee.userId)}>
                  <ListItem className="flex items-center justify-between gap-2 cursor-pointer">
                    <Box className="flex items-center gap-2">
                      <Avatar className="h-[50px] w-[50px] rounded-full justify-center items-center">
                        <AvatarImage className="object-cover w-full h-full rounded-full"
                          src={
                            employee.profilePicture
                              ? employee.profilePicture.base64
                              : ""
                          }
                          alt={employee.username}
                        />
                        <AvatarFallback className="absolute inset-0 flex justify-center items-center text-[150%]">
                          {getInitials(employee.username!)}
                        </AvatarFallback>
                      </Avatar>
                      <ListItemText
                        primary={employee.username}
                        secondary={employee.designation}
                      />
                    </Box>
                    {/* <Box className="flex flex-col items-center justify-start gap-2 w-[40px] text-center right-0">
                    <Box
                      className={`w-4 h-4 rounded-full border-2 ${
                        employee.isActive ? "bg-green-500" : "bg-gray-500"
                      } border-white`}
                    />
                    <Typography
                      variant="caption"
                      className={`text-${
                        employee.isActive ? "green" : "gray"
                      }-500 text-xs capitalize ml-auto`}
                    >
                      {employee.isActive ? "active" : "inactive"}
                    </Typography>
                  </Box> */}
                  </ListItem>
                </button>
                <Divider />
              </React.Fragment>
            ))}
          </List>
          {filteredEmployees.length === 0 && (
            <Typography
              variant="body1"
              color="textSecondary"
              className="text-center mt-2"
            >
              No employees found.
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default UserList;
