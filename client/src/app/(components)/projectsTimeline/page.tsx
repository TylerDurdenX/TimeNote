"use client";

import React, { useMemo, useState } from "react";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { useSearchParams } from "next/navigation";
import { useGetProjectsQuery } from "@/store/api";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  LinearProgress,
  Fade,
  Grow,
  Button,
  ButtonGroup,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  Timeline as TimelineIcon,
  CalendarToday as CalendarIcon,
  DateRange as DateRangeIcon,
  ViewWeek as ViewWeekIcon,
  ViewDay as ViewDayIcon,
  Assessment as AssessmentIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";

type taskTypeItems = "task" | "milestone" | "project";

const ProjectsTimeline = () => {
  const isDarkMode = false; // Set to false for better aesthetic control

  const userEmail = useSearchParams().get("email");
  const {
    data: projects,
    isLoading,
    error,
    refetch,
  } = useGetProjectsQuery({ email: userEmail!, closedFlag: false });

  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-US",
  });

  // Color functions for better visual appeal - moved before usage
  const getProjectColor = (index: number, selected = false) => {
    const colors = [
      selected ? "#4338ca" : "#6366f1",
      selected ? "#059669" : "#10b981",
      selected ? "#dc2626" : "#ef4444",
      selected ? "#d97706" : "#f59e0b",
      selected ? "#7c3aed" : "#8b5cf6",
      selected ? "#0891b2" : "#06b6d4",
    ];
    return colors[index % colors.length];
  };

  const getProgressColor = (progress: number, selected = false) => {
    if (progress >= 80) return selected ? "#047857" : "#10b981";
    if (progress >= 50) return selected ? "#d97706" : "#f59e0b";
    return selected ? "#dc2626" : "#ef4444";
  };

  const getStatusColor = (progress: number) => {
    if (progress >= 90) return "success";
    if (progress >= 70) return "info";
    if (progress >= 40) return "warning";
    return "error";
  };

  const ganttProjects = useMemo(() => {
    if (!projects || projects.length === 0) {
      return [];
    }

    return projects
      .filter(
        (project) =>
          project != null &&
          project.startDate &&
          project.endDate &&
          project.name
      )
      .map((project, index) => ({
        start: project.startDate
          ? new Date(project.startDate as string)
          : new Date(),
        end: project.endDate ? new Date(project.endDate as string) : new Date(),
        name: project.name || "Untitled Project",
        id: `Task-${project.id}`,
        type: "project" as taskTypeItems,
        progress: project.completionStatus || 0,
        isDisabled: false,
        styles: {
          backgroundColor: getProjectColor(index),
          backgroundSelectedColor: getProjectColor(index, true),
          progressColor: getProgressColor(project.completionStatus || 0),
          progressSelectedColor: getProgressColor(
            project.completionStatus || 0,
            true
          ),
        },
      }));
  }, [projects]);

  const getTotalProgress = () => {
    if (!ganttProjects.length) return 0;
    return Math.round(
      ganttProjects.reduce((sum, project) => sum + project.progress, 0) /
        ganttProjects.length
    );
  };

  const getViewModeIcon = (mode: ViewMode) => {
    switch (mode) {
      case ViewMode.Day:
        return <ViewDayIcon />;
      case ViewMode.Week:
        return <ViewWeekIcon />;
      case ViewMode.Month:
        return <DateRangeIcon />;
      default:
        return <CalendarIcon />;
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 3,
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          Loading project timeline...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fetching your project data
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Card sx={{ m: 3, borderRadius: 4 }}>
        <CardContent>
          <Alert
            severity="error"
            sx={{
              borderRadius: 3,
              "& .MuiAlert-message": { fontWeight: 500 },
            }}
            action={
              <Button color="inherit" size="small" onClick={() => refetch()}>
                Try Again
              </Button>
            }
          >
            An error occurred while fetching project timeline data
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (ganttProjects.length === 0) {
    return (
      <Card
        sx={{
          m: 3,
          borderRadius: 4,
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          minHeight: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CardContent sx={{ textAlign: "center", py: 6 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: "auto",
              mb: 3,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            <TimelineIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            No Projects Available
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create your first project to see the timeline visualization
          </Typography>
          <Button
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: 3,
              px: 4,
              py: 1.5,
            }}
          >
            Create Project
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleViewModeChange = (newViewMode: ViewMode) => {
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: newViewMode,
    }));
  };

  return (
    <Box sx={{ p: { xs: 2, xl: 3 } }}>
      {/* Header Section */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 4,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Avatar
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                width: 56,
                height: 56,
              }}
            >
              <TimelineIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Project Timeline
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Track and visualize your project progress over time
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Controls Section */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 4,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Timeline View
              </Typography>
              <Chip
                label={`${ganttProjects.length} projects`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Tooltip title="Refresh Data">
                <IconButton onClick={() => refetch()}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>

              <ButtonGroup variant="outlined" sx={{ borderRadius: 3 }}>
                {[ViewMode.Day, ViewMode.Week, ViewMode.Month].map((mode) => (
                  <Button
                    key={mode}
                    onClick={() => handleViewModeChange(mode)}
                    variant={
                      displayOptions.viewMode === mode
                        ? "contained"
                        : "outlined"
                    }
                    startIcon={getViewModeIcon(mode)}
                    sx={{
                      textTransform: "capitalize",
                      ...(displayOptions.viewMode === mode && {
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      }),
                    }}
                  >
                    {mode}
                  </Button>
                ))}
              </ButtonGroup>
            </Box>
          </Box>

          {/* Project Status Overview */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Project Status Overview
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {ganttProjects.map((project, index) => (
                <Grow in={true} timeout={300 + index * 100} key={project.id}>
                  <Chip
                    label={`${project.name} (${project.progress}%)`}
                    color={getStatusColor(project.progress)}
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </Grow>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Gantt Chart Section */}
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
          overflow: "hidden",
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        }}
      >
        <Box
          sx={{
            background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            p: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <TimelineIcon />
          <Typography variant="h6" fontWeight={600}>
            Interactive Project Timeline
          </Typography>
        </Box>

        <CardContent sx={{ p: 0, backgroundColor: "white" }}>
          <Box
            sx={{
              "& .gantt-container": {
                fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
              },
              "& .gantt-table": {
                fontSize: "0.875rem",
              },
              "& .gantt-row-project": {
                backgroundColor: "#f8fafc !important",
              },
              "& .gantt-task-content": {
                fontSize: "0.75rem",
                fontWeight: 500,
              },
            }}
          >
            <Fade in={true} timeout={800}>
              <div className="timeline">
                <Gantt
                  tasks={ganttProjects}
                  {...displayOptions}
                  columnWidth={
                    displayOptions.viewMode === ViewMode.Month ? 200 : 150
                  }
                  listCellWidth="150px"
                  rowHeight={50}
                  barCornerRadius={8}
                  handleWidth={8}
                  fontSize="14px"
                  fontFamily="Roboto, Helvetica, Arial, sans-serif"
                />
              </div>
            </Fade>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProjectsTimeline;
