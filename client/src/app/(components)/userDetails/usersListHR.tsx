"use client";

import CircularLoading from "@/components/Sidebar/loading";
import { getInitials } from "@/components/Sidebar/nav-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetUsersListQuery } from "@/store/api";
import {
  Box,
  Button,
  Divider,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
  Chip,
  Fade,
  Skeleton,
} from "@mui/material";
import { CircleCheck, CircleX, History, Search, Users } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

type Props = {
  onSelectUser: (id: number) => void;
  activeFlag: boolean;
};

const UserListHR = ({ onSelectUser, activeFlag }: Props) => {
  const userEmail = useSearchParams().get("email");

  localStorage.removeItem("persist:root");
  localStorage.removeItem("ally-supports-cache");

  const [page, setPage] = useState(1);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParam, setSearchParam] = useState("");

  useEffect(() => {
    if (searchQuery.length > 2) {
      setSearchParam(searchQuery);
    }
  }, [searchQuery]);

  const {
    data: list,
    isLoading,
    error,
    refetch,
  } = useGetUsersListQuery(
    {
      email: userEmail!,
      page: page,
      limit: 999999,
      searchQuery: searchParam,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  useEffect(() => {
    if (list && Array.isArray(list)) {
      if (list.length > 0) {
        setData((prev) => {
          const existingIds = new Set(prev.map((user) => user.userId));
          const newItems = list.filter((user) => {
            const isNew = !existingIds.has(user.userId);
            return isNew;
          });
          return [...prev, ...newItems];
        });
        setHasMore(list.length === 15);
      } else {
        setHasMore(false);
      }
    } else {
      setHasMore(false);
    }
    setLoading(false);
  }, [list]);

  const filteredEmployees =
    data && Array.isArray(data)
      ? searchQuery.length > 2
        ? data.filter((employee) =>
            employee.username.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : data
      : [];

  const LoadingSkeleton = () => (
    <Box className="space-y-3">
      {[...Array(6)].map((_, index) => (
        <Box key={index} className="flex items-center gap-4 p-4">
          <Skeleton variant="circular" width={56} height={56} />
          <Box className="flex-1">
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
        </Box>
      ))}
    </Box>
  );

  if (isLoading) {
    return (
      <Paper
        elevation={0}
        className="p-6 flex flex-col h-full bg-gradient-to-br from-slate-50 to-white border border-slate-200"
        sx={{ borderRadius: "16px" }}
      >
        <Box className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <Typography variant="h5" className="font-semibold text-slate-800">
            Users Directory
          </Typography>
        </Box>
        <LoadingSkeleton />
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      className="p-6 flex flex-col h-full bg-gradient-to-br from-slate-50 to-white border border-slate-200"
      sx={{ borderRadius: "16px" }}
    >
      {/* Header Section */}
      <Box className="flex items-center justify-between mb-6">
        <Box className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <Typography variant="h5" className="font-semibold text-slate-800">
              Users Directory
            </Typography>
            <Typography variant="body2" className="text-slate-500">
              {filteredEmployees.length}{" "}
              {filteredEmployees.length === 1 ? "employee" : "employees"} found
            </Typography>
          </div>
        </Box>
        <Chip
          label={`${filteredEmployees.length} Total`}
          size="small"
          sx={{
            backgroundColor: "#f1f5f9",
            color: "#64748b",
            fontWeight: 500,
          }}
        />
      </Box>

      {/* Search Section */}
      <Box className="mb-6">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search employees by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search className="w-5 h-5 text-slate-400" />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              fontSize: "14px",
              transition: "all 0.2s ease-in-out",
              "& fieldset": {
                border: "none",
              },
              "&:hover": {
                borderColor: "#cbd5e1",
                boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
              },
              "&.Mui-focused": {
                borderColor: "#3b82f6",
                boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
              },
            },
            "& .MuiInputBase-input": {
              padding: "14px 16px",
            },
          }}
        />
      </Box>

      {/* Users List */}
      <Box
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
        sx={{
          maxHeight: "calc(100vh - 16rem)",
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f5f9",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#cbd5e1",
            borderRadius: "3px",
            "&:hover": {
              background: "#94a3b8",
            },
          },
        }}
      >
        <List className="space-y-2" disablePadding>
          {filteredEmployees.map((employee, index) => (
            <Fade in={true} timeout={300 + index * 50} key={employee.userId}>
              <Link
                href={`/userSettings/${employee.userId}?email=${userEmail}`}
                className="block"
              >
                <ListItem
                  className="group cursor-pointer transition-all duration-200 hover:bg-white hover:shadow-md rounded-xl border border-transparent hover:border-slate-200"
                  sx={{
                    padding: "16px",
                    marginBottom: "8px",
                    "&:hover": {
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <Box className="flex items-center gap-4 w-full">
                    <div className="relative">
                      <Avatar className="h-14 w-14 ring-2 ring-slate-100 group-hover:ring-blue-200 transition-all duration-200">
                        <AvatarImage
                          src={
                            employee.profilePicture
                              ? employee.profilePicture.base64
                              : ""
                          }
                          alt={employee.username}
                          loading="lazy"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                          {getInitials(employee.username!)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>

                    <Box className="flex-1 min-w-0">
                      <Typography
                        variant="subtitle1"
                        className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors duration-200 truncate"
                      >
                        {employee.username}
                      </Typography>
                      <Typography
                        variant="body2"
                        className="text-slate-500 truncate"
                      >
                        {employee.designation || "No designation"}
                      </Typography>
                    </Box>

                    <Box className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </Box>
                  </Box>
                </ListItem>
              </Link>
            </Fade>
          ))}
        </List>

        {/* Empty State */}
        {filteredEmployees.length === 0 && !isLoading && (
          <Box className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <Typography variant="h6" className="text-slate-600 mb-2">
              No employees found
            </Typography>
            <Typography variant="body2" className="text-slate-400 max-w-sm">
              {searchQuery
                ? `No results for "${searchQuery}". Try adjusting your search terms.`
                : "No employees are currently available in the directory."}
            </Typography>
            {searchQuery && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setSearchQuery("")}
                className="mt-4"
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  borderColor: "#e2e8f0",
                  color: "#64748b",
                  "&:hover": {
                    borderColor: "#cbd5e1",
                    backgroundColor: "#f8fafc",
                  },
                }}
              >
                Clear search
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default UserListHR;
