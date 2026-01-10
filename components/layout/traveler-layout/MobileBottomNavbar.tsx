"use client";

import { BottomNavMenu } from "@/lib/menus/bottom-nav";
import { cn } from "@/lib/utils";
import { setHasNewBooking } from "@/store/slices/uiSlice";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

export const MobileBottomNavbar = () => {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { hasNewBooking } = useSelector((state: any) => state.ui);

  return (
    <div className="pb-safe fixed right-0 bottom-0 left-0 z-50 flex h-16 items-center justify-around border-t bg-white px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:hidden">
      {BottomNavMenu.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        const isOrders = item.href === "/my-bookings" || item.title === "Your Orders";

        return (
          <Link
            key={item.title}
            href={item.href}
            onClick={() => {
              if (isOrders) {
                dispatch(setHasNewBooking(false));
              }
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-colors",
              isActive ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
            )}>
            <div className="relative">
              <Icon className={cn("size-6", isActive && "fill-blue-600/10")} />
              {isOrders && hasNewBooking && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{item.title}</span>
          </Link>
        );
      })}
    </div>
  );
};
