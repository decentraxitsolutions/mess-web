"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { History, Search, Calendar } from "lucide-react";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function MealsClient({ initialLogs, filteredDate }) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedDate, setSelectedDate] = useState(filteredDate);
  const [search, setSearch] = useState("");
  const [mealFilter, setMealFilter] = useState("ALL");

  useEffect(() => {
    setSelectedDate(filteredDate);
  }, [filteredDate]);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    if (newDate) {
      router.push(`${pathname}?date=${newDate}`);
    }
  };

  const filteredLogs = initialLogs.filter((log) => {
    const name = (log.user.name || "").toLowerCase();
    const email = (log.user.email || "").toLowerCase();
    const term = search.toLowerCase();
    
    const matchesSearch = name.includes(term) || email.includes(term);
    const matchesFilter = mealFilter === "ALL" || log.mealType === mealFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meal Attendance Logs</h1>
        <p className="text-muted-foreground">Historical records of all dinner/lunch check-ins and deductions.</p>
      </div>

      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>Filter and search check-ins.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground" />
              <Input
                placeholder="Search by diner name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="w-full sm:w-48 relative">
              <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="pl-10 h-10"
              />
            </div>

            <div className="w-full sm:w-48">
              <select
                value={mealFilter}
                onChange={(e) => setMealFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
              >
                <option value="ALL">All Meals</option>
                <option value="BREAKFAST">Breakfast</option>
                <option value="LUNCH">Lunch</option>
                <option value="DINNER">Dinner</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl bg-card">
              <History className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <h3 className="font-bold text-lg">No Scan Records</h3>
              <p className="text-muted-foreground text-sm">No meal logs match your search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Diner Name</TableHead>
                    <TableHead>Email Reference</TableHead>
                    <TableHead>Meal Type</TableHead>
                    <TableHead>Check-in Date</TableHead>
                    <TableHead>Check-in Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => {
                    const dateObj = new Date(log.createdAt);
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-semibold text-foreground">{log.user.name || "N/A"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{log.user.email}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            log.mealType === "BREAKFAST" 
                              ? "bg-amber-50 text-amber-700" 
                              : log.mealType === "LUNCH" 
                              ? "bg-indigo-50 text-indigo-700" 
                              : "bg-orange-50 text-orange-700"
                          }`}>
                            {log.mealType}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-foreground font-medium">
                          {dateObj.toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
