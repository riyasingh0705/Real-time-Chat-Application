import { BrowserRouter, Routes, Route } from "react-router-dom";

import Join from "../pages/Join/Join";
import Chat from "../pages/Chat/Chat";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Join />}
        />

        <Route
          path="/chat"
          element={<Chat />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;