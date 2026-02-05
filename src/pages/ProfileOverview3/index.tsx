"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  ChevronRight,
  Activity,
  Lock,
  User,
  MoreHorizontal,
  Search,
  Trash2,
  CheckCircle,
  Ban
} from "lucide-react";

/* ================= AXIOS CONFIG ================= */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "x-api-key": import.meta.env.VITE_ADMIN_API_KEY
  }
});

/* ================= ROLE MAP ================= */

const roleMap: Record<number, string> = {
  1: "User",
  2: "Company",
  3: "Admin"
};

/* ================= MAIN COMPONENT ================= */

export default function AdminUserProfile() {
  const [activePage, setActivePage] = useState("personal");
  const [users, setUsers] = useState<any[]>([]);
  const demoUser = {
  id: 0,
  name: "Demo User",
  email: "demo@example.com",
  role: 1,
  title: "Frontend Developer",
  location: "Lagos, Nigeria",
  skills: "React, Laravel, TailwindCSS",
  company: "WeWorkPerHour",
  bio: "This is a demo profile shown by default. Search for a user to load real details.",
  avatar: "https://ui-avatars.com/api/?name=Demo+User&background=0D8ABC&color=fff"
};

const [selectedUser, setSelectedUser] = useState<any>(demoUser);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);

  /* ================= OUTSIDE CLICK ================= */

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= FETCH USERS ================= */

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/v1/admin/users");
      setUsers(res.data.data.filter(Boolean));
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const fetchUser = async (id: number) => {
    try {
      const res = await api.get(`/v1/admin/users/${id}`);
      setSelectedUser(res.data.data);
      setShowSearchResults(false);
      setActivePage("personal");
    } catch (err) {
      console.error(`Failed to fetch user ${id}:`, err);
    }
  };

  /* ================= SEARCH ================= */

  const filteredUsers = users.filter(
    (u) =>
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.role && String(u.role).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  /* ================= ACTIONS ================= */

  const updateProfile = async () => {
    if (!selectedUser) return;
    try {
      await api.put(`/v1/admin/users/${selectedUser.id}`, selectedUser);
      alert("Profile updated");
      fetchUsers();
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  const approveUser = async () => {
    if (!selectedUser) return;
    try {
      await api.post(`/v1/admin/users/${selectedUser.id}/approve`);
      fetchUser(selectedUser.id);
    } catch (err) {
      console.error("Failed to approve user:", err);
    }
  };

  const suspendUser = async () => {
    if (!selectedUser) return;
    try {
      await api.post(`/v1/admin/users/${selectedUser.id}/suspend`);
      fetchUser(selectedUser.id);
    } catch (err) {
      console.error("Failed to suspend user:", err);
    }
  };

  const deleteUser = async () => {
    if (!selectedUser) return;
    if (!confirm("Delete this user?")) return;
    try {
      await api.delete(`/v1/admin/users/${selectedUser.id}`);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const changePassword = async (password: string) => {
    if (!selectedUser) return;
    try {
      await api.post(`/v1/admin/users/${selectedUser.id}/change-password`, {
        password,
        password_confirmation: password
      });
      alert("Password updated");
    } catch (err) {
      console.error("Failed to change password:", err);
    }
  };

  const logoutAll = async () => {
    if (!selectedUser) return;
    try {
      await api.post(`/v1/admin/users/${selectedUser.id}/logout-all`);
      alert("User logged out from all devices");
    } catch (err) {
      console.error("Failed to logout user:", err);
    }
  };

  /* ================= PAGES ================= */

  const PersonalInformation = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">User Profile</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Full Name"
          value={selectedUser.name}
          onChange={(val) => setSelectedUser({ ...selectedUser, name: val })}
        />
        <Input
          label="Email"
          value={selectedUser.email}
          onChange={(val) => setSelectedUser({ ...selectedUser, email: val })}
        />
        <Input
          label="Role"
          value={roleMap[selectedUser.role] || String(selectedUser.role)}
          onChange={(val) => setSelectedUser({ ...selectedUser, role: val })}
        />
        <Input
          label="Title"
          value={selectedUser.title || ""}
          onChange={(val) => setSelectedUser({ ...selectedUser, title: val })}
        />
        <Input
          label="Location"
          value={selectedUser.location || ""}
          onChange={(val) =>
            setSelectedUser({ ...selectedUser, location: val })
          }
        />
        <Input
          label="Skills"
          value={selectedUser.skills || ""}
          onChange={(val) => setSelectedUser({ ...selectedUser, skills: val })}
        />
        <Input
          label="Company"
          value={selectedUser.company || ""}
          onChange={(val) => setSelectedUser({ ...selectedUser, company: val })}
        />
        <Textarea
          label="Bio"
          value={selectedUser.bio || ""}
          onChange={(val) => setSelectedUser({ ...selectedUser, bio: val })}
        />
      </div>

      <button onClick={updateProfile} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
>
        Save Changes
      </button>
    </div>
  );

  const AccountSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Account Status</h2>

      <div className="flex gap-3">
        <button onClick={approveUser} className="btn-success">
          <CheckCircle size={18} /> Approve
        </button>
        <button onClick={suspendUser} className="btn-warning">
          <Ban size={18} /> Suspend
        </button>
        <button onClick={deleteUser} className="btn-danger">
          <Trash2 size={18} /> Delete
        </button>
      </div>
    </div>
  );

  const Security = () => {
    const [password, setPassword] = useState("");

    return (
     <div className="space-y-8">
  <div>
    <h2 className="text-2xl font-semibold text-gray-900">
      Security
    </h2>
    <p className="text-sm text-gray-500 mt-1">
      Manage user password and active sessions
    </p>
  </div>

  {/* Change Password */}
  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-4">
    <h3 className="text-sm font-semibold text-gray-700">
      Change Password
    </h3>

    <input
      type="password"
      placeholder="Enter new password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="
        w-full
        rounded-lg
        border
        border-gray-300
        px-4
        py-2.5
        text-sm
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
      "
    />

    <div className="flex justify-end pt-2">
      <button
        onClick={() => changePassword(password)}
        className="
          inline-flex
          items-center
          gap-2
          px-5
          py-2.5
          rounded-lg
          bg-blue-600
          text-white
          text-sm
          font-medium
          hover:bg-blue-700
          transition
        "
      >
        Update Password
      </button>
    </div>
  </div>

  {/* Logout Section */}
  <div className="bg-red-50 border border-red-200 rounded-xl p-6 space-y-3">
    <h3 className="text-sm font-semibold text-red-700">
      Active Sessions
    </h3>

    <p className="text-sm text-red-600">
      This will immediately log the user out from all devices.
    </p>

    <div className="flex justify-end pt-2">
      <button
        onClick={logoutAll}
        className="
          inline-flex
          items-center
          gap-2
          px-5
          py-2.5
          rounded-lg
          bg-red-600
          text-white
          text-sm
          font-medium
          hover:bg-red-700
          transition
        "
      >
        Logout User From All Devices
      </button>
    </div>
  </div>
</div>

    );
  };

  const pages: any = {
    personal: PersonalInformation,
    account: AccountSettings,
    security: Security
  };

  const ActiveComponent = pages[activePage];

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">Admin User Management</h1>

         <div className="relative w-full sm:w-80" ref={searchRef}>
  {/* Search Input */}
  <div className="relative">
    <Search
      size={16}
      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
    />

    <input
      placeholder="Search users..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      onFocus={() => setShowSearchResults(true)}
      className="
        w-full
        rounded-lg
        border
        border-gray-300
        bg-white
        py-2.5
        pl-10
        pr-4
        text-sm
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
      "
    />
  </div>

  {/* Dropdown */}
  {showSearchResults && (
    <div
      className="
        absolute
        z-50
        mt-2
        w-full
        rounded-xl
        border
        border-gray-200
        bg-white
        shadow-lg
        overflow-hidden
      "
    >
      {filteredUsers.length === 0 && (
        <div className="px-4 py-3 text-sm text-gray-500">
          No users found
        </div>
      )}

      {filteredUsers.map((u) => (
        <button
          key={u.id}
          onClick={() => fetchUser(u.id)}
          className="
            w-full
            text-left
            px-4
            py-3
            flex
            items-center
            gap-3
            hover:bg-gray-50
            transition
          "
        >
          {/* Avatar */}
          <img
            src={
              u.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                u.name || "User"
              )}&background=0D8ABC&color=fff`
            }
            className="w-8 h-8 rounded-full"
          />

          {/* Name + Role */}
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              {u.name}
            </div>
            <div className="text-xs text-gray-500">
              {roleMap[u.role] || u.role}
            </div>
          </div>
        </button>
      ))}
    </div>
  )}
</div>

        </div>

        {selectedUser && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Sidebar
              activePage={activePage}
              setActivePage={setActivePage}
              user={selectedUser}
            />
            <div className="
  lg:col-span-3
  bg-white
  rounded-xl
  border
  border-gray-200
  p-6
  md:p-8
  shadow-sm
">
              <ActiveComponent />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= SIDEBAR ================= */

function Sidebar({ activePage, setActivePage, user }: any) {
  return (
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
  <div className="p-6 border-b flex items-center gap-4">
    <img
      src={
        user.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user.name || "User"
        )}&background=0D8ABC&color=fff`
      }
      className="w-14 h-14 rounded-full"
    />
    <div>
      <div className="font-semibold text-gray-900">
        {user.name}
      </div>
      <div className="text-sm text-gray-500">
        {roleMap[user.role] || user.role}
      </div>
    </div>
    <MoreHorizontal className="ml-auto text-gray-400" />
  </div>

  <div className="p-2">
    {[
      { id: "personal", label: "User Profile", icon: User },
      { id: "account", label: "Account Status", icon: Activity },
      { id: "security", label: "Security", icon: Lock }
    ].map((item) => (
      <button
        key={item.id}
        onClick={() => setActivePage(item.id)}
        className={`
          w-full
          flex
          items-center
          gap-3
          px-4
          py-3
          rounded-lg
          text-sm
          font-medium
          transition
          ${
            activePage === item.id
              ? "bg-blue-50 text-blue-600"
              : "text-gray-600 hover:bg-gray-100"
          }
        `}
      >
        <item.icon size={16} />
        {item.label}
        {activePage === item.id && (
          <ChevronRight className="ml-auto" />
        )}
      </button>
    ))}
  </div>
</div>

  );
}

/* ================= INPUTS ================= */

/* ================= INPUTS ================= */

function Input({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-600">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full
          rounded-lg
          border
          border-gray-300
          px-4
          py-2.5
          text-sm
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
          focus:border-blue-500
        "
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="md:col-span-2 space-y-1">
      <label className="text-sm font-medium text-gray-600">
        {label}
      </label>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full
          rounded-lg
          border
          border-gray-300
          px-4
          py-2.5
          text-sm
          resize-none
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
        "
      />
    </div>
  );
}
