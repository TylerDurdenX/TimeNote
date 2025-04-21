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
} from "@mui/material";
import { CircleCheck, CircleX, History } from "lucide-react";
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

  // const useScrollToBottom = (
  //   containerRef: React.RefObject<HTMLDivElement | null>,
  //   callback: () => void,
  //   isLoading: boolean,
  //   hasMore: boolean
  // ) => {
  //   useEffect(() => {
  //     const handleScroll = () => {
  //       if (!containerRef.current || isLoading || !hasMore) return;

  //       const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
  //       const isAtBottom = scrollTop + clientHeight >= scrollHeight - 70;

  //       if (isAtBottom) {
  //         callback();
  //       }
  //     };

  //     const container = containerRef.current;
  //     container?.addEventListener("scroll", handleScroll);

  //     return () => {
  //       container?.removeEventListener("scroll", handleScroll);
  //     };
  //   }, [containerRef, callback, isLoading, hasMore]);
  // };

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

  // useScrollToBottom(
  //   scrollContainerRef,
  //   () => {
  //     console.log("Fetching more users...");
  //     setPage((prev) => prev + 1);
  //   },
  //   isLoading,
  //   hasMore
  // );

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

        setHasMore(list.length === 15); // or however your API signals the end
      } else {
        setHasMore(false); // No more data
      }
    } else {
      setHasMore(false); // Invalid list or error
    }

    setLoading(false);
  }, [list]);

  const filteredEmployees =
    data && Array.isArray(data)
      ? searchQuery.length > 2
        ? data.filter((employee) =>
            employee.username.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : data // Return the original list when searchQuery is less than or equal to 3 characters
      : [];

  return (
    <Paper className="p-2 flex flex-col items-center h-full">
      {isLoading ? (
        <>
          <CircularLoading />
        </>
      ) : (
        <Box className="flex-1 bg-white rounded-2xl flex flex-col w-full">
          <Typography variant="h6" gutterBottom>
            Users List
          </Typography>
          <div className="relative mb-4 ">
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search employees (abc...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <i className="fas fa-search text-gray-500"></i>
                  </InputAdornment>
                ),
              }}
              sx={{
                borderRadius: "25px",
                padding: "10px 15px",
                backgroundColor: "#ffffff", // White background for search input
                "& .MuiOutlinedInput-root": {
                  borderRadius: "25px",
                  "& fieldset": {
                    borderColor: "#ccc",
                  },
                  "&:hover fieldset": {
                    borderColor: "#888",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#5c6bc0",
                  },
                },
              }}
            />
          </div>
          <Box
            ref={scrollContainerRef}
            sx={{
              flex: 1,
              overflowY: "auto",
              maxHeight: "calc(100vh - 11rem)", // Adjusting for 10 users, each approximately 60px in height
            }}
          >
            <List className="overflow-hidden">
              {filteredEmployees.map((employee) => (
                <React.Fragment key={employee.userId}>
                  <div className="relative">
                    <Link
                      href={`/userSettings/${employee.userId}?email=${userEmail}`}
                    >
                      <ListItem
                        className="flex items-center justify-between gap-2 cursor-pointer"
                        style={{ height: "60px" }}
                      >
                        <Box className="flex items-center gap-2">
                          <Avatar className="h-[50px] w-[50px] rounded-full justify-center items-center">
                            <AvatarImage
                              src={
                                employee.profilePicture
                                  ? employee.profilePicture.base64
                                  : ""
                              }
                              alt={employee.username}
                              loading="lazy"
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
                    </Link>
                    {employee.userStatus === "active" ? (
                      <>
                        <div className="absolute top-1/2 right-2 -translate-y-1/2 mr-5 group flex items-center cursor-pointer">
                          <span className="mr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            Active
                          </span>
                          <CircleCheck style={{ color: "green" }} />
                        </div>
                      </>
                    ) : (
                      ""
                    )}
                    {employee.userStatus === "inactive" ? (
                      <>
                        <div className="absolute top-1/2 right-2 -translate-y-1/2 mr-5 group flex items-center cursor-pointer">
                          <span className="mr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            On a Break
                          </span>
                          <History style={{ color: "orange" }} />
                        </div>
                      </>
                    ) : (
                      ""
                    )}
                    {employee.userStatus === null ||
                    employee.userStatus === "offline" ? (
                      <>
                        <div className="absolute top-1/2 right-2 -translate-y-1/2 mr-5 group flex items-center cursor-pointer">
                          <span className="mr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            Offline
                          </span>
                          <CircleX style={{ color: "black" }} />
                        </div>
                      </>
                    ) : (
                      ""
                    )}
                  </div>

                  <Divider />
                </React.Fragment>
              ))}
            </List>
            {filteredEmployees.length === 0 && (
              <Typography
                variant="body1"
                color="textSecondary"
                className="text-center mt-2 flex items-center justify-center"
              >
                No employees found.
              </Typography>
            )}
          </Box>
          {isLoading ? (
            <>
              <CircularLoading />
            </>
          ) : (
            ""
          )}
        </Box>
      )}
    </Paper>
  );
};

export default UserListHR;
