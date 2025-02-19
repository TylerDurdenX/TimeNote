import React from 'react';

// Sample data for demonstration
interface Activity {
  username: string;
  activity: string;
  timestamp: string;
}

const TaskActivity: React.FC = () => {
  // Sample data
  const activities: Activity[] = [
    { username: 'Shad Bhardwaj', activity: 'added a comment', timestamp: '2025-02-19 13:00' },
    { username: 'Mayank Bora', activity: 'uploaded an attachment', timestamp: '2025-02-19 13:10' },
    { username: 'Mayank Bora', activity: 'removed an attachment', timestamp: '2025-02-19 13:20' },
    { username: 'Ashit Karn', activity: 'moved the task to WIP', timestamp: '2025-02-19 13:25' },
    { username: 'Ashit Karn', activity: 'Marked the task in progress', timestamp: '2025-02-19 13:30' },

  ];

  const handleUserClick = (username: string) => {
    alert(`You clicked on ${username}'s profile!`);
    // Here you can redirect to a user profile page, e.g.:
    // window.location.href = `/profile/${username}`;
  };

  return (
    <div className="task-activity">
      <h1>Task Activity</h1>
      <div className="activity-list">
        {activities.map((activity, index) => (
          <div key={index} className="activity-item border-b pb-4 flex justify-between items-center">
            <div className="left-content ">
            <a
                href="#"
                className="text-blue-500 underline hover:text-blue-700 cursor-pointer"
                onClick={() => handleUserClick(activity.username)} // Click handler for the username
              >
                [{activity.username}]
              </a>
              <span className="activity ml-2">{activity.activity}</span> {/* Activity description */}
            </div>
            <div className="right-content">
              <span className="timestamp">{activity.timestamp}</span> {/* Timestamp on the extreme right */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskActivity;
