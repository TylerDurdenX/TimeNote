"use client";

import CircularLoading from "@/components/Sidebar/loading";
import {
  useAddSubTaskCommentMutation,
  useGetMentionedUsersQuery,
  useGetSubTaskCommentsQuery,
} from "@/store/api";
import { MentionedUser } from "@/store/interfaces";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

type Props = {
  email: string;
  subTaskId: number;
};

const SubTaskComment = ({ subTaskId, email }: Props) => {
  const [newComment, setNewComment] = useState("");
  const [currentQuery, setCurrentQuery] = useState("");
  const [userSuggestions, setUserSuggestions] = useState<MentionedUser[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isUserSelected, setIsUserSelected] = useState(false);

  const { data: users, isLoading: loading } = useGetMentionedUsersQuery(
    { name: currentQuery },
    { skip: !currentQuery || isUserSelected }
  );

  const [addSubTaskComment, { isLoading: isLoadingAddComment }] =
    useAddSubTaskCommentMutation();

  const { data, isLoading, error, refetch } = useGetSubTaskCommentsQuery(
    { subTaskId: subTaskId, email: email },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const handleUserSelect = (user: MentionedUser) => {
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
    setUserSuggestions([]);
    setShowDropdown(false);
  };

  const handleBlur = () => {
    setIsUserSelected(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
  };

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

  return (
    <div className="w-full mx-auto p-4 bg-white overflow-y-auto rounded-lg shadow-lg">
      <div className="max-h-[55vw] overflow-y-auto space-y-4 dark:text-white">
        {data?.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-white">
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
              <div key={index} className="border-b pb-4 dark:border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-lg">
                    {comment.username}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-white">
                    {formattedCommentTime}
                  </span>
                </div>

                <p className="text-gray-800 dark:text-white">
                  {(() => {
                    const result = [];
                    let currentText = "";
                    let isInsideBrackets = false;
                    let mention = "";

                    for (let i = 0; i < comment.text.length; i++) {
                      const char = comment.text[i];

                      if (char === "[") {
                        if (currentText) {
                          result.push(currentText);
                        }
                        currentText = "";
                        isInsideBrackets = true;
                      } else if (char === "]" && isInsideBrackets) {
                        result.push(
                          <Link href={`/user?email=${email}`}>
                            <span
                              key={i}
                              className="dark:text-white text-blue"
                              style={{
                                cursor: "pointer",
                                textDecoration: "underline",
                              }}
                              onClick={(e) => {
                                const content = (
                                  e.target as HTMLElement
                                ).textContent?.slice(1, -1);
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
                  })()}
                </p>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4">
        <textarea
          value={newComment}
          //onChange={(e) => setNewComment(e.target.value)}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-full p-2 border rounded-md shadow-sm resize-none"
          placeholder="Add a comment..."
        ></textarea>
        {showDropdown && currentQuery && !loading && (
          <div
            className="left-0 bg-white border mt-1 rounded-md shadow-lg"
            style={{
              width: "100%",
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            <ul>
              {users?.length! > 0 ? (
                users?.map((user: MentionedUser) => (
                  <li
                    key={user.userId}
                    className="p-2 cursor-pointer hover:bg-gray-200"
                    onClick={() => handleUserSelect(user)}
                  >
                    {user.username}
                  </li>
                ))
              ) : (
                <li className="p-2 text-gray-500">No users available</li>
              )}
            </ul>
          </div>
        )}

        {loading && (
          <div>
            <CircularLoading />
          </div>
        )}

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

export default SubTaskComment;
