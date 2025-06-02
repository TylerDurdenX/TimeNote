import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import ReportsDialog from "./ReportsDialog";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  BarChart3,
  Clock,
  Users,
  ArrowRight,
  Download,
  Eye,
} from "lucide-react";

type Props = {};

function ReportsTable({}: Props) {
  const userEmail = useSearchParams().get("email");

  const reports = [
    {
      id: 2,
      title: "Timesheet Report",
      description:
        "Comprehensive timesheet analysis showing work hours, overtime, and productivity metrics",
      name: "Timesheet Report",
      icon: "clock",
      color: "from-blue-500 to-indigo-600",
      bgColor: "from-blue-50 to-indigo-50",
    },
    {
      id: 4,
      title: "Project Report",
      description:
        "Detailed project progress, milestones, resource allocation, and performance insights",
      name: "Project Report",
      icon: "chart",
      color: "from-purple-500 to-pink-600",
      bgColor: "from-purple-50 to-pink-50",
    },
  ];

  let attendancePage = `/reports/attendanceReport/generateReport?email=${userEmail}`;
  let timesheetPage = `/reports/timesheetReport/generateReport?email=${userEmail}`;
  let projectPage = `/reports/projectReport/generateReport?email=${userEmail}`;

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "users":
        return <Users size={24} />;
      case "clock":
        return <Clock size={24} />;
      case "chart":
        return <BarChart3 size={24} />;
      default:
        return <FileText size={24} />;
    }
  };

  const getReportLink = (title: string) => {
    switch (title) {
      case "Attendance Report":
        return attendancePage;
      case "Timesheet Report":
        return timesheetPage;
      case "Project Report":
        return projectPage;
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl p-8">
            <div className="flex items-center space-x-4 ">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">
                  Reports Dashboard
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  Generate and download comprehensive business reports
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Grid Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Available Reports
            </h2>
            <p className="text-gray-600">
              Select a report to generate or view detailed information
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {reports.map((report) => (
              <div
                key={report.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden transform hover:scale-105 transition-all duration-300"
              >
                {/* Card Header */}
                <div className={`h-2 bg-gradient-to-r ${report.color}`}></div>

                <div className="p-6">
                  {/* Icon and Title */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${report.bgColor} flex items-center justify-center shadow-md`}
                    >
                      <div
                        className={`text-transparent bg-clip-text bg-gradient-to-r ${report.color}`}
                      >
                        {getIcon(report.icon)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {report.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {report.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3 mt-6">
                    <Link href={getReportLink(report.title)} className="flex-1">
                      <button
                        className={`
                          group/btn w-full relative overflow-hidden bg-gradient-to-r ${report.color} 
                          text-white px-6 py-3 rounded-xl font-semibold
                          shadow-lg hover:shadow-xl transform transition-all duration-300 
                          hover:scale-105 hover:-translate-y-1
                          flex items-center justify-center space-x-2
                        `}
                        onClick={() => {
                          console.log("Generating report:", report.title);
                        }}
                      >
                        <Download size={18} />
                        <span>Generate Report</span>
                        <ArrowRight
                          size={18}
                          className="transition-transform group-hover/btn:translate-x-1"
                        />

                        {/* Shimmer effect */}
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-full transition-transform duration-700"></div>
                      </button>
                    </Link>

                    <Dialog>
                      <DialogTrigger asChild></DialogTrigger>
                      <DialogContent className="max-w-[65vw] mt-5 mb-5 overflow-y-auto">
                        <ReportsDialog name={report.name} email={userEmail!} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-3 text-sm text-gray-500 bg-white/60 backdrop-blur-sm px-8 py-4 rounded-full border border-white/40 shadow-lg">
            <span className="text-lg">📊</span>
            <span className="font-medium">
              Reports are generated in real-time with the latest data
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsTable;
