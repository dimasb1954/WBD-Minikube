// Enum for alert types
export enum AlertEnum {
    Error = "error",
    Success = "success",
    Info = "info",
}

interface ErrorAlertProps {
    message: string;
    type: AlertEnum; // Error red, success green, info blue
    duration?: number;
    onClose?: () => void;
}

export default ErrorAlertProps;