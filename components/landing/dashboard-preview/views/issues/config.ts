import {
  IoCamera,
  IoMic,
  IoVideocam,
  IoCloudUpload,
} from "react-icons/io5";
import type { StatusConfig, PriorityConfig, InputMethod } from "./types";

export const statusConfig: Record<string, StatusConfig> = {
  open: { label: "Open", color: "bg-blue-100 text-blue-600", dotColor: "bg-blue-500" },
  investigating: { label: "Investigating", color: "bg-amber-500/20 text-amber-400", dotColor: "bg-amber-500" },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-600", dotColor: "bg-blue-500" },
  completed: { label: "Completed", color: "bg-blue-100 text-blue-600", dotColor: "bg-blue-500" },
};

export const priorityConfig: Record<string, PriorityConfig> = {
  low: { label: "Low", color: "text-gray-500" },
  medium: { label: "Medium", color: "text-amber-400" },
  high: { label: "High", color: "text-red-400" },
};

export const INPUT_METHODS: InputMethod[] = [
  { id: "photo", icon: IoCamera, label: "Take a Photo", description: "Snap a picture of the issue" },
  { id: "voice", icon: IoMic, label: "Voice Note", description: "Describe the problem verbally" },
  { id: "video", icon: IoVideocam, label: "Record Video", description: "Show the issue in motion" },
  { id: "upload", icon: IoCloudUpload, label: "Upload File", description: "Add existing photos or videos" },
];
