"use client";

import { useState } from "react";
import { createUser, updateUser, deleteUser } from "@/actions/users";
import { Icon } from "@/components/ui/Icon";
import { formatDate } from "@/lib/format";
import { useAdminDataTable } from "@/hooks/useAdminDataTable";
import { DataTablePagination } from "@/components/admin/DataTablePagination";
import type { Role } from "@/generated/prisma";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: Role;
  bio: string | null;
  isActive: boolean;
  createdAt: Date;
  _count: { articles: number };
};

type UserManagerProps = {
  initialUsers: UserRecord[];
  currentUserId: string;
};

export function UserManager({ initialUsers, currentUserId }: UserManagerProps) {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("EDITOR");
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);

  function openCreateModal() {
    setSelectedUser(null);
    setName("");
    setEmail("");
    setRole("EDITOR");
    setBio("");
    setPassword("");
    setIsActive(true);
    setModalMode("create");
    setMessage(null);
  }

  function openEditModal(u: UserRecord) {
    setSelectedUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setBio(u.bio || "");
    setPassword("");
    setIsActive(u.isActive);
    setModalMode("edit");
    setMessage(null);
  }

  function closeModal() {
    setModalMode(null);
    setSelectedUser(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (modalMode === "create") {
      const res = await createUser({ name, email, role, password, bio });
      if (res.success) {
        setMessage({ type: "success", text: "User created successfully!" });
        closeModal();
        window.location.reload();
      } else {
        setMessage({ type: "error", text: res.error || "Failed to create user." });
      }
    } else if (modalMode === "edit" && selectedUser) {
      const res = await updateUser({
        id: selectedUser.id,
        name,
        email,
        role,
        bio,
        isActive,
        newPassword: password || undefined,
      });
      if (res.success) {
        setMessage({ type: "success", text: "User updated successfully!" });
        closeModal();
        window.location.reload();
      } else {
        setMessage({ type: "error", text: res.error || "Failed to update user." });
      }
    }
    setLoading(false);
  }

  async function handleDelete(u: UserRecord) {
    if (!confirm(`Are you sure you want to delete user "${u.name}"? This cannot be undone.`)) {
      return;
    }
    setLoading(true);
    const res = await deleteUser(u.id);
    if (res.success) {
      setUsers((prev) => prev.filter((item) => item.id !== u.id));
      setMessage({ type: "success", text: `User ${u.name} deleted successfully.` });
    } else {
      setMessage({ type: "error", text: res.error || "Failed to delete user." });
    }
    setLoading(false);
  }

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedData,
    rangeText,
    sortKey,
    sortOrder,
    toggleSort,
  } = useAdminDataTable<UserRecord>({
    data: users,
    initialPageSize: 10,
    searchQuery: search,
    searchFields: ["name", "email", "role"],
    defaultSortKey: "createdAt",
    defaultSortOrder: "desc",
    sortResolvers: {
      articles: (u) => u._count.articles,
    },
  });

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Staff &amp; Users</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage administrative roles, editorial permissions, and contributor profiles.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-surface-elevated shadow-xs transition-colors hover:bg-primary-hover"
        >
          <Icon name="sparkles" className="size-3.5" />
          Add New User
        </button>
      </div>

      {message && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            message.type === "success"
              ? "border-success/30 bg-success/10 text-success"
              : "border-error/30 bg-error/10 text-error"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Search Bar */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-xl border border-border bg-surface-elevated px-3.5 text-xs text-text-primary shadow-2xs transition-colors hover:border-text-muted/40 focus:border-primary focus:outline-none"
        />
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-background/50 font-semibold text-text-muted uppercase tracking-wider text-[11px]">
              <tr>
                <th
                  onClick={() => toggleSort("name")}
                  className="px-6 py-3.5 cursor-pointer select-none hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>User</span>
                    <span className="text-[10px] text-text-muted">
                      {sortKey === "name" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("role")}
                  className="px-6 py-3.5 cursor-pointer select-none hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Role</span>
                    <span className="text-[10px] text-text-muted">
                      {sortKey === "role" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("articles")}
                  className="px-6 py-3.5 cursor-pointer select-none hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Articles</span>
                    <span className="text-[10px] text-text-muted">
                      {sortKey === "articles" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("isActive")}
                  className="px-6 py-3.5 cursor-pointer select-none hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    <span className="text-[10px] text-text-muted">
                      {sortKey === "isActive" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("createdAt")}
                  className="px-6 py-3.5 cursor-pointer select-none hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Joined</span>
                    <span className="text-[10px] text-text-muted">
                      {sortKey === "createdAt" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-text-muted">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedData.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-background/40">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 place-items-center rounded-full bg-primary/10 font-bold text-primary ring-1 ring-primary/20">
                          {u.name ? u.name[0].toUpperCase() : "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary">{u.name}</p>
                          <p className="text-[11px] text-text-muted">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          u.role === "ADMIN"
                            ? "bg-accent-secondary/15 text-accent-secondary"
                            : "bg-primary/15 text-primary"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-text-secondary">
                      {u._count.articles}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
                          u.isActive ? "text-success" : "text-text-muted"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            u.isActive ? "bg-success" : "bg-text-muted"
                          }`}
                        />
                        {u.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-muted">
                      {formatDate(new Date(u.createdAt).toISOString())}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(u)}
                          className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-text-primary transition-colors hover:border-primary/40 hover:text-primary"
                        >
                          Edit
                        </button>
                        {u.id !== currentUserId && (
                          <button
                            onClick={() => handleDelete(u)}
                            className="rounded-lg border border-error/30 px-2.5 py-1 text-xs font-semibold text-error transition-colors hover:bg-error/10"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          rangeText={rangeText}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Modal Dialog for Create & Edit */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface-elevated p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-base font-bold text-text-primary">
                {modalMode === "create" ? "Add New User" : `Edit User: ${selectedUser?.name}`}
              </h2>
              <button
                onClick={closeModal}
                className="grid size-7 place-items-center rounded-lg text-text-muted hover:bg-background hover:text-text-primary"
              >
                <Icon name="close" className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-text-primary">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Shruti Singh"
                  className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-text-primary focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@daytodaynews.com"
                  className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-text-primary focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-text-primary">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-text-primary focus:border-primary focus:outline-none"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="EDITOR">EDITOR</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-text-primary">Status</label>
                  <select
                    value={isActive ? "active" : "disabled"}
                    onChange={(e) => setIsActive(e.target.value === "active")}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-text-primary focus:border-primary focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-text-primary">
                  {modalMode === "create" ? "Password" : "New Password (leave blank to keep current)"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={modalMode === "create" ? "Temporary password" : "Leave blank to keep current"}
                  className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-text-primary focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary">Author Bio / Title</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Short editorial bio..."
                  className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-text-primary focus:border-primary focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={closeModal}
                  className="h-9 rounded-xl border border-border px-4 font-semibold text-text-secondary hover:bg-background"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-9 rounded-xl bg-primary px-5 font-semibold text-surface-elevated transition-colors hover:bg-primary-hover disabled:opacity-60"
                >
                  {loading ? "Saving..." : modalMode === "create" ? "Create User" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
