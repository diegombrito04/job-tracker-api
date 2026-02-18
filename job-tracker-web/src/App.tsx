import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { ThemeProvider } from "./context/ThemeContext";
import { SearchProvider } from "./context/SearchContext";
import { UserProvider, useTranslation, useUser } from "./context/UserContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ApplicationsPage } from "./pages/ApplicationsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { StatisticsPage } from "./pages/StatisticsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AuthPage } from "./pages/AuthPage";

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const { profile, updateProfile } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarVisible = profile.sidebarVisible;
  const location = useLocation();
  const t = useTranslation();

  const PAGE_TITLES: Record<string, string> = {
    "/": t.dashboard,
    "/applications": t.applications,
    "/statistics": t.statistics,
    "/settings": t.settings,
  };

  const title = PAGE_TITLES[location.pathname] ?? "Job Tracker";

  function handleToggleSidebarVisibility() {
    void updateProfile({ sidebarVisible: !sidebarVisible });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#1c1c1e] flex items-center justify-center">
        <div className="text-sm text-[#6e6e73] dark:text-[#98989d]">{t.loading}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (location.pathname === "/login") {
    return <Navigate to="/" replace />;
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <ThemeProvider>
            <SearchProvider>
              <AppContent />
            </SearchProvider>
          </ThemeProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
