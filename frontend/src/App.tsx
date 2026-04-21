import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import RequireAuth from "./components/RequireAuth";
import DashboardPage from "./routes/dashboard";
import InventoryPage from "./routes/inventory";
import OrdersPage from "./routes/orders";
import UsersPage from "./routes/users";
import AnalyticsPage from "./routes/analytics";
import SettingsPage from "./routes/settings";
import ProfilePage from "./routes/profile";
import LoginPage from "./routes/login";
import { hasStoredAccessToken } from "./lib/api";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
        <Route
          path="*"
          element={
            <Navigate
              to={hasStoredAccessToken() ? "/dashboard" : "/login"}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
