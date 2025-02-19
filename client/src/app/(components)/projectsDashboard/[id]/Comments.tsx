'use client'

import { useAddCommentMutation, useGetMentionedUsersQuery, useGetTaskCommentsQuery } from "@/store/api";
import { MentionedUser } from "@/store/interfaces";
import React, { useState } from "react";
import { toast } from "sonner";

type Props = {
  email: string;
  taskId: number;
};

const Comments = ({ taskId, email }: Props) => {

  const [newComment, setNewComment] = useState("");
  const [currentQuery, setCurrentQuery] = useState('');
  const [userSuggestions, setUserSuggestions] = useState<MentionedUser[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isUserSelected, setIsUserSelected] = useState(false);

  // Use RTK query to fetch users based on `currentQuery`
  const { data: users, isLoading: loading } = useGetMentionedUsersQuery(
    { name: currentQuery },
    { skip: !currentQuery || isUserSelected} // Only fetch if `currentQuery` is not empty
  );

  // Handle input change in the textarea
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewComment(value);

    // Find the last '@' symbol and extract the text after it
    const atIndex = value.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const searchText = value.slice(atIndex + 1).trim(); // Extract text after '@'
      
      if (searchText.length > 0 && !isUserSelected) {
        setCurrentQuery(searchText); // Update the query to trigger fetching
        setShowDropdown(true); // Show the dropdown when there's a search query
      } else {
        setCurrentQuery(''); // If empty text after '@', reset currentQuery
        setShowDropdown(false); // Hide dropdown if no search text
      }
    } else {
      setCurrentQuery(''); // Clear query if '@' is not found
      setShowDropdown(false); // Hide dropdown if no '@'
    }
  };

  const handleUserSelect = (user: MentionedUser) => {
    const atIndex = newComment.lastIndexOf('@'); // Get index of last '@'
    
    if (atIndex !== -1) {
      const beforeAt = newComment.slice(0, atIndex); // Everything before the last '@'
      const afterAt = newComment.slice(atIndex); // Everything after the last '@'
      
      // Replace the portion after the last '@' with the selected username in brackets
      const newCommentValue = `${beforeAt}[${user.username}] ${afterAt.slice(user.username.length + 1)}`;
      
      setNewComment(newCommentValue); // Update comment with selected user
    }
  
    setIsUserSelected(false); // Mark that a user has been selected
    setUserSuggestions([]); // Clear suggestions
    setShowDropdown(false); // Close dropdown
  };
  

  // Reset isUserSelected flag when user changes the comment
  const handleBlur = () => {
    setIsUserSelected(false);
  };

  const [addComment, { isLoading: isLoadingAddComment }] =
    useAddCommentMutation();

  const { data, isLoading, error, refetch } = useGetTaskCommentsQuery(
    { taskId: taskId, email: email },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const handleAddComment = async (event: React.FormEvent) => {
    event.preventDefault();
    const currentDateTime = new Date();

    currentDateTime.setHours(currentDateTime.getHours() + 5);
    currentDateTime.setMinutes(currentDateTime.getMinutes() + 30);
    const indianTimeISOString = currentDateTime.toISOString();
    const formData = {
      text: newComment,
      taskId: taskId,
      userEmail: email,
      commentTime: indianTimeISOString,
    };
    try {
      const response = addComment(formData);
      toast.success("Comment added Successfully");
      setNewComment("");
    } catch (err: any) {
      toast.error(err.data.message);
      console.error("Error creating role:", err.data.Message);
    }
  };

  return (
    <div className="w-full mx-auto p-4 bg-white overflow-y-auto rounded-lg shadow-lg">
      <div className="max-h-[55vw] overflow-y-auto space-y-4">
        {data?.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>No comments yet</p>
          </div>
        ) : (
          data?.map((comment, index) => {
            const commentDate = new Date(comment.commentTime);
            const formattedDate = commentDate.toISOString().split("T")[0];
            const formattedTime = commentDate
              .toISOString()
              .split("T")[1]
              .slice(0, 5);
            const formattedCommentTime = `${formattedDate} ${formattedTime}`;

            return (
              <div key={index} className="border-b pb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-lg">{comment.username}</span>
                  <span className="text-sm text-gray-500">{formattedCommentTime}</span>
                </div>
            
                <p className="text-gray-800">
  {(() => {
    const result = [];
    let currentText = '';
    let isInsideBrackets = false;
    let mention = '';

    for (let i = 0; i < comment.text.length; i++) {
      const char = comment.text[i];

      // Check if we're inside brackets
      if (char === '[') {
        if (currentText) {
          result.push(currentText); // Push any text before the mention
        }
        currentText = ''; // Reset for the mention text inside brackets
        isInsideBrackets = true; // We are inside a mention
      } else if (char === ']' && isInsideBrackets) {
        // When we reach the closing bracket, add the mention
        result.push(
          <span
            key={i}
            style={{
              color: 'blue', // Highlight text inside brackets
              cursor: 'pointer',
              textDecoration: 'underline', // Optional: underline for better UX
            }}
            onClick={() => alert(`You clicked on ${mention}`)} // Handle click
          >
            [{mention}]
          </span>
        );
        mention = ''; // Clear the mention after it's been added
        isInsideBrackets = false; // Exit the mention mode
      } else if (isInsideBrackets) {
        mention += char; // Collect characters inside the brackets
      } else {
        currentText += char; // Collect regular text outside brackets
      }
    }

    if (currentText) {
      result.push(currentText); // Push remaining text after the last mention
    }

    return result;
  })()}
</p>

              </div>
            );
            
          })
        )}
      </div>
      <div className="mt-4">
      <div>
      {/* Your Textarea */}
      <textarea
        value={newComment}
        onChange={handleChange}
        onBlur={handleBlur}
        className="w-full p-2 border rounded-md shadow-sm resize-none"
        placeholder="Add a comment..."
      />

      {/* Dropdown with filtered users */}
      {showDropdown && currentQuery && !loading && (
        <div
          className="left-0 bg-white border mt-1 rounded-md shadow-lg"
          style={{
            width: '100%',
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          <ul>
            {/* Render users */}
            {users?.length! > 0 ? (
              users?.map((user: MentionedUser) => (
                <li
                  key={user.userId}
                  className="p-2 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleUserSelect(user)} // Select user when clicked
                >
                  {user.username}
                </li>
              ))
            ) : (
              <li className="p-2 text-gray-500">No users available</li> // Show message if no users found
            )}
          </ul>
        </div>
      )}

      {loading && <div>Loading...</div>}
    </div>
        <button
          onClick={handleAddComment}
          className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-500"
        >
          Add Comment
        </button>
      </div>
    </div>
  );
};

export default Comments;
