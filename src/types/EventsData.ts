export interface FilesEventData {
  // Entity who do the operation
  entity: string
  // Timestamp of the operation in milliseconds
  timestamp: number
  path: string
  action: string
  // Method of FilesDriverType
  method: string
  // Size of the operation in bytes
  // It just for operations read, write and copy
  // It is doesn't include size of metadata
  size?: number
  // Additional details of the operation
  details?: Record<string, any>
}
