import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  subtitle: string;
  onAddClick?: () => void;
  addButtonText?: string;
}

export function Header({ title, subtitle, onAddClick, addButtonText }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          {onAddClick && (
            <Button onClick={onAddClick}>
              <Plus className="w-4 h-4 mr-2" />
              {addButtonText || "Add"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
