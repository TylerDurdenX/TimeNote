"use client";

import CircularLoading from "@/components/Sidebar/loading";
import {
  useAddCommentMutation,
  useAddSubTaskCommentMutation,
  useGetMentionedUsersQuery,
  useGetSubTaskCommentsQuery,
  useGetTaskCommentsQuery,
} from "@/store/api";
import { MentionedUser } from "@/store/interfaces";
import Link from "next/link";
import React, { useState, useCallback, useMemo } from "react";
import { Toaster, toast } from "react-hot-toast";
import { MessageCircle, Send, AtSign } from "lucide-react";

type Props = {
  email: string;
  subTaskId: number;
};

const SubTaskComments = ({ subTaskId, email }: Props) => {
  const [newComment, setNewComment] = useState("");
  const [currentQuery, setCurrentQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isUserSelected, setIsUserSelected] = useState(false);
  const [addSubTaskComment, { isLoading: isLoadingAddComment }] =
    useAddSubTaskCommentMutation();

  const { data: users, isLoading: loadingUsers } = useGetMentionedUsersQuery(
    { name: currentQuery },
    { skip: !currentQuery || isUserSelected }
  );

  const { data, isLoading, error, refetch } = useGetSubTaskCommentsQuery(
    { subTaskId: subTaskId, email: email },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  // Format date and time helper
  const formatCommentTime = useCallback((commentTime: string) => {
    const commentDate = new Date(commentTime);
    const formattedDate = commentDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const formattedTime = commentDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${formattedDate} ${formattedTime}`;
  }, []);

  // Handle textarea input changes and mention detection
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setNewComment(value);

      const atIndex = value.lastIndexOf("@");

      if (atIndex !== -1) {
        const searchText = value.slice(atIndex + 1).trim();

        if (searchText.length > 0 && !isUserSelected) {
          setCurrentQuery(searchText);
          setShowDropdown(true);
        } else {
          setCurrentQuery("");
          setShowDropdown(false);
        }
      } else {
        setCurrentQuery("");
        setShowDropdown(false);
      }
    },
    [isUserSelected]
  );

  // Handle user selection from dropdown
  const handleUserSelect = useCallback(
    (user: MentionedUser) => {
      const atIndex = newComment.lastIndexOf("@");

      if (atIndex !== -1) {
        const beforeAt = newComment.slice(0, atIndex);
        const afterAt = newComment.slice(atIndex);

        const newCommentValue = `${beforeAt}[${user.username}] ${afterAt.slice(
          user.username.length + 1
        )}`;

        setNewComment(newCommentValue);
      }

      setIsUserSelected(false);
      setShowDropdown(false);
    },
    [newComment]
  );

  const handleBlur = useCallback(() => {
    // Delay hiding dropdown to allow click events
    setTimeout(() => {
      setIsUserSelected(false);
      setShowDropdown(false);
    }, 150);
  }, []);

  // Handle comment submission
  const handleAddComment = async (event: React.FormEvent) => {
    event.preventDefault();
    const currentDateTime = new Date();
    currentDateTime.setHours(currentDateTime.getHours() + 5);
    currentDateTime.setMinutes(currentDateTime.getMinutes() + 30);
    const indianTimeISOString = currentDateTime.toISOString();
    const formData = {
      text: newComment,
      taskId: subTaskId,
      userEmail: email,
      commentTime: indianTimeISOString,
    };
    try {
      const response = addSubTaskComment(formData);
      toast.success("Comment added Successfully");
      setNewComment("");
    } catch (err: any) {
      toast.error(err.data.message);
      console.error("Error creating role:", err.data.Message);
    }
  };

  // Parse comment text and render mentions as links
  const parseCommentText = useCallback(
    (text: string) => {
      const result = [];
      let currentText = "";
      let isInsideBrackets = false;
      let mention = "";

      for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char === "[") {
          if (currentText) {
            result.push(currentText);
          }
          currentText = "";
          isInsideBrackets = true;
        } else if (char === "]" && isInsideBrackets) {
          result.push(
            <Link key={i} href={`/user?email=${email}`} className="inline">
              <span
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer underline font-medium transition-colors"
                onClick={(e) => {
                  const content = (e.target as HTMLElement).textContent?.slice(
                    1,
                    -1
                  );
                  if (content) {
                    sessionStorage.setItem("userName", content);
                  }
                }}
              >
                {`[${mention}]`}
              </span>
            </Link>
          );

          mention = "";
          isInsideBrackets = false;
        } else if (isInsideBrackets) {
          mention += char;
        } else {
          currentText += char;
        }
      }

      if (currentText) {
        result.push(currentText);
      }

      return result;
    },
    [email]
  );

  // User suggestions dropdown component
  const UserSuggestions = useMemo(() => {
    if (!showDropdown || !currentQuery || loadingUsers) return null;

    return (
      <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
        {users && users.length > 0 ? (
          <ul className="py-1">
            {users.map((user: MentionedUser) => (
              <li
                key={user.userId}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 transition-colors"
                onClick={() => handleUserSelect(user)}
              >
                <AtSign className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 dark:text-gray-100">
                  {user.username}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
            No users found
          </div>
        )}
      </div>
    );
  }, [showDropdown, currentQuery, loadingUsers, users, handleUserSelect]);

  if (isLoading) {
    return (
      <div className="w-full mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="flex items-center justify-center py-8">
          <CircularLoading />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Comments ({data?.length || 0})
          </h3>
        </div>
      </div>

      {/* Comments List */}
      <div className="px-6 py-4 max-h-96 overflow-y-auto space-y-4">
        {!data || data.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No comments yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Be the first to leave a comment
            </p>
          </div>
        ) : (
          data.map((comment, index) => (
            <div
              key={index}
              className="border-b border-gray-100 dark:border-gray-700 last:border-b-0 pb-4 last:pb-0"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {comment.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {comment.username}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatCommentTime(comment.commentTime)}
                </span>
              </div>

              <div className="ml-10 text-gray-800 dark:text-gray-200 leading-relaxed">
                {parseCommentText(comment.text)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
        <form onSubmit={handleAddComment} className="space-y-3">
          <div className="relative">
            <textarea
              value={newComment}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Add a comment... (use @ to mention users)"
              rows={3}
            />

            {UserSuggestions}

            {loadingUsers && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoadingAddComment || !newComment.trim()}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                isLoadingAddComment || !newComment.trim()
                  ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"
              }`}
            >
              {isLoadingAddComment ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Add Comment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubTaskComments;
