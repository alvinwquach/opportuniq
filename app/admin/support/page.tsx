import { SupportChatRoom } from "./SupportChatRoom";
import { getSupportData } from "./actions";

export default async function SupportPage() {
  const { activeSessions, unreadCount, onlineAdmins, currentAdmin } = await getSupportData();

  return (
    <div className="h-screen flex flex-col bg-[#0c0c0c]">
      <SupportChatRoom 
        initialSessions={activeSessions}
        initialUnreadCount={unreadCount}
        onlineAdmins={onlineAdmins}
        currentAdmin={currentAdmin}
      />
    </div>
  );
}

