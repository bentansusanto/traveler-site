import {
  Briefcase,
  Compass,
  FileCheck2,
  FileText,
  Globe,
  GraduationCap,
  LayoutGrid,
  Plane,
  Sparkles,
  LucideIcon
} from "lucide-react";

export const getCategoryIcon = (iconName?: string): LucideIcon => {
  switch (iconName) {
    case "LayoutGrid":
      return LayoutGrid;
    case "Compass":
      return Compass;
    case "FileCheck2":
    case "Briefcase":
      return FileCheck2;
    case "Sparkles":
      return Sparkles;
    case "GraduationCap":
      return GraduationCap;
    case "Globe":
      return Globe;
    case "Plane":
      return Plane;
    case "FileText":
    default:
      return FileText;
  }
};
