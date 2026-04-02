import { useState, useCallback, createContext, useContext, ReactNode } from "react";
import { X, Bell, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationType = "success" | "error" | "info" | "warning";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, "id">) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const fullNotification: Notification = { ...notification, id };

    setNotifications((prev) => [...prev, fullNotification]);

    if (notification.duration !== 0) {
      const timeout = setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);

      return id;
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
}

function NotificationContainer({
  notifications,
  onRemove,
}: {
  notifications: Notification[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-md">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => onRemove(notification.id)}
        />
      ))}
    </div>
  );
}

function NotificationItem({
  notification,
  onRemove,
}: {
  notification: Notification;
  onRemove: () => void;
}) {
  const bgColor = {
    success: "bg-green-900/20 border-green-500/30",
    error: "bg-red-900/20 border-red-500/30",
    info: "bg-blue-900/20 border-blue-500/30",
    warning: "bg-yellow-900/20 border-yellow-500/30",
  }[notification.type];

  const textColor = {
    success: "text-green-400",
    error: "text-red-400",
    info: "text-blue-400",
    warning: "text-yellow-400",
  }[notification.type];

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertCircle,
  }[notification.type];

  return (
    <div
      className={cn(
        "rounded-lg border p-4 backdrop-blur-sm animate-in slide-in-from-right-5 fade-in",
        bgColor
      )}
    >
      <div className="flex gap-3">
        <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", textColor)} />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground">{notification.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="text-xs font-medium mt-2 text-primary hover:underline"
            >
              {notification.action.label}
            </button>
          )}
        </div>
        <button
          onClick={onRemove}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
