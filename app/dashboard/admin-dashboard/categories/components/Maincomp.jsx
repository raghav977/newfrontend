"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { FaPlus } from "react-icons/fa";
import CategoryList from "./CategoryList";
import DashboardStats from "./DashboardStats";

import { addCategory, fetchCategories } from "@/app/redux/slices/categorySlice";

export default function Maincomp() {
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const dispatch = useDispatch();

  const handleAddCategory = () => {
    if (!categoryName.trim()) return;

    dispatch(addCategory(categoryName));
    dispatch(fetchCategories())
    setCategoryName("");
    setModalOpen(false);
  };

  return (
    <div>
      {/* Heading Section */}
      <div className="border-b border-green-200 flex justify-between items-center p-6 bg-white rounded-t-xl shadow">
        <h1 className="text-3xl font-bold text-green-700">Manage Categories</h1>
        <button
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition cursor-pointer"
          onClick={() => setModalOpen(true)}
        >
          <FaPlus />
          Add New Category
        </button>
      </div>

      {/* Add Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-green-200">
            <h2 className="text-xl font-bold text-green-700 mb-4">Add New Category</h2>
            <label className="block mb-2 text-green-700 font-medium">Category Name</label>
            <input
              type="text"
              className="w-full border border-green-200 rounded-lg p-2 mb-4 focus:ring-2 focus:ring-green-400"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category name..."
            />
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg font-medium"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                onClick={handleAddCategory}
                disabled={!categoryName.trim()}
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Stats */}
      <DashboardStats />

      {/* Category search + list */}
      <CategoryList />
    </div>
  );
}
