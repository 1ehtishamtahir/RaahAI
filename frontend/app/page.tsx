import AppShell from "@/components/layout/AppShell";
import ChatWindow from "@/components/chat/ChatWindow";
import ChecklistCard from "@/components/checklist/ChecklistCard";
import ServiceCard from "@/components/services/ServiceCard";
import UploadCard from "@/components/documents/UploadCard";

export default function Page() {
  return (
    <AppShell
      rightPanel={
        <>
          <ChecklistCard service="passport" situation="new" />
          <ServiceCard />
          <UploadCard />
        </>
      }
    >
      <ChatWindow />
    </AppShell>
  );
}
