import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Chat from "./pages/Chat";

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/c/:conversationId" element={<Chat />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
