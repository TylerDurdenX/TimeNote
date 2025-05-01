"use client";

import React, { useEffect, useRef, useState } from "react";
import { Calendar, momentLocalizer, View } from "react-big-calendar";
import moment from "moment";
// import "react-big-calendar/lib/css/react-big-calendar.css";
import { Label } from "@/components/ui/label";
import { SlotInfo } from "react-big-calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Checkbox, FormControlLabel } from "@mui/material";
import { useCreateLeaveMutation, useGetLeaveDataQuery } from "@/store/api";

type Props = {
  email: string;
};

type Result = {
  title: string;
  description: string;
  approvalStatus: string;
  date: string;
  year: string;
  username: string;
  userId: number;
};
// Set up localizer
const localizer = momentLocalizer(moment);

const LeaveCalendar = ({ email }: Props) => {
  const [currentView, setCurrentView] = useState<View>("month");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [checked, setChecked] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
    setToDate("");
  };

  const handleNavigate = (date: Date) => {
    setCurrentDate(date); // Update current date when navigating
  };

  const handleViewChange = (view: View) => {
    setCurrentView(view);
  };

  let resultList: Result[] = [];

  const { data } = useGetLeaveDataQuery(
    {
      email: email!,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  data?.map((leave) => {
    const Result = {
      title: leave.leaveType,
      description: leave.description,
      date: leave.date,
      username: leave.username,
      userId: leave.userId,
      approvalStatus: leave.approvalStatus,
      year: leave.year,
    };
    resultList.push(Result);
  });

  const handleEventClick = (event: any) => {
    // Log the event that was clicked
    sessionStorage.setItem("taskId", event.id);
  };

  const isFormValid = () => {
    if (checked) {
      return title && fromDate && toDate;
    } else {
      return title;
    }
  };

  const eventPropGetter = (event: any) => {
    let backgroundColor = "#3f51b5"; // default blue
    let color = "#fff";

    if (event.approvalStatus === "YES") {
      // backgroundColor = "#4CAF50"; // green
      backgroundColor = "#3f51b5";
      color = "#fff";
    }
    if (event.approvalStatus === "NO") {
      // backgroundColor = "#FFEB3B"; // yelow
      backgroundColor = "#3f51b5";

      color = "#000000";
    }

    return {
      style: {
        backgroundColor,
        // backgroundColor: "#3f51b5", // Green background color
        borderRadius: "5px",
        padding: "5px 10px",
        color,
        fontWeight: "bold",
        fontSize: "14px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow
        transition: "background-color 0.3s ease", // Smooth transition on hover
      },
    };
  };

  const getStatusColors = (status: string) => {
    let bgColor, textColor, text;

    switch (status) {
      case "NO":
        bgColor = "#2563EB"; // Blue
        textColor = "#ffffff"; // White
        text = "Pending for approval";
        break;
      case "Approved":
        bgColor = "#059669"; // Green
        textColor = "#ffffff"; // White
        text = "Approved";
        break;
      default:
        bgColor = "#E5E7EB"; // Gray
        textColor = "#000000"; // Black
    }
    return { bgColor, textColor, text };
  };

  const handleDateClick = (slotInfo: SlotInfo) => {
    setSelectedDate(slotInfo.start);
    setIsDialogOpen(true);
  };

  const [saveLeave, { isLoading }] = useCreateLeaveMutation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const date = new Date();
    const midnightIST = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0,
      0,
      0
    );

    const formattedIST = midnightIST.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: false,
    });
    const formData = {
      title: title!,
      email: email!,
      description: description!,
      fromDate: fromDate!,
      toDate: toDate,
      date: formattedIST,
    };
    try {
      const response = await saveLeave(formData);
      if (
        // @ts-ignore
        response.error?.data.status === "Error" ||
        // @ts-ignore
        response.error?.data.status === "Fail"
      ) {
        // @ts-ignore
        toast.error(response.error?.data.message);
      } else {
        // @ts-ignore
        toast.success(response.data?.message);
      }
      setIsDialogOpen(false);
      setTitle("");
      setDescription("");
      setToDate("");
      setFromDate("");
    } catch (err: any) {
      toast.error(err.data.message);
      console.error("Error saving data:", err.data.Message);
    }
  };

  const CustomEvent = ({ event }: any) => {
    const [isHovered, setIsHovered] = useState(false);

    const [statusWidth, setStatusWidth] = useState(0);

    // Specify the type of the ref as HTMLSpanElement
    const statusRef = useRef<HTMLSpanElement>(null);

    type ApprovalStatus = "YES" | "rejected" | "NO" | "in_review";

    const statusMap: Record<ApprovalStatus, string> = {
      YES: "Approved ✅",
      rejected: "Rejected ❌",
      NO: "Pending ⏳",
      in_review: "In Review 🔍",
    };

    const displayStatus = (status: any) =>
      statusMap[status as ApprovalStatus] ?? "Unknown Status";

    useEffect(() => {
      // Ensure the ref is not null and then access its offsetWidth
      if (statusRef.current) {
        setStatusWidth(statusRef.current.offsetWidth);
      }
    }, [event.status]);

    const handleMouseEnter = () => {
      setIsHovered(true); // Set the hover state to true when mouse enters
    };

    const handleMouseLeave = () => {
      setIsHovered(false); // Set the hover state to false when mouse leaves
    };

    const { bgColor, textColor, text } = getStatusColors(event.approvalStatus);

    let href = "";
    // if (email !== event.assignee.email) {
    //   href = `/task/${sessionStorage.getItem("taskId")}?email=${email}`;
    // } else {
    //   href = `/projectsDashboard/${event.projectId}/${event.code}?email=${email}`;
    // }

    return (
      <Popover>
        <PopoverTrigger asChild>
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
              backgroundColor: isHovered ? "#9fa8da" : "#3f51b5", // Darker green on hover
              borderRadius: "5px",
              //padding: '5px 10px',
              color: "white",
              //fontWeight: 'bold',
              fontSize: "14px",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              transition: "background-color 0.3s ease",
            }}
            className="pl-2"
          >
            {event.title}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="justify-between items-center max-w-[15rem] overflow-hidden">
                  <h4 className="font-medium whitespace-nowrap overflow-ellipsis overflow-hidden">
                    Title :{event.title}
                  </h4>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Description :
                {event.description.split(" ").slice(0, 100).join(" ") +
                  (event.description.split(" ").length > 100 ? "..." : "")}
              </p>
              <p className="text-sm text-muted-foreground">
                User :{event.username}
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-5 items-center gap-4">
                <Label htmlFor="Status" className="col-span-2">
                  Status :
                </Label>
                <div className="w-full">
                  <span
                    id="Status"
                    className="inline-flex items-center rounded-full text-xs font-semibold leading-5 col-span-3"
                    style={{
                      backgroundColor: bgColor,
                      color: textColor,
                      paddingLeft: "8px",
                      paddingRight: "8px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {displayStatus(event.approvalStatus)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className="mt-5 ml-5 pr-6  h-[80vh]">
      <div className="overflow-y-auto">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl w-full">
            <DialogHeader>
              <DialogTitle>Apply Leave</DialogTitle>
            </DialogHeader>
            <div className="  h-full">
              <div className=" top-0 left-0  w-[calc(100%)]">
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-3">
                    <div className="grid grid-cols-8 items-center gap-4 mr-1">
                      <Label className="text-center col-span-1">
                        Title
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="col-span-7"
                      />
                      <Label className="text-center   ">Description</Label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="col-span-7 shadow border"
                      />
                      {checked ? (
                        <>
                          <Label className="text-center">From</Label>
                          <Input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="col-span-3"
                          />
                          <Label className="text-center">To</Label>
                          <Input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="col-span-3"
                          />
                        </>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checked}
                          onChange={handleChange}
                          name="terms"
                          color="primary"
                        />
                      }
                      label="Apply leave for multiple days"
                    />
                  </div>
                  {checked ? (
                    <p className="text-red-500">
                      Please apply separate leaves if the leave duration
                      contains any holiday. (e.g. Sunday)
                    </p>
                  ) : (
                    ""
                  )}

                  <DialogFooter>
                    <button
                      type="submit"
                      className={`flex w-200px mt-5 justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm 
                                            hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus-offset-2 ${
                                              !isFormValid() || isLoading
                                                ? "cursor-not-allowed opacity-50"
                                                : ""
                                            }`}
                      disabled={!isFormValid() || isLoading}
                    >
                      {isLoading ? "Saving..." : "Save Details"}
                    </button>
                  </DialogFooter>
                </form>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Calendar
        localizer={localizer}
        events={resultList}
        startAccessor="date"
        endAccessor="date"
        views={["month", "week", "day"]}
        selectable
        onSelectSlot={handleDateClick} // <-- Required
        onView={handleViewChange}
        view={currentView}
        onNavigate={handleNavigate}
        date={currentDate}
        onSelectEvent={handleEventClick}
        onShowMore={handleEventClick}
        eventPropGetter={eventPropGetter}
        components={{
          event: CustomEvent,
        }}
      />
    </div>
  );
};

export default LeaveCalendar;
