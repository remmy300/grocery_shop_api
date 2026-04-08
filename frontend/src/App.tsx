import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import DashboardPage from "./routes/dashboard";
import InventoryPage from "./routes/inventory";
import OrdersPage from "./routes/orders";
import UsersPage from "./routes/users";
import AnalyticsPage from "./routes/analytics";
import SettingsPage from "./routes/settings";
import ProfilePage from "./routes/profile";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
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
      </Routes>
    </BrowserRouter>
  );
};

export default App;
