import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Edit2, Trash2, Plus, Settings } from "lucide-react";
import type { Category, InsertCategory, UpdateCategory } from "@shared/schema";

const colorOptions = [
  { value: "bg-blue-100 text-blue-700", label: "Blue", class: "bg-blue-100 text-blue-700" },
  { value: "bg-green-100 text-green-700", label: "Green", class: "bg-green-100 text-green-700" },
  { value: "bg-purple-100 text-purple-700", label: "Purple", class: "bg-purple-100 text-purple-700" },
  { value: "bg-red-100 text-red-700", label: "Red", class: "bg-red-100 text-red-700" },
  { value: "bg-orange-100 text-orange-700", label: "Orange", class: "bg-orange-100 text-orange-700" },
  { value: "bg-pink-100 text-pink-700", label: "Pink", class: "bg-pink-100 text-pink-700" },
  { value: "bg-yellow-100 text-yellow-700", label: "Yellow", class: "bg-yellow-100 text-yellow-700" },
  { value: "bg-gray-100 text-gray-700", label: "Gray", class: "bg-gray-100 text-gray-700" },
];

export function CategoryManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryEmoji, setNewCategoryEmoji] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(colorOptions[0].value);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    retry: false,
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: InsertCategory) => {
      const response = await apiRequest("POST", "/api/categories", categoryData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setNewCategoryName("");
      setNewCategoryEmoji("");
      setNewCategoryColor(colorOptions[0].value);
      toast({
        title: "Category created! ✨",
        description: "Your new category has been added successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = `${import.meta.env.VITE_API_URL}/api/login`;
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateCategory }) => {
      const response = await apiRequest("PATCH", `/api/categories/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setEditingCategory(null);
      toast({
        title: "Category updated! ✨",
        description: "Your changes have been saved.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = `${import.meta.env.VITE_API_URL}/api/login`;
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Category deleted",
        description: "Category has been removed successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = `${import.meta.env.VITE_API_URL}/api/login`;
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim() || !newCategoryEmoji.trim()) return;

    createCategoryMutation.mutate({
      name: newCategoryName.trim(),
      emoji: newCategoryEmoji.trim(),
      color: newCategoryColor,
    });
  };

  const handleUpdateCategory = (category: Category, updates: UpdateCategory) => {
    updateCategoryMutation.mutate({
      id: category.id,
      updates,
    });
  };

  const handleDeleteCategory = (category: Category) => {
    if (window.confirm(`Are you sure you want to delete the "${category.name}" category?`)) {
      deleteCategoryMutation.mutate(category.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="p-2 hover:bg-purple-100 rounded-full transition-colors"
          data-testid="button-manage-categories"
        >
          <Settings className="h-4 w-4 text-purple-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-white/90 backdrop-blur-md border-purple-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Manage Categories
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Add New Category */}
          <form onSubmit={handleCreateCategory} className="space-y-4 p-4 bg-white/50 rounded-xl border border-purple-100">
            <h3 className="font-semibold text-gray-700">Add New Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="border-purple-200 focus:ring-2 focus:ring-purple-500"
                data-testid="input-new-category-name"
              />
              <Input
                placeholder="Emoji (e.g., 💼)"
                value={newCategoryEmoji}
                onChange={(e) => setNewCategoryEmoji(e.target.value)}
                className="border-purple-200 focus:ring-2 focus:ring-purple-500"
                data-testid="input-new-category-emoji"
                maxLength={2}
              />
              <select
                value={newCategoryColor}
                onChange={(e) => setNewCategoryColor(e.target.value)}
                className="px-3 py-2 border border-purple-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                data-testid="select-new-category-color"
              >
                {colorOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="submit"
              disabled={!newCategoryName.trim() || !newCategoryEmoji.trim() || createCategoryMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              data-testid="button-create-category"
            >
              <Plus className="h-4 w-4 mr-2" />
              {createCategoryMutation.isPending ? "Adding..." : "Add Category"}
            </Button>
          </form>

          {/* Existing Categories */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Your Categories</h3>
            {isLoading ? (
              <div className="text-center py-4 text-gray-500">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No categories yet. Create your first one above!</div>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-purple-100"
                    data-testid={`category-item-${category.id}`}
                  >
                    {editingCategory?.id === category.id ? (
                      <CategoryEditForm
                        category={category}
                        onSave={(updates) => handleUpdateCategory(category, updates)}
                        onCancel={() => setEditingCategory(null)}
                        colorOptions={colorOptions}
                      />
                    ) : (
                      <>
                        <div className="flex items-center space-x-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${category.color}`}
                            data-testid={`category-display-${category.id}`}
                          >
                            {category.emoji} {category.name}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingCategory(category)}
                            className="p-1.5 hover:bg-gray-200 rounded-lg"
                            data-testid={`button-edit-category-${category.id}`}
                          >
                            <Edit2 className="h-4 w-4 text-gray-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(category)}
                            disabled={deleteCategoryMutation.isPending}
                            className="p-1.5 hover:bg-red-200 rounded-lg"
                            data-testid={`button-delete-category-${category.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface CategoryEditFormProps {
  category: Category;
  onSave: (updates: UpdateCategory) => void;
  onCancel: () => void;
  colorOptions: Array<{ value: string; label: string; class: string }>;
}

function CategoryEditForm({ category, onSave, onCancel, colorOptions }: CategoryEditFormProps) {
  const [name, setName] = useState(category.name);
  const [emoji, setEmoji] = useState(category.emoji);
  const [color, setColor] = useState(category.color);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !emoji.trim()) return;

    onSave({
      name: name.trim(),
      emoji: emoji.trim(),
      color,
    });
  };

  return (
    <form onSubmit={handleSave} className="flex-1 flex items-center space-x-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 border-purple-200 focus:ring-2 focus:ring-purple-500"
        data-testid={`input-edit-category-name-${category.id}`}
      />
      <Input
        value={emoji}
        onChange={(e) => setEmoji(e.target.value)}
        className="w-16 border-purple-200 focus:ring-2 focus:ring-purple-500"
        data-testid={`input-edit-category-emoji-${category.id}`}
        maxLength={2}
      />
      <select
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="px-2 py-1 border border-purple-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        data-testid={`select-edit-category-color-${category.id}`}
      >
        {colorOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Button
        type="submit"
        size="sm"
        className="bg-green-600 hover:bg-green-700 text-white"
        data-testid={`button-save-category-${category.id}`}
      >
        Save
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onCancel}
        className="hover:bg-gray-200"
        data-testid={`button-cancel-category-${category.id}`}
      >
        Cancel
      </Button>
    </form>
  );
}