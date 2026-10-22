import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    const load = () =>
      supabase
        .from("notifications")
        .select("id, title, message, read, created_at")
        .order("created_at", { ascending: false })
        .limit(20)
        .then(({ data }) => setNotifications((data as Notification[]) || []));
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const markRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  };

  return {
    user,
    notifications,
    unread: notifications.filter((n) => !n.read).length,
    markRead,
  };
};

export const NotificationBell = () => {
  const { user, notifications, unread, markRead } = useNotifications();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-foreground touch-manipulation" aria-label="Notificaciones">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
              {unread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="font-body">Notificaciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="text-xs font-body text-muted-foreground text-center py-6">No tienes notificaciones.</p>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`font-body cursor-pointer flex flex-col items-start gap-0.5 py-3 ${n.read ? "opacity-60" : ""}`}
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                {n.title}
              </span>
              <span className="text-xs text-muted-foreground whitespace-normal">{n.message}</span>
              <span className="text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleString("es-CR")}</span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/** Lista de notificaciones para incrustar en el menú inferior de móvil. */
export const NotificationList = () => {
  const { user, notifications, markRead } = useNotifications();

  if (!user) return null;

  return (
    <div className="flex flex-col max-h-60 overflow-y-auto">
      {notifications.length === 0 ? (
        <p className="text-xs font-body text-muted-foreground text-center py-4">No tienes notificaciones.</p>
      ) : (
        notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => markRead(n.id)}
            className={`text-left py-3 border-b border-white/5 last:border-0 touch-manipulation ${n.read ? "opacity-60" : ""}`}
          >
            <span className="flex items-center gap-2 text-sm font-semibold font-body">
              {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
              {n.title}
            </span>
            <span className="block text-xs font-body text-muted-foreground whitespace-normal">{n.message}</span>
            <span className="block text-[10px] font-body text-muted-foreground/70">
              {new Date(n.created_at).toLocaleString("es-CR")}
            </span>
          </button>
        ))
      )}
    </div>
  );
};
