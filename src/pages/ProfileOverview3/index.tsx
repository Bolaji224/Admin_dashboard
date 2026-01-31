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

/* ================= MAIN COMPONENT ================= */

export default function AdminUserProfile() {
  const [activePage, setActivePage] = useState("personal");
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);

  /* ================= FETCH USERS ================= */

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await api.get("/v1/users");
    setUsers(res.data.data);
  };

  const fetchUser = async (id: number) => {
    const res = await api.get(`/v1/users/${id}`);
    setSelectedUser(res.data.data);
    setShowSearchResults(false);
    setActivePage("personal");
  };

  /* ================= SEARCH ================= */

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ================= ACTIONS ================= */

  const updateProfile = async () => {
    if (!selectedUser) return;
    await api.put(`/v1/users/${selectedUser.id}`, selectedUser);
    alert("Profile updated");
    fetchUsers();
  };

  const approveUser = async () => {
    if (!selectedUser) return;
    await api.post(`/v1/users/${selectedUser.id}/approve`);
    fetchUser(selectedUser.id);
  };

  const suspendUser = async () => {
    if (!selectedUser) return;
    await api.post(`/v1/users/${selectedUser.id}/suspend`);
    fetchUser(selectedUser.id);
  };

  const deleteUser = async () => {
    if (!selectedUser) return;
    if (!confirm("Delete this user?")) return;
    await api.delete(`/v1/users/${selectedUser.id}`);
    setSelectedUser(null);
    fetchUsers();
  };

  const changePassword = async (password: string) => {
    if (!selectedUser) return;
    await api.post(`/v1/users/${selectedUser.id}/change-password`, {
      password,
      password_confirmation: password
    });
    alert("Password updated");
  };

  const logoutAll = async () => {
    if (!selectedUser) return;
    await api.post(`/v1/users/${selectedUser.id}/logout-all`);
    alert("User logged out from all devices");
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
          value={selectedUser.role}
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

      <button onClick={updateProfile} className="btn-primary">
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
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Security</h2>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />

        <button onClick={() => changePassword(password)} className="btn-primary">
          Update Password
        </button>

        <button onClick={logoutAll} className="btn-danger">
          Logout User From All Devices
        </button>
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">Admin User Management</h1>

          <div className="relative w-80" ref={searchRef}>
            <input
              className="input pl-10"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearchResults(true)}
            />
            <Search className="icon-left" />

            {showSearchResults && (
              <div className="dropdown">
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => fetchUser(u.id)}
                    className="dropdown-item"
                  >
                    {u.name} — {u.role}
                  </div>
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
            <div className="lg:col-span-3 bg-white p-8 rounded-lg border">
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
    <div className="bg-white border rounded-lg">
      <div className="p-6 border-b flex items-center gap-4">
        <img src={user.avatar} className="w-14 h-14 rounded-full" />
        <div>
          <div className="font-semibold">{user.name}</div>
          <div className="text-sm text-gray-600">{user.role}</div>
        </div>
        <MoreHorizontal className="ml-auto text-gray-400" />
      </div>

      {[
        { id: "personal", label: "User Profile", icon: User },
        { id: "account", label: "Account Status", icon: Activity },
        { id: "security", label: "Security", icon: Lock }
      ].map((item) => (
        <button
          key={item.id}
          onClick={() => setActivePage(item.id)}
          className={`sidebar-btn ${activePage === item.id && "active"}`}
        >
          <item.icon size={16} />
          {item.label}
          {activePage === item.id && <ChevronRight className="ml-auto" />}
        </button>
      ))}
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
  onChange: (val: string) => void; // <--- typed val as string
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
  onChange: (val: string) => void; // <--- typed val as string
}) {
  return (
    <div className="md:col-span-2">
      <label className="label">{label}</label>
      <textarea
        className="input"
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

