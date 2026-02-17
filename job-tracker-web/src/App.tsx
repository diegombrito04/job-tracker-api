import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { ThemeProvider } from "./context/ThemeContext";
import { SearchProvider } from "./context/SearchContext";
import { UserProvider, useTranslation } from "./context/UserContext";
import { ApplicationsPage } from "./pages/ApplicationsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { StatisticsPage } from "./pages/StatisticsPage";
import { SettingsPage } from "./pages/SettingsPage";

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarVisible");
    return stored !== "false";
  });
  const location = useLocation();
  const t = useTranslation();

  const PAGE_TITLES: Record<string, string> = {
    "/": t.dashboard,
    "/applications": t.applications,
    "/statistics": t.statistics,
    "/settings": t.settings,
  };

  const title = PAGE_TITLES[location.pathname] ?? "Job Tracker";

  useEffect(() => {
    localStorage.setItem("sidebarVisible", String(sidebarVisible));
  }, [sidebarVisible]);

  function handleToggleSidebarVisibility() {
    setSidebarVisible((prev) => !prev);
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#1c1c1e]">
      <Sidebar
        isOpen={sidebarOpen}
        isVisible={sidebarVisible}
        onClose={() => setSidebarOpen(false)}
        onToggleVisibility={handleToggleSidebarVisibility}
      />
      <Topbar
        title={title}
        sidebarVisible={sidebarVisible}
        onOpenSidebar={() => setSidebarOpen(true)}
        onToggleSidebarVisibility={handleToggleSidebarVisibility}
      />

      <main className={`pt-[60px] ${sidebarVisible ? "lg:pl-[250px]" : "lg:pl-0"}`}>
        <div className="p-4 md:p-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <UserProvider>
          <SearchProvider>
            <AppContent />
          </SearchProvider>
        </UserProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
