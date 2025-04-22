"use client";

import React, { useEffect, useRef, useState } from "react";
import { Calendar, momentLocalizer, View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGetProjectTasksCalendarQuery } from "@/store/api";
import { Maximize2 } from "lucide-react";
import { Assignee } from "@/store/interfaces";
import Link from "next/link";

type Props = {
  projectId: string;
  sprint: string;
  assignedTo: string;
  priority: string;
  isTaskOrSubTask: string;
  email: string;
};

type Result = {
  startDate: Date;
  dueDate: Date;
  title: string;
  description: string;
  status: string;
  priority: string;
  points: number;
  code: string;
  assignee: Assignee;
};
// Set up localizer
const localizer = momentLocalizer(moment);

const MyCalendar = ({
  projectId,
  sprint,
  assignedTo,
  priority,
  isTaskOrSubTask,
  email,
}: Props) => {
  const [currentView, setCurrentView] = useState<View>("month");

  const [currentDate, setCurrentDate] = useState(new Date());

  const handleNavigate = (date: Date) => {
    setCurrentDate(date); // Update current date when navigating
  };

  const handleViewChange = (view: View) => {
    setCurrentView(view);
  };

  const { data } = useGetProjectTasksCalendarQuery(
    {
      projectId,
      sprint,
      assignedTo,
      priority,
      isTaskOrSubTask,
      email: email!,
      page: 1,
      limit: 9999999999,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  let resultList: Result[] = [];

  data?.map((task) => {
    const Result = {
      startDate: new Date(new Date(task.startDate).setHours(9, 0, 0, 0)),
      dueDate: new Date(new Date(task.dueDate).setHours(18, 0, 0, 0)),
      title: task.title,
      description: task.description,
      points: task.points,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      projectId: task.projectId,
      code: task.code,
      id: task.id,
    };
    resultList.push(Result);
  });

  const handleEventClick = (event: any) => {
    // Log the event that was clicked
    sessionStorage.setItem("taskId", event.id);
  };

  const eventPropGetter = (event: any) => {
    return {
      style: {
        backgroundColor: "#3f51b5", // Green background color
        borderRadius: "5px",
        padding: "5px 10px",
        color: "white",
        fontWeight: "bold",
        fontSize: "14px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow
        transition: "background-color 0.3s ease", // Smooth transition on hover
      },
    };
  };

  const getStatusColors = (status: string) => {
    let bgColor, textColor;

    switch (status) {
      case "To Do":
        bgColor = "#2563EB"; // Blue
        textColor = "#ffffff"; // White
        break;
      case "Work In Progress":
        bgColor = "#059669"; // Green
        textColor = "#ffffff"; // White
        break;
      case "Under Review":
        bgColor = "#D97706"; // Orange
        textColor = "#ffffff"; // White
        break;
      case "Completed":
        bgColor = "#000000"; // Black
        textColor = "#ffffff"; // White
        break;
      default:
        bgColor = "#E5E7EB"; // Gray
        textColor = "#000000"; // Black
    }

    return { bgColor, textColor };
  };

  const CustomEvent = ({ event }: any) => {
    const [isHovered, setIsHovered] = useState(false);

    const [statusWidth, setStatusWidth] = useState(0);

    // Specify the type of the ref as HTMLSpanElement
    const statusRef = useRef<HTMLSpanElement>(null);

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

    const { bgColor, textColor } = getStatusColors(event.status);

    let href = "";
    if (email !== event.assignee.email) {
      href = `/task/${sessionStorage.getItem("taskId")}?email=${email}`;
    } else {
      href = `/projectsDashboard/${event.projectId}/${event.code}?email=${email}`;
    }

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
                    {event.title}
                  </h4>
                </div>

                <Link href={href}>
                  <Maximize2 className="ml-3 cursor-pointer mt-0" />
                </Link>
              </div>

              <p className="text-sm text-muted-foreground">
                {event.description.split(" ").slice(0, 100).join(" ") +
                  (event.description.split(" ").length > 100 ? "..." : "")}
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-5 items-center gap-4">
                <Label htmlFor="Status" className="col-span-2">
                  Status
                </Label>
                <div className="w-full">
                  <span
                    id="Status"
                    className="inline-flex items-center rounded-full text-xs font-semibold leading-5 col-span-3"
                    style={{
                      backgroundColor: bgColor,
                      color: textColor,
                      paddingLeft: "8px", // Optional: Adjust padding for space between text and border
                      paddingRight: "8px", // Optional: Adjust padding for space between text and border
                      whiteSpace: "nowrap", // Prevent wrapping of text
                    }}
                  >
                    {event.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-5 items-center gap-4">
                <Label htmlFor="maxWidth" className="col-span-2">
                  Assignee
                </Label>
                <Label
                  htmlFor="maxWidth"
                  className="col-span-3 h-5 items-center justify-center mt-2"
                >
                  {event.assignee.username}
                </Label>
              </div>
              <div className="grid grid-cols-5 items-center gap-4">
                <Label htmlFor="height" className="col-span-2">
                  Estimated Hours
                </Label>
                <Label
                  htmlFor="maxWidth"
                  className="col-span-3 h-4 items-center justify-center mt-1"
                >
                  {event.points}
                </Label>
              </div>
              <div className="grid grid-cols-5 items-center gap-2">
                <Label htmlFor="maxHeight" className="col-span-2">
                  Priority
                </Label>
                <Label
                  htmlFor="maxWidth"
                  className="col-span-3 h-4 items-center justify-center mt-1"
                >
                  {event.priority}
                </Label>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div
      style={{ height: "80vh", width: "100%" }}
      className="mt-5 ml-5 pr-6 w-screen"
    >
      <Calendar
        localizer={localizer}
        events={resultList}
        startAccessor="startDate"
        endAccessor="dueDate"
        style={{ height: "100%" }}
        views={["month", "week", "day"]}
        onView={handleViewChange}
        view={currentView}
        onNavigate={handleNavigate}
        date={currentDate}
        onSelectEvent={handleEventClick}
        onShowMore={handleEventClick}
        eventPropGetter={eventPropGetter}
        components={{
          event: CustomEvent, // Custom event rendering with hover effects
        }}
      />
    </div>
  );
};

export default MyCalendar;
