"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronRight,
  Activity,
  Box,
  Lock,
  Settings,
  User,
  MoreHorizontal,
  Search,
  X,
  Trash2,
  CheckCircle,
  Ban
} from "lucide-react";

/* ================= MOCK DATA ================= */

const userData = {
  name: "John Doe",
  email: "john.doe@example.com",
  role: "Freelancer",
  title: "Virtual Assistant",
  bio: "Experienced virtual assistant with strong admin and research skills.",
  skills: "Canva, Email Management, Research",
  company: "",
  location: "Lagos, Nigeria",
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"
};

const mockUsers = [
  { id: 1, name: "Alice Johnson", role: "Freelancer" },
  { id: 2, name: "Bob Smith", role: "Employer" },
  { id: 3, name: "Carol Williams", role: "Freelancer" }
];

/* ================= NAVIGATION ================= */

const navigationSections = [
  {
    title: "Admin",
    items: [
      { id: "personal", icon: User, label: "User Profile" },
      { id: "account", icon: Activity, label: "Account Status" },
      { id: "security", icon: Lock, label: "Security" }
    ]
  }
];

/* ================= PAGES ================= */

const PersonalInformation = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-semibold text-gray-800">
      User Profile (Admin)
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Input label="Full Name" defaultValue={userData.name} />
      <Input label="Email" defaultValue={userData.email} />

      <Select
        label="User Role"
        options={["Freelancer", "Employer"]}
        defaultValue={userData.role}
      />

      <Input label="Title / Profession" defaultValue={userData.title} />
      <Input label="Location" defaultValue={userData.location} />

      <Input
        label="Skills (Freelancer)"
        defaultValue={userData.skills}
      />

      <Input
        label="Company (Employer)"
        placeholder="Company name"
        defaultValue={userData.company}
      />

      <Textarea label="Bio" defaultValue={userData.bio} />
    </div>

    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
      Save Profile Changes
    </button>
  </div>
);

const AccountSettings = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-semibold text-gray-800">
      Account Status
    </h2>

    <div className="bg-gray-50 border rounded-lg p-6 space-y-4">
      <select className="w-full px-4 py-2 border rounded-lg">
        <option>Active</option>
        <option>Suspended</option>
        <option>Banned</option>
      </select>

      <div className="flex flex-wrap gap-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg">
          <CheckCircle size={18} />
          Approve User
        </button>

        <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg">
          <Ban size={18} />
          Suspend
        </button>

        <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg">
          <Trash2 size={18} />
          Delete User
        </button>
      </div>
    </div>
  </div>
);

const Security = () => (
  <div className="space-y-8">
    <h2 className="text-2xl font-semibold text-gray-800">
      Security & Access
    </h2>

    {/* Password Info */}
    <div className="border rounded-lg p-6 bg-gray-50 space-y-4">
      <div>
        <h3 className="font-medium text-gray-800">
          Password Status
        </h3>
        <p className="text-sm text-gray-600">
          Password is set and encrypted. Last updated: <span className="font-medium">2 months ago</span>
        </p>
      </div>
    </div>

    {/* Change Password */}
    <div className="border rounded-lg p-6 space-y-6">
      <h3 className="font-medium text-gray-800">
        Change User Password
      </h3>

      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <input
            type="password"
            placeholder="Enter new password"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            placeholder="Confirm new password"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Update Password
        </button>

        <p className="text-xs text-gray-500">
          User will be required to use the new password immediately.
        </p>
      </div>
    </div>

    {/* Session Control */}
    <div className="border rounded-lg p-6 space-y-4">
      <h3 className="font-medium text-gray-800">
        Active Sessions
      </h3>
      <p className="text-sm text-gray-600">
        Force logout from all active devices and browsers.
      </p>

      <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
        Logout User From All Devices
      </button>
    </div>
  </div>
);


/* ================= MAIN LAYOUT ================= */

export default function AdminUserProfile() {
  const [activePage, setActivePage] = useState("personal");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (searchQuery.trim()) {
      setSearchResults(
        mockUsers.filter(
          (u) =>
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.role.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  const pageComponents: any = {
    personal: PersonalInformation,
    account: AccountSettings,
    security: Security
  };

  const ActiveComponent = pageComponents[activePage];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin User Management
          </h1>

          <div className="relative w-80" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 pr-10 py-2 border rounded-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}

            {showSearchResults && (
              <div className="absolute mt-2 w-full bg-white border rounded-lg shadow">
                {searchResults.map((u) => (
                  <div
                    key={u.id}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="font-medium">{u.name}</div>
                    <div className="text-sm text-gray-600">{u.role}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b flex items-center gap-4">
              <img
                src={userData.avatar}
                className="w-14 h-14 rounded-full"
              />
              <div>
                <div className="font-semibold">{userData.name}</div>
                <div className="text-sm text-gray-600">{userData.role}</div>
              </div>
              <MoreHorizontal className="ml-auto text-gray-400" />
            </div>

            <div className="p-4">
              {navigationSections.map((section) => (
                <div key={section.title}>
                  <h4 className="text-xs font-semibold text-gray-500 mb-3">
                    {section.title}
                  </h4>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActivePage(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${
                          activePage === item.id
                            ? "bg-blue-50 text-blue-700"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <Icon size={16} />
                        {item.label}
                        {activePage === item.id && (
                          <ChevronRight className="ml-auto w-4 h-4" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 bg-white rounded-lg border p-8">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= REUSABLE INPUTS ================= */

function Input({ label, ...props }: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-2 border rounded-lg"
      />
    </div>
  );
}

function Select({ label, options, defaultValue }: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <select
        defaultValue={defaultValue}
        className="w-full px-4 py-2 border rounded-lg"
      >
        {options.map((o: string) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function Textarea({ label, ...props }: any) {
  return (
    <div className="md:col-span-2">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <textarea
        {...props}
        rows={4}
        className="w-full px-4 py-2 border rounded-lg"
      />
    </div>
  );
}
