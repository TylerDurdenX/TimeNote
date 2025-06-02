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
import { Maximize2, Clock, User, Flag, CheckSquare } from "lucide-react";
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
    setCurrentDate(date);
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
    sessionStorage.setItem("taskId", event.id);
  };

  const getStatusColors = (status: string) => {
    const colorMap = {
      "To Do": {
        bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        border: "#667eea",
        shadow: "rgba(102, 126, 234, 0.3)",
      },
      "Work In Progress": {
        bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        border: "#f093fb",
        shadow: "rgba(240, 147, 251, 0.3)",
      },
      "Under Review": {
        bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        border: "#4facfe",
        shadow: "rgba(79, 172, 254, 0.3)",
      },
      Completed: {
        bg: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        border: "#43e97b",
        shadow: "rgba(67, 233, 123, 0.3)",
      },
    };

    return (
      colorMap[status as keyof typeof colorMap] || {
        bg: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
        border: "#a8edea",
        shadow: "rgba(168, 237, 234, 0.3)",
      }
    );
  };

  const getPriorityIcon = (priority: string) => {
    const priorityMap = {
      High: { icon: "🔴", color: "#ef4444" },
      Medium: { icon: "🟡", color: "#f59e0b" },
      Low: { icon: "🟢", color: "#10b981" },
    };
    return (
      priorityMap[priority as keyof typeof priorityMap] || {
        icon: "⚪",
        color: "#6b7280",
      }
    );
  };

  const eventPropGetter = (event: any) => {
    const colors = getStatusColors(event.status);
    return {
      style: {
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        borderRadius: "12px",
        padding: "8px 12px",
        color: "white",
        fontWeight: "600",
        fontSize: "13px",
        boxShadow: `0 8px 25px ${colors.shadow}, 0 4px 10px rgba(0, 0, 0, 0.1)`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        backdropFilter: "blur(10px)",
        position: "relative",
        overflow: "hidden",
      },
    };
  };

  const CustomEvent = ({ event }: any) => {
    const [isHovered, setIsHovered] = useState(false);
    const colors = getStatusColors(event.status);
    const priorityInfo = getPriorityIcon(event.priority);

    const href =
      email !== event.assignee.email
        ? `/task/${sessionStorage.getItem("taskId")}?email=${email}`
        : `/projectsDashboard/${event.projectId}/${event.code}?email=${email}`;

    return (
      <Popover>
        <PopoverTrigger asChild>
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              background: isHovered
                ? `${colors.bg}, rgba(255, 255, 255, 0.1)`
                : colors.bg,
              borderRadius: "12px",
              color: "white",
              fontSize: "13px",
              fontWeight: "600",
              boxShadow: isHovered
                ? `0 12px 35px ${colors.shadow}, 0 6px 15px rgba(0, 0, 0, 0.15)`
                : `0 8px 25px ${colors.shadow}, 0 4px 10px rgba(0, 0, 0, 0.1)`,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: isHovered
                ? "translateY(-2px) scale(1.02)"
                : "translateY(0) scale(1)",
              backdropFilter: "blur(10px)",
              border: `2px solid ${colors.border}`,
            }}
            className="px-3 py-2 cursor-pointer relative overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs">{priorityInfo.icon}</span>
              <span className="truncate flex-1">{event.title}</span>
            </div>
            {/* Animated background gradient */}
            <div
              className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-300"
              style={{
                background:
                  "linear-gradient(45deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(255,255,255,0.3) 100%)",
                animation: isHovered
                  ? "shimmer 2s ease-in-out infinite"
                  : "none",
              }}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0 border-0 shadow-2xl bg-white/95 backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 mr-4">
                <h4 className="font-bold text-lg text-gray-800 leading-tight mb-2">
                  {event.title}
                </h4>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg"
                    style={{
                      background: colors.bg,
                      boxShadow: `0 4px 15px ${colors.shadow}`,
                    }}
                  >
                    {event.status}
                  </span>
                  <span
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${priorityInfo.color}20`,
                      color: priorityInfo.color,
                      border: `1px solid ${priorityInfo.color}40`,
                    }}
                  >
                    {priorityInfo.icon} {event.priority}
                  </span>
                </div>
              </div>
              <Link href={href}>
                <div className="p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 cursor-pointer group">
                  <Maximize2 className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
                </div>
              </Link>
            </div>

            <div className="bg-white/80 rounded-xl p-4 mb-4 backdrop-blur-sm border border-gray-100">
              <p className="text-sm text-gray-700 leading-relaxed">
                {event.description.split(" ").slice(0, 30).join(" ") +
                  (event.description.split(" ").length > 30 ? "..." : "")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/80 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-gray-500" />
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Assignee
                  </Label>
                </div>
                <p className="font-semibold text-gray-800">
                  {event.assignee.username}
                </p>
              </div>

              <div className="bg-white/80 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Est. Hours
                  </Label>
                </div>
                <p className="font-semibold text-gray-800">{event.points}h</p>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6 h-full">
      <div className="max-w-full mx-auto">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              Project Calendar
            </h1>
            <p className="text-blue-100">
              Manage your tasks and deadlines efficiently
            </p>
          </div> */}

          <div className="p-6">
            <div style={{ height: "75vh" }} className="calendar-container">
              <Calendar
                localizer={localizer}
                events={resultList}
                startAccessor="startDate"
                endAccessor="dueDate"
                style={{
                  height: "100%",
                  fontFamily: "'Inter', sans-serif",
                }}
                views={["month", "week", "day"]}
                onView={handleViewChange}
                view={currentView}
                onNavigate={handleNavigate}
                date={currentDate}
                onSelectEvent={handleEventClick}
                onShowMore={handleEventClick}
                // eventPropGetter={eventPropGetter}
                components={{
                  event: CustomEvent,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .rbc-calendar {
          border: none !important;
          border-radius: 16px !important;
          overflow: hidden !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }

        .rbc-header {
          background: linear-gradient(
            135deg,
            #667eea 0%,
            #764ba2 100%
          ) !important;
          color: white !important;
          font-weight: 600 !important;
          padding: 16px 8px !important;
          border: none !important;
          font-size: 14px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
        }

        .rbc-month-view,
        .rbc-time-view {
          border: none !important;
        }

        .rbc-date-cell {
          padding: 12px 8px !important;
          border-right: 1px solid #e5e7eb !important;
          border-bottom: 1px solid #e5e7eb !important;
          background: rgba(255, 255, 255, 0.8) !important;
          transition: background-color 0.2s ease !important;
        }

        .rbc-date-cell:hover {
          background: rgba(99, 102, 241, 0.05) !important;
        }

        .rbc-today {
          background: linear-gradient(
            135deg,
            rgba(99, 102, 241, 0.1) 0%,
            rgba(139, 92, 246, 0.1) 100%
          ) !important;
          border: 2px solid rgba(99, 102, 241, 0.3) !important;
        }

        .rbc-off-range-bg {
          background: rgba(0, 0, 0, 0.02) !important;
        }

        .rbc-toolbar {
          margin-bottom: 24px !important;
          padding: 20px !important;
          background: linear-gradient(
            135deg,
            #f8fafc 0%,
            #e2e8f0 100%
          ) !important;
          border-radius: 12px !important;
          border: 1px solid #e2e8f0 !important;
        }

        .rbc-toolbar button {
          background: white !important;
          border: 1px solid #d1d5db !important;
          color: #374151 !important;
          padding: 8px 16px !important;
          border-radius: 8px !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
        }

        .rbc-toolbar button:hover {
          background: #f3f4f6 !important;
          border-color: #9ca3af !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
        }

        .rbc-toolbar button.rbc-active {
          background: linear-gradient(
            135deg,
            #667eea 0%,
            #764ba2 100%
          ) !important;
          color: white !important;
          border-color: #667eea !important;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3) !important;
        }

        .rbc-month-row {
          border: none !important;
        }

        .rbc-day-bg {
          border-right: 1px solid #e5e7eb !important;
        }

        .rbc-event {
          border: none !important;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .calendar-container .rbc-calendar {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif !important;
        }

        .rbc-date-cell > a {
          color: #374151 !important;
          font-weight: 600 !important;
          font-size: 14px !important;
        }

        .rbc-date-cell.rbc-today > a {
          color: #667eea !important;
          font-weight: 700 !important;
        }
      `}</style>
    </div>
  );
};

export default MyCalendar;
