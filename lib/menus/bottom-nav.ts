import { Gem, Heart, Home, Ticket, User } from "lucide-react";

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
    title: "Your Orders",
    href: "/my-bookings",
    icon: Ticket
  },
  {
    title: "Rewards",
    href: "/rewards",
    icon: Gem
  },
  {
    title: "Akun",
    href: "/profile",
    icon: User
  }
];
