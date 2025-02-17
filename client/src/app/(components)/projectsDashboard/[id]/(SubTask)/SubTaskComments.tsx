'use client'

import {
  useAddSubTaskCommentMutation,
  useGetSubTaskCommentsQuery,
} from "@/store/api";
import React, { useState } from "react";
import { toast } from "sonner";

type Props = {
  email: string;
  subTaskId: number;
};

const SubTaskComment = ({ subTaskId, email }: Props) => {
  const [newComment, setNewComment] = useState("");

  const [createTask, { isLoading: isLoadingAddComment }] =
    useAddSubTaskCommentMutation();

  const { data, isLoading, error, refetch } = useGetSubTaskCommentsQuery(
    { subTaskId: subTaskId, email: email },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const handleRefetch = () => {
    refetch();
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
      const response = createTask(formData);
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
                  <span className="font-semibold text-lg">
                    {comment.username}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formattedCommentTime}
                  </span>
                </div>

                <p className="text-gray-800">{comment.text}</p>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-2 border rounded-md shadow-sm resize-none"
          placeholder="Add a comment..."
        ></textarea>
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
