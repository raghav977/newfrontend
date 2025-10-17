"use client";

import { useEffect, useMemo, useState } from "react";

export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/api/admin/users/all", { credentials: "include" });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const body = await res.json();
      // expected shape: { status, code, message?, data: { users: [...] } }
      const list = (body?.data && Array.isArray(body.data.users)) ? body.data.users : Array.isArray(body?.data) ? body.data : [];

      // normalize users to expected UI fields
      const normalized = list.map((u) => ({
        id: u.id,
        name: u.name || u.username || u.email,
        email: u.email,
        username: u.username,
        phone: u.phone_number || u.phone || u.mobile || null,
        profile_picture: u.profile_picture || u.avatar || null,
        primary_address: u.primary_address || u.address || null,
        is_active: typeof u.is_active === 'boolean' ? u.is_active : (u.status !== 'blocked'),
        blocked: u.is_active === false || u.status === 'blocked' || u.deletedAt != null,
        role: u.role || u.userRole || 'User',
        createdAt: u.createdAt || u.created_at || u.created,
      }));

      setUsers(normalized);
    } catch (e) {
      console.error("Failed to fetch admin users", e);
      setError(String(e));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return users;
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const name = String(u.name || u.fullName || "").toLowerCase();
      const email = String(u.email || u.userEmail || u.serviceProviderEmail || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [users, query]);

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch (e) {
      return iso;
    }
  };

  const toggleBlock = async (user) => {
    const wantBlock = !user.blocked;
    const verb = wantBlock ? "block" : "unblock";
alert("user id is "+user.id)
    if (!confirm(`Are you sure you want to ${verb} ${user.name || user.email || 'this user'}?`)) return;

    // optimistic update
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, blocked: wantBlock } : u)));

    try {
      const endpoint = `http://localhost:5000/api/admin/users/change-status/${user.id}/${verb}`;
      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      // refresh list to reflect reported server state
      await fetchUsers();
      alert(`${verb.charAt(0).toUpperCase() + verb.slice(1)} succeeded`);
    } catch (e) {
      console.error(`Failed to ${verb} user`, e);
      setError(String(e));
      // rollback optimistic
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, blocked: user.blocked } : u)));
      alert(`Failed to ${verb} user: ${e.message || e}`);
    }
  };

  return (
    <div className="">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Users</h1>
          <p className="text-sm text-gray-500">Search, view and block/unblock users.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchUsers} className="px-3 py-2 bg-indigo-600 text-white rounded">Refresh</button>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or email" className="flex-1 border rounded px-3 py-2" />
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <div className="p-4 border-b">
          <div className="text-sm text-gray-600">{loading ? 'Loading users…' : `Showing ${filtered.length} user(s)`}</div>
        </div>

        {error && <div className="p-4 text-red-600">Error: {error}</div>}

        <div className="divide-y">
          {filtered.map((u) => (
            <div key={u.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <div className="font-medium">{u.name || u.fullName || u.email}</div>
                <div className="text-sm text-gray-600">{u.email || u.userEmail || u.serviceProviderEmail}</div>
                <div className="text-sm text-gray-500">Joined: {formatDate(u.createdAt || u.created_at || u.created)}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded text-sm ${u.blocked || u.isBlocked || u.status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {u.blocked || u.isBlocked || u.status === 'blocked' ? 'Blocked' : 'Active'}
                </div>
                <button onClick={() => setSelected(u)} className="px-3 py-1 border rounded text-sm">View</button>
                <button onClick={() => toggleBlock(u)} className={`px-3 py-1 rounded text-sm ${u.blocked || u.isBlocked || u.status === 'blocked' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                  {u.blocked || u.isBlocked || u.status === 'blocked' ? 'Unblock' : 'Block'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-40">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold">User — {selected.name || selected.email}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-500">Close</button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Name</div>
                <div className="font-medium">{selected.name || selected.fullName || '—'}</div>
                <div className="text-sm text-gray-500 mt-3">Email</div>
                <div className="font-medium">{selected.email || selected.userEmail || selected.serviceProviderEmail || '—'}</div>
                <div className="text-sm text-gray-500 mt-3">Joined</div>
                <div className="font-medium">{formatDate(selected.createdAt || selected.created_at || selected.created)}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div className="font-medium">{selected.blocked || selected.isBlocked || selected.status === 'blocked' ? 'Blocked' : 'Active'}</div>
                <div className="text-sm text-gray-500 mt-3">Role</div>
                <div className="font-medium">{selected.role || selected.userRole || 'User'}</div>
                <div className="text-sm text-gray-500 mt-3">Other</div>
                <div className="text-sm text-gray-600">ID: {selected.id}</div>
                <div className="text-sm text-gray-600">Phone: {selected.phone || selected.mobile || '—'}</div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setSelected(null)} className="px-4 py-2 border rounded">Close</button>
              <button onClick={() => { toggleBlock(selected); setSelected(null); }} className={`px-4 py-2 rounded text-white ${selected.blocked || selected.isBlocked || selected.status === 'blocked' ? 'bg-green-600' : 'bg-red-600'}`}>
                {selected.blocked || selected.isBlocked || selected.status === 'blocked' ? 'Unblock' : 'Block'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}