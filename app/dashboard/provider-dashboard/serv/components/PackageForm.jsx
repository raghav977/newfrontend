"use client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Trash2 } from "lucide-react";

export default function PackagesForm({
  useSubcategories,
  setUseSubcategories,
  subcategories,
  setSubcategories,
  packages,
  setPackages,
}) {
  const addSubcategory = () =>
    setSubcategories([...subcategories, { name: "", packages: [] }]);
  const removeSubcategory = (idx) =>
    setSubcategories(subcategories.filter((_, i) => i !== idx));
  const addPackageToSubcategory = (idx) => {
    const updated = [...subcategories];
    updated[idx].packages.push({
      name: "",
      price: "",
      desc: "",
      related_documents: "",
    });
    setSubcategories(updated);
  };
  const removePackageFromSubcategory = (subIdx, pkgIdx) => {
    const updated = [...subcategories];
    updated[subIdx].packages = updated[subIdx].packages.filter(
      (_, i) => i !== pkgIdx
    );
    setSubcategories(updated);
  };
  const handleSubcategoryChange = (idx, field, value) => {
    const updated = [...subcategories];
    updated[idx][field] = value;
    setSubcategories(updated);
  };
  const handlePackageChangeInSubcategory = (subIdx, pkgIdx, field, value) => {
    const updated = [...subcategories];
    updated[subIdx].packages[pkgIdx][field] = value;
    setSubcategories(updated);
  };

  const addPackage = () =>
    setPackages([
      ...packages,
      { name: "", price: "", desc: "", related_documents: "" },
    ]);
  const removePackage = (idx) =>
    setPackages(packages.filter((_, i) => i !== idx));
  const handlePackageChange = (idx, field, value) => {
    const updated = [...packages];
    updated[idx][field] = value;
    setPackages(updated);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <span className="font-semibold text-lg text-green-700 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Use Subcategories?
        </span>
        <Switch
          checked={useSubcategories}
          onCheckedChange={setUseSubcategories}
        />
      </div>

      {useSubcategories ? (
        <div className="space-y-8">
          {subcategories.map((sub, idx) => (
            <div
              key={idx}
              className="border border-green-200 rounded-2xl p-5 bg-green-50/50 shadow-sm relative"
            >
              <div className="flex justify-between items-center mb-3">
                <Input
                  placeholder="Subcategory name"
                  value={sub.name}
                  onChange={(e) =>
                    handleSubcategoryChange(idx, "name", e.target.value)
                  }
                  className="font-semibold text-green-800 text-base"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeSubcategory(idx)}
                  className="text-red-500 hover:bg-red-100"
                  title="Remove Subcategory"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-green-700">Packages</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addPackageToSubcategory(idx)}
                  className="border-green-300 text-green-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Package
                </Button>
              </div>
              <div className="space-y-4">
                {sub.packages.map((pkg, pIdx) => (
                  <div
                    key={pIdx}
                    className="border border-green-100 rounded-xl p-4 bg-white shadow-sm relative"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <Input
                        placeholder="Package name"
                        value={pkg.name}
                        onChange={(e) =>
                          handlePackageChangeInSubcategory(
                            idx,
                            pIdx,
                            "name",
                            e.target.value
                          )
                        }
                        className="font-semibold text-green-900"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removePackageFromSubcategory(idx, pIdx)}
                        className="text-red-500 hover:bg-red-100"
                        title="Remove Package"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        type="number"
                        placeholder="Price"
                        value={pkg.price}
                        onChange={(e) =>
                          handlePackageChangeInSubcategory(
                            idx,
                            pIdx,
                            "price",
                            e.target.value
                          )
                        }
                        className="text-green-700"
                      />
                      <Input
                        placeholder="Related Documents"
                        value={pkg.related_documents}
                        onChange={(e) =>
                          handlePackageChangeInSubcategory(
                            idx,
                            pIdx,
                            "related_documents",
                            e.target.value
                          )
                        }
                        className="text-green-700"
                      />
                    </div>
                    <Textarea
                      placeholder="Description"
                      value={pkg.desc}
                      onChange={(e) =>
                        handlePackageChangeInSubcategory(
                          idx,
                          pIdx,
                          "desc",
                          e.target.value
                        )
                      }
                      className="mt-3 text-green-700"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={addSubcategory}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Subcategory
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {packages.map((pkg, idx) => (
            <div
              key={idx}
              className="border border-green-200 rounded-2xl p-5 bg-green-50/50 shadow-sm relative"
            >
              <div className="flex justify-between items-center mb-2">
                <Input
                  placeholder="Package name"
                  value={pkg.name}
                  onChange={(e) =>
                    handlePackageChange(idx, "name", e.target.value)
                  }
                  className="font-semibold text-green-900"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removePackage(idx)}
                  className="text-red-500 hover:bg-red-100"
                  title="Remove Package"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Price"
                  value={pkg.price}
                  onChange={(e) =>
                    handlePackageChange(idx, "price", e.target.value)
                  }
                  className="text-green-700"
                />
                <Input
                  placeholder="Related Documents"
                  value={pkg.related_documents}
                  onChange={(e) =>
                    handlePackageChange(idx, "related_documents", e.target.value)
                  }
                  className="text-green-700"
                />
              </div>
              <Textarea
                placeholder="Description"
                value={pkg.desc}
                onChange={(e) =>
                  handlePackageChange(idx, "desc", e.target.value)
                }
                className="mt-3 text-green-700"
              />
            </div>
          ))}
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={addPackage}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Package
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}