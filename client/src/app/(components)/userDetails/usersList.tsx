import { getInitials } from "@/components/Sidebar/nav-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ApiResponse, useGetUsersListQuery } from "@/store/api";
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
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
  onSelectUser: (id: number) => void;
};

const UserList = ({ onSelectUser }: Props) => {
  const userEmail = useSearchParams().get("email");
  const { data, isLoading, error } = useGetUsersListQuery({
    email: userEmail!,
  },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const [searchQuery, setSearchQuery] = useState("");

  const filteredEmployees =
    data && Array.isArray(data)
      ? data.filter((employee) =>
          employee.username.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];
      return (
        <Paper className="p-2 h-[calc(100%-2rem)] flex flex-col justify-start items-center">
          <Box className="flex-1 bg-white rounded-2xl flex flex-col w-full max-h-full">
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
                maxHeight: "calc(100vh - 11rem)", // Adjusting for 10 users, each approximately 60px in height
              }}
            >
              <List>
                {filteredEmployees.map((employee) => (
                  <React.Fragment key={employee.userId}>
                    <button onClick={() => onSelectUser(employee.userId)}>
                      <ListItem
                        className="flex items-center justify-between gap-2 cursor-pointer"
                        style={{ height: '60px' }} // Explicitly setting the height of each list item
                      >
                        <Box className="flex items-center gap-2">
                          <Avatar className="h-[50px] w-[50px] rounded-full justify-center items-center">
                            <AvatarImage
                              className="object-cover w-full h-full rounded-full"
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
