import { SupportChatRoom } from "./SupportChatRoom";
import { getSupportData } from "./actions";

export default async function SupportPage() {
  const { activeSessions, unreadCount, onlineAdmins, currentAdmin } = await getSupportData();

  return (
    <div className="min-h-[calc(100vh-48px)] lg:min-h-screen flex flex-col bg-[#0f0f0f]">
      <SupportChatRoom
        initialSessions={activeSessions}
        initialUnreadCount={unreadCount}
        onlineAdmins={onlineAdmins}
        currentAdmin={currentAdmin}
      />
    </div>
  );
}
