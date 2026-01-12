import { ClipboardList, Gem, Heart, Home, Ticket, User } from "lucide-react";

export const BottomNavMenu = [
  {
    title: "Beranda",
    href: "/",
    icon: Home
  },
  {
    title: "Wishlist",
    href: "/wishlist",
    icon: Heart
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
