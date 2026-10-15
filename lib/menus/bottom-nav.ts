import { ClipboardList, ListChecks, Home, Ticket, User } from "lucide-react";

export const BottomNavMenu = [
  {
    title: "Beranda",
    href: "/",
    icon: Home
  },
  {
    title: "Itinerary",
    href: "/itineraries",
    icon: ListChecks
  },
  {
    title: "Orders",
    href: "/orders",
    icon: Ticket
  },
  {
    title: "Booking",
    href: "/my-bookings",
    icon: ClipboardList
  },
  {
    title: "Akun",
    href: "/profile",
    icon: User
  }
];
