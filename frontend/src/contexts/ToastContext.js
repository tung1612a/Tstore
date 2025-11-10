import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, variant = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message,
      variant,
      duration,
    };
    setToasts((prev) => [...prev, newToast]);

    // Tự động xóa sau duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Helper functions
  const showSuccess = useCallback((message, duration) => {
    return showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message, duration) => {
    return showToast(message, 'danger', duration);
  }, [showToast]);

  const showWarning = useCallback((message, duration) => {
    return showToast(message, 'warning', duration);
  }, [showToast]);

  const showInfo = useCallback((message, duration) => {
    return showToast(message, 'info', duration);
  }, [showToast]);

  // Confirm dialog với toast
  const showConfirm = useCallback((message, onConfirm, onCancel) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message,
      variant: 'warning',
      duration: 0, // Không tự động đóng
      showConfirm: true,
      onConfirm: () => {
        removeToast(id);
        if (onConfirm) onConfirm();
      },
      onCancel: () => {
        removeToast(id);
        if (onCancel) onCancel();
      },
    };
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, [removeToast]);

  const value = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    removeToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            bg={toast.variant}
            onClose={() => removeToast(toast.id)}
            show={true}
            delay={toast.duration}
            autohide={toast.duration > 0}
            className="mb-2"
          >
            <Toast.Header>
              <strong className="me-auto">Thông báo</strong>
            </Toast.Header>
            <Toast.Body className="text-white">
              {toast.message}
              {toast.showConfirm && (
                <div className="mt-2 d-flex gap-2 justify-content-end">
                  <button
                    className="btn btn-sm btn-light"
                    onClick={toast.onCancel}
                  >
                    Hủy
                  </button>
                  <button
                    className="btn btn-sm btn-light"
                    onClick={toast.onConfirm}
                  >
                    Xác nhận
                  </button>
                </div>
              )}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

