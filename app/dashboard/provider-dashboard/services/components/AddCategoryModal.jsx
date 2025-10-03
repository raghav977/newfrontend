"use client"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useDispatch, useSelector } from "react-redux"
import { deleteSubcategory, editSubcategory, fetchSubcategories } from "@/app/redux/slices/subcategories"
import { deleteCategory } from "@/app/redux/slices/categorySlice"

export function AddCategoryModal({ open, onOpenChange, service, onSave }) {
  const dispatch = useDispatch()
  const list = useSelector((state) => state.subcategory.data)
  console.log("This is the list for the subcategory",list);
  const [categories, setCategories] = useState([""]) // new categories
  const [editCategory, setEditCategory] = useState(null) // currently editing category
  const [editValue, setEditValue] = useState("") // edit input value

  // handlers for new categories

  const handleEditSave = () => {
  if (editValue.trim() === "") return
  console.log("THis is edit subcategory",editCategory);

  dispatch(editSubcategory({ id: editCategory.id, name: editValue })) 
  setEditCategory(null)
  setEditValue("")
}
  const handleChange = (index, value) => {
    const newCats = [...categories]
    newCats[index] = value
    setCategories(newCats)
  }

  const addInput = () => setCategories([...categories, ""])
  const removeInput = (index) => {
    setCategories(categories.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    const validCats = categories.filter((c) => c.trim() !== "")
    if (validCats.length === 0) return

    onSave(service.id, validCats) // 🔹 pass to parent
    onOpenChange(false)
    setCategories([""])
  }

  // handlers for editing existing category
  const handleEditStart = (cat) => {
    setEditCategory(cat)
    setEditValue(cat.name)
  }


  // fetch subcategories when service changes
  useEffect(() => {
    if (service?.id) {
      dispatch(fetchSubcategories(service.id))
    }
  }, [dispatch, service?.id])


  const onDelete = async(id)=>{
    try{
      
      dispatch(deleteSubcategory(id))

    }catch(err){

    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Category for {service?.name}</DialogTitle>
        </DialogHeader>

        {/* 🔹 Section 1: Inputs for new categories */}
        <div className="space-y-3">
          {categories.map((cat, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={cat}
                onChange={(e) => handleChange(index, e.target.value)}
                placeholder="Enter category name"
              />
              {categories.length > 1 && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeInput(index)}
                >
                  ✕
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" onClick={addInput}>
            + Add Another
          </Button>
        </div>

        {/* 🔹 Section 2: Existing categories */}
        <div className="mt-6">
          <h4 className="font-medium mb-2">Existing Categories</h4>
          {Array.isArray(list) && list?.length > 0 ? (
            <ul className="space-y-2">
              {list.map((sc) => (
                <li
                  key={sc.id}
                  className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg"
                >
                  <span className="text-sm">{sc.name}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditStart(sc)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(sc.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No categories yet.</p>
          )}
        </div>

        {/* 🔹 Footer */}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>

      {/* 🔹 Edit Popup */}
      {editCategory && (
        <Dialog open={true} onOpenChange={() => setEditCategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2">
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Enter new name"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setEditCategory(null)}>
                Cancel
              </Button>
              <Button onClick={handleEditSave}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  )
}
