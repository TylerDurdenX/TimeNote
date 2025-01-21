import { ChartContainer } from "@/components/ui/chart";
import {
  Avatar,
  Box,
  Divider,
  Grid2,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

// Define the structure of each user in the list
interface User {
  id: number;
  name: string;
  pictureUrl: string; // URL to the user's profile picture
  isOnline: boolean; // Whether the user is online or offline
}

interface UserListProps {
  users: User[]; // Array of users to be passed as a prop
}

type Props = {
  onSelectUser: ( id: number) => void
}

const employeesData = [
  {
    id: 1,
    name: "Alice Johnson",
    role: "Software Engineer",
    productivity: 95,
    isActive: true,
    avatar: "https://via.placeholder.com/50",
  },
  {
    id: 2,
    name: "Bob Smith",
    role: "Project Manager",
    productivity: 88,
    isActive: true,
    avatar: "https://via.placeholder.com/50",
  },
  {
    id: 3,
    name: "Carol Lee",
    role: "UX Designer",
    productivity: 80,
    isActive: true,
    avatar: "https://via.placeholder.com/50",
  },
  {
    id: 4,
    name: "David Brown",
    role: "QA Analyst",
    productivity: 72,
    isActive: false,
    avatar: "https://via.placeholder.com/50",
  },
  {
    id: 5,
    name: "Eva White",
    role: "Business Analyst",
    productivity: 85,
    isActive: true,
    avatar: "https://via.placeholder.com/50",
  },
  {
    id: 6,
    name: "Frank Adams",
    role: "DevOps Engineer",
    productivity: 92,
    isActive: true,
    avatar: "https://via.placeholder.com/50",
  },
  {
    id: 7,
    name: "Grace Parker",
    role: "Product Owner",
    productivity: 90,
    isActive: false,
    avatar: "https://via.placeholder.com/50",
  },
  {
    id: 8,
    name: "Johnson",
    role: "Software Engineer",
    productivity: 95,
    isActive: true,
    avatar: "https://via.placeholder.com/50",
  },
  {
    id: 9,
    name: "Smith",
    role: "Project Manager",
    productivity: 88,
    isActive: false,
    avatar: "https://via.placeholder.com/50",
  },
  {
    id: 10,
    name: "Lee",
    role: "UX Designer",
    productivity: 80,
    isActive: true,
    avatar: "https://via.placeholder.com/50",
  },
  {
    id: 11,
    name: "Brown",
    role: "QA Analyst",
    productivity: 72,
    isActive: false,
    avatar: "https://via.placeholder.com/50",
  },
  {
    id: 12,
    name: "White",
    role: "Business Analyst",
    productivity: 85,
    isActive: true,
    avatar: "https://via.placeholder.com/50",
  },
  {
    id: 13,
    name: "Adams",
    role: "DevOps Engineer",
    productivity: 92,
    isActive: true,
    avatar: "https://via.placeholder.com/50",
  },
];

const UserList = ({onSelectUser}: Props) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEmployees = employeesData.filter((employee) =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <Paper className="p-2 h-[calc(100%-2rem)] flex flex-col justify-start items-center">
      <Box className="flex-2 bg-white rounded-2xl flex flex-col w-full max-h-full w-full">
        <Typography variant="h6" gutterBottom>
          Employee List
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
              <React.Fragment key={employee.id}>
                <button onClick={() => onSelectUser(employee.id)}>
                <ListItem className="flex items-center justify-between gap-2 cursor-pointer">
                  <Box className="flex items-center gap-2">
                    <Avatar src={employee.avatar} />
                    <ListItemText
                      primary={employee.name}
                      secondary={employee.role}
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
