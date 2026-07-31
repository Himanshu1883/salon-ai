"use client";

import { useState } from "react";
import { createStockCategory } from "@/actions/stock-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

export type StockCategoryOption = {
  id: string;
  name: string;
};

export function StockCategorySelect({
  categories,
  value,
  onValueChange,
  onCategoryCreated,
}: {
  categories: StockCategoryOption[];
  value: string;
  onValueChange: (categoryId: string) => void;
  onCategoryCreated?: (category: StockCategoryOption) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAddCategory() {
    if (!newName.trim()) return;
    setLoading(true);
    setError("");

    const result = await createStockCategory(newName.trim());
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.category) {
      onCategoryCreated?.(result.category);
      onValueChange(result.category.id);
      setNewName("");
      setAdding(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="category">Category</Label>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 hover:underline"
          >
            <Plus className="h-3 w-3" />
            Add category
          </button>
        )}
      </div>

      {adding ? (
        <div className="space-y-2 rounded-lg border border-stone-200 p-3">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Category name"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleAddCategory();
              }
            }}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              disabled={loading || !newName.trim()}
              onClick={() => void handleAddCategory()}
            >
              {loading ? "Saving..." : "Save category"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={loading}
              onClick={() => {
                setAdding(false);
                setNewName("");
                setError("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id} className="capitalize">
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
