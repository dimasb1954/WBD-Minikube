import React, { useState, useEffect } from 'react';

interface ErrorAlertProps {
    message: string;
    type: string; // Error red, success green, info blue
    duration?: number;
    onClose?: () => void;
}

const alertIcons = {
    error: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-3 text-red-500"
        >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
    ),
    success: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-3 text-green-500"
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
    ),
    info: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-3 text-blue-500"
        >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
    )
};

const Alert: React.FC<ErrorAlertProps> = ({
                                                   message,
                                                   type = 'error',
                                                   duration = 3000,
                                                   onClose
                                               }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [animationStage, setAnimationStage] = useState<'enter' | 'stay' | 'exit'>('enter');

    useEffect(() => {
        // Start
        const enterTimer = setTimeout(() => {
            setAnimationStage('stay');
        }, 500); // Time for entering animation

        // Standby
        const stayTimer = setTimeout(() => {
            setAnimationStage('exit');
        }, duration);

        // End
        const exitTimer = setTimeout(() => {
            setIsVisible(false);
            onClose && onClose();
        }, duration + 500); // Allow exit animation time

        return () => {
            clearTimeout(enterTimer);
            clearTimeout(stayTimer);
            clearTimeout(exitTimer);
        };
    }, [duration, onClose]);

    if (!isVisible) return null;

    return (
        <div
            className={`
        fixed top-0 right-4 z-50 flex items-center ${type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 
                (type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-blue-100 border-blue-400 text-blue-700')}
        border px-4 py-3 rounded
        transition-all duration-500 ease-in-out
        ${animationStage === 'enter'
                ? '-translate-y-full'
                : animationStage === 'stay'
                    ? 'translate-y-[calc(30px)]'
                    : '-translate-y-full'
            }
        ${animationStage === 'exit' ? 'opacity-0' : 'opacity-100'}
      `}
            role="alert"
        >
            {type === 'error' ? alertIcons.error : (type === 'success' ? alertIcons.success : alertIcons.info)}
            <span className="block sm:inline">{message}</span>
            <button
                onClick={() => {
                    setAnimationStage('exit');
                    setTimeout(() => {
                        setIsVisible(false);
                        onClose && onClose();
                    }, 500);
                }}
                className="ml-4 text-red-700 hover:text-red-900"
            >
                &times;
            </button>
        </div>
    );
};

export default Alert;