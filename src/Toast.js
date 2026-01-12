import React, { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, XCircle, Info, X } from "lucide-react";

// مكون Toast مفردة
const Toast = ({ id, type, message, duration = 4000, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => onClose(id), duration);
        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    const getIcon = () => {
        const icons = {
            success: <CheckCircle size={20} />,
            error: <XCircle size={20} />,
            warning: <AlertCircle size={20} />,
            info: <Info size={20} />,
        };
        return icons[type] || icons.info;
    };

    const getStyles = () => {
        const baseStyles = {
            padding: "15px",
            borderRadius: "6px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            animation: "slideInDown 0.3s ease-out",
            direction: "rtl",
            maxWidth: "400px",
        };

        const typeStyles = {
            success: { background: "#dcfce7", color: "#166534", borderLeft: "4px solid #22c55e" },
            error: { background: "#fee2e2", color: "#991b1b", borderLeft: "4px solid #ef4444" },
            warning: { background: "#fef3c7", color: "#92400e", borderLeft: "4px solid #f59e0b" },
            info: { background: "#dbeafe", color: "#0c4a6e", borderLeft: "4px solid #3b82f6" },
        };

        return { ...baseStyles, ...typeStyles[type] };
    };

    return (
        <div style={getStyles()}>
            <span style={{ fontSize: "1.2rem", flex: "0 0 auto" }}>{getIcon()}</span>
            <span style={{ flex: 1, fontSize: "0.95rem" }}>{message}</span>
            <button
                onClick={() => onClose(id)}
                style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <X size={16} />
            </button>
        </div>
    );
};

// مكون محتوي Toast (Container)
export const ToastContainer = ({ toasts, onClose }) => {
    return (
        <div
            style={{
                position: "fixed",
                top: "80px",
                right: "20px",
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
            }}
        >
            {toasts.map((toast) => (
                <Toast key={toast.id} {...toast} onClose={onClose} />
            ))}
            <style>{`
        @keyframes slideInDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
        </div>
    );
};

// إنشاء hook لإدارة Toast
export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = "info", duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type, duration }]);
        return id;
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return { toasts, addToast, removeToast };
};
