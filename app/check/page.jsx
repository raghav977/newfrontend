"use client";
 import Sidebar from "@/app/dashboard/admin-dashboard/components/SidebarComp";

export default function AdminDashboardStatic() {
  // Dummy data
  const services = [
    { id: 1, name: "Pest Control", category: "House Service", status: "Approved" },
    { id: 2, name: "Sutkeri Service", category: "Health Service", status: "Pending" },
    { id: 3, name: "Cleaning", category: "House Service", status: "Rejected" },
  ];

  const rooms = [
    { id: 101, name: "Room A", type: "Single", status: "Approved" },
    { id: 102, name: "Room B", type: "Double", status: "Pending" },
  ];

  const gharbetis = [
    { id: 1, name: "Ram Bahadur", email: "ram@example.com", status: "Active" },
    { id: 2, name: "Sita Sharma", email: "sita@example.com", status: "Inactive" },
  ];

  return (
    <div className="flex h-screen">
      <Sidebar user={{ email: "admin@example.com" }} />

      {/* Main content */}
      <main className="flex-1 p-8 bg-gray-50 overflow-auto">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="text-sm font-medium text-gray-500">Total Services</h3>
            <p className="mt-2 text-2xl font-bold">{services.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="text-sm font-medium text-gray-500">Total Rooms</h3>
            <p className="mt-2 text-2xl font-bold">{rooms.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="text-sm font-medium text-gray-500">Total Gharbetis</h3>
            <p className="mt-2 text-2xl font-bold">{gharbetis.length}</p>
          </div>
        </div>

        {/* Services Table */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Services</h2>
          <table className="w-full border border-gray-300 bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Category</th>
                <th className="p-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id}>
                  <td className="p-2 border">{s.id}</td>
                  <td className="p-2 border">{s.name}</td>
                  <td className="p-2 border">{s.category}</td>
                  <td className="p-2 border">{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Rooms Table */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Rooms</h2>
          <table className="w-full border border-gray-300 bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Type</th>
                <th className="p-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => (
                <tr key={r.id}>
                  <td className="p-2 border">{r.id}</td>
                  <td className="p-2 border">{r.name}</td>
                  <td className="p-2 border">{r.type}</td>
                  <td className="p-2 border">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Gharbetis Table */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Gharbetis</h2>
          <table className="w-full border border-gray-300 bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {gharbetis.map((g) => (
                <tr key={g.id}>
                  <td className="p-2 border">{g.id}</td>
                  <td className="p-2 border">{g.name}</td>
                  <td className="p-2 border">{g.email}</td>
                  <td className="p-2 border">{g.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
