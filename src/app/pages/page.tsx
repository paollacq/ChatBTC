import MessageInput from "@/app/components/messageInput";
import Sidebar from "./components/sideBar";

export default function Home() {
  return (
    <div className="container font-[family-name:var(--font-geist-sans)]">
      {/* Sidebar */}
      <aside className="sidebar">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <h1 className="text-2xl font-semibold">Welcome to the Chat Application</h1>
        <div className="flex-1 overflow-auto placeholder-text">
          Chat messages will appear here.
        </div>
      </main>

      {/* Message Input */}
      <footer className="footer">
        <MessageInput />
      </footer>
    </div>
  );
}
