export interface ProcessingResultProps {
  success: boolean;
  message: string;
  onClose: () => void;
}

export interface UploadAreaProps {
  onFileSelected: (file: File) => void;
  accept: string;
  maxSize: number;
}

export interface ImportProgressProps {
  current: number;
  total: number;
  error?: string;
  onPauseToggle?: () => void;
  onCancel?: () => void;
  paused?: boolean;
}