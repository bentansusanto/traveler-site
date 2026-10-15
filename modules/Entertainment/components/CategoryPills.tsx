"use client";

import { EntertainmentCategory } from "@/store/services/entertainment-attraction.service";
import { Sparkles } from "lucide-react";
import React from "react";

interface CategoryPillsProps {
  categories: EntertainmentCategory[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
  allLabel: string;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  allLabel
}) => {
  return (
    <div className="w-full border-b border-slate-200/80 bg-white sticky top-0 z-10 shadow-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto py-3.5 scrollbar-none">
          {/* All Attractions Pill */}
          <button
            type="button"
            onClick={() => onSelectCategory("all")}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 ${
              activeCategoryId === "all"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200/70 hover:text-slate-900"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{allLabel}</span>
          </button>

          {/* Dynamic Categories */}
          {categories.map((category) => {
            const isActive = activeCategoryId === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onSelectCategory(category.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200/70 hover:text-slate-900"
                }`}
              >
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
