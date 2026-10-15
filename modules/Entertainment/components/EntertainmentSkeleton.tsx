"use client";

import React from "react";

interface EntertainmentSkeletonProps {
  count?: number;
}

export const EntertainmentSkeleton: React.FC<EntertainmentSkeletonProps> = ({
  count = 8
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-xs animate-pulse"
        >
          {/* Image skeleton */}
          <div className="aspect-[16/10] w-full bg-slate-200" />

          {/* Card Body */}
          <div className="flex flex-1 flex-col p-4 sm:p-5 space-y-3">
            {/* Title skeleton */}
            <div className="h-4 bg-slate-200 rounded-md w-3/4" />
            <div className="h-3 bg-slate-100 rounded-md w-1/2" />

            {/* Badges skeleton */}
            <div className="flex gap-2 pt-2">
              <div className="h-5 bg-slate-200 rounded-md w-20" />
              <div className="h-5 bg-slate-100 rounded-md w-16" />
            </div>

            {/* Price & CTA skeleton */}
            <div className="mt-auto pt-4 flex items-end justify-between border-t border-slate-100">
              <div className="space-y-1">
                <div className="h-3 bg-slate-100 rounded-md w-14" />
                <div className="h-5 bg-slate-200 rounded-md w-24" />
              </div>
              <div className="h-8 bg-slate-200 rounded-xl w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
