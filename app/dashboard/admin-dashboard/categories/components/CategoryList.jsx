"use client";

import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchServices,updateCategory,deleteCategory, } from "@/app/redux/slices/categorySlice";

const CategoryList = () => {
  const dispatch = useDispatch();
  const { list: categories, loading } = useSelector((state) => state.category);

  console.log("this si categories",categories);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [editModal, setEditModal] = useState({ open: false, id: null, name: "" });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  // Edit category
  const handleEditCategory = () => {
    console.log("The id is"+editModal.id +" and the name is "+editModal.name)
    dispatch(updateCategory({ id: editModal.id, name: editModal.name }));
    setEditModal({ open: false, id: null, name: "" });
  };

  // Delete category
  const handleDeleteCategory = () => {
    dispatch(deleteCategory(deleteModal.id));
    setDeleteModal({ open: false, id: null });
  };

  const filteredCategories = categories .filter((ct) =>
    selectedCategory ? ct.category_id === Number(selectedCategory) : true
  );


  return (
    <div className="border border-green-100 rounded-xl mt-8 bg-white shadow p-6">
      {/* Filter */}
      <div className="flex flex-col md:flex-row items-center gap-5 mb-6">
        <label className="text-lg font-semibold text-green-700">Search for Category</label>
        <select
          className="border border-green-200 p-2 rounded-xl text-lg focus:ring-2 focus:ring-green-400"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          {categories.map((ct) => (
            <option key={ct.category_id} value={ct.category_id}>
              {ct.name}
            </option>
          ))}
        </select>
      </div>

      {/* Category Table */}
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-green-50">
            <th className="border border-gray-200 p-2">Id</th>
            <th className="border border-gray-200 p-2">Name</th>
            <th className="border border-gray-200 p-2">Total Person</th>
            <th className="border border-gray-200 p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredCategories.length > 0 ? (
            filteredCategories.map((ct) => (
              <tr key={ct.category_id}>
                <td className="border border-gray-200 p-2">{ct.category_id}</td>
                <td className="border border-gray-200 p-2">{ct.name}</td>
                <td className="border border-gray-200 p-2">{ct.total_person}</td>
                <td className="border border-gray-200 p-2 flex gap-3 justify-center">
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                    onClick={() => setEditModal({ open: true, id: ct.category_id, name: ct.name })}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                    onClick={() => setDeleteModal({ open: true, id: ct.category_id })}
                  >
                    <FaTrash /> Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center p-4 text-gray-500">
                {loading ? "Loading..." : "No categories found."}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Edit Modal */}
      {editModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-green-200">
            <h2 className="text-xl font-bold text-green-700 mb-4">Edit Category</h2>
            <input
              type="text"
              className="w-full border border-green-200 rounded-lg p-2 mb-4 focus:ring-2 focus:ring-green-400"
              value={editModal.name}
              onChange={(e) => setEditModal((prev) => ({ ...prev, name: e.target.value }))}
            />
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 bg-gray-200 rounded-lg font-medium" onClick={() => setEditModal({ open: false, id: null, name: "" })}>
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                onClick={handleEditCategory}
                disabled={!editModal.name.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-green-200">
            <h2 className="text-xl font-bold text-red-600 mb-4">Delete Category</h2>
            <p className="mb-6 text-green-700">
              Are you sure you want to delete this category? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg font-medium"
                onClick={() => setDeleteModal({ open: false, id: null })}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
                onClick={handleDeleteCategory}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
