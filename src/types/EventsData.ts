export interface FilesEventData {
  // Timestamp of the operation in milliseconds
  timestamp: number;
  path: string;
  action: string;
  // Method of FilesDriverType
  method: string;
  // Size of the operation in bytes
  size?: number;
  // Additional details of the operation
  details?: Record<string, any>;
}
