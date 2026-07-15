"use client";

import { useRouter, usePathname } from "next/navigation";
import { Calendar } from "lucide-react";

export default function DashboardDateFilter({ initialDate }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleDateChange = (val) => {
    if (val) {
      router.push(`${pathname}?date=${val}`);
    }
  };

  return (
    <div className="flex items-center gap-2.5 bg-white/10 px-4 py-2 rounded-full border border-white/20 shadow-inner backdrop-blur-sm w-full max-w-[200px]">
      <Calendar className="h-4.5 w-4.5 text-indigo-200 shrink-0" />
      <input
        type="date"
        value={initialDate}
        onChange={(e) => handleDateChange(e.target.value)}
        className="w-full text-xs font-bold text-white focus:outline-none bg-transparent [color-scheme:dark]"
      />
    </div>
  );
}
