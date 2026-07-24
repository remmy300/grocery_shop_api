import {
  UsersResponse,
  BackendUser,
  BackendAdmin,
  BackendOrder,
  ApiError,
} from "@/types";
import { fetchJson } from "@/lib/api";
import {
  displayNameFromEmail,
  initialsFrom,
  slugify,
  formatDate,
} from "@/utils/formatters";

export const buildUsersResponse = async (): Promise<UsersResponse> => {
  const [currentUserResult, adminsResult, ordersResult] =
    await Promise.allSettled([
      fetchJson<BackendUser>("/api/auth/me"),
      fetchJson<BackendAdmin[]>("/api/auth/admins"),
      fetchJson<BackendOrder[]>("/api/orders"),
    ]);

  const currentUser =
    currentUserResult.status === "fulfilled" ? currentUserResult.value : null;
  const admins = adminsResult.status === "fulfilled" ? adminsResult.value : [];
  const orders = ordersResult.status === "fulfilled" ? ordersResult.value : [];

  if (!currentUser && !admins.length && !orders.length) {
    throw new ApiError("Unable to load users data", 500);
  }

  const users: UsersResponse["users"] = [];
  const seenEmails = new Set<string>();

  if (currentUser) {
    users.push({
      id: `#ME-${String(currentUser.id).padStart(4, "0")}`,
      userId: Number(currentUser.id) || 0,
      name: displayNameFromEmail(currentUser.email),
      initials: initialsFrom(displayNameFromEmail(currentUser.email)),
      email: currentUser.email,
      role: currentUser.role === "admin" ? "Admin" : "User",
      joinDate: "Current account",
    });
    seenEmails.add(currentUser.email.toLowerCase());
  }

  admins.forEach((admin) => {
    const key = admin.email.toLowerCase();
    if (seenEmails.has(key)) {
      return;
    }

    users.push({
      id: `#BA-${String(admin.id).padStart(4, "0")}`,
      userId: admin.id,
      name: displayNameFromEmail(admin.email),
      initials: initialsFrom(displayNameFromEmail(admin.email)),
      email: admin.email,
      role: "Admin",
      joinDate: "Admin account",
    });
    seenEmails.add(key);
  });

  const seenCustomers = new Set<string>();
  orders.forEach((order) => {
    const key = `${order.customer.toLowerCase()}|${order.phone}`;
    if (seenCustomers.has(key)) {
      return;
    }
    seenCustomers.add(key);

    users.push({
      id: `#CU-${String(order.id).padStart(4, "0")}`,
      userId: order.id,
      name: order.customer,
      initials: initialsFrom(order.customer),
      email: `${slugify(order.customer)}@customers.local`,
      role: "Customer",
      joinDate: formatDate(order.createdAt),
    });
  });

  return {
    stats: {
      totalUsers: users.length,
      activeAdmins: users.filter((user) => user.role === "Admin").length,
      customers: users.filter((user) => user.role === "Customer").length,
    },
    users,
  };
};
