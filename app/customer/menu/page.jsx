import { getCustomerMenu } from "@/actions/menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, CalendarDays, ShieldAlert, Award, Sparkles } from "lucide-react";

const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY"
];

export const dynamic = "force-dynamic";

export default async function CustomerMenuPage() {
  const res = await getCustomerMenu();

  if (!res.success) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h3 className="text-xl font-bold">Error Loading Menu</h3>
        <p className="text-muted-foreground">{res.error}</p>
      </div>
    );
  }

  const { menuItems } = res;

  // Check if menu is globally disabled (any item is status INACTIVE, or all are INACTIVE)
  const isMenuDisabled = menuItems.length > 0 && menuItems.every(item => item.status === "INACTIVE");

  if (isMenuDisabled || menuItems.length === 0) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center border-2 border-dashed rounded-2xl bg-card p-6">
        <Utensils className="h-12 w-12 text-muted-foreground opacity-50 animate-bounce" />
        <h3 className="text-xl font-bold">Menu Offline</h3>
        <p className="text-muted-foreground max-w-sm">
          The menu planner is currently offline or hasn't been set up yet by your Mess Coordinator.
        </p>
      </div>
    );
  }

  const dailyMenu = menuItems.find(item => item.type === "DAILY" && item.status === "ACTIVE");
  const weeklyMenu = menuItems.filter(item => item.type === "WEEKLY" && item.status === "ACTIVE");

  // Helper to format date strings for comparison in Asia/Kolkata
  const getKolkataDateString = (date) => {
    return new Date(date).toLocaleDateString("en-US", { timeZone: "Asia/Kolkata" });
  };

  const todayStr = getKolkataDateString(new Date());

  // Find active festival menu scheduled for today
  const todayFestivalMenu = menuItems.find(item => 
    item.type === "FESTIVAL" && 
    item.status === "ACTIVE" && 
    getKolkataDateString(item.date) === todayStr
  );

  // Find all festival menus scheduled for the current month
  const todayObj = new Date();
  const formatterMonth = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", month: "numeric" });
  const formatterYear = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", year: "numeric" });
  const currentMonth = formatterMonth.format(todayObj);
  const currentYear = formatterYear.format(todayObj);

  const monthlyFestivalMenus = menuItems.filter(item => {
    if (item.type !== "FESTIVAL" || item.status !== "ACTIVE") return false;
    const itemDate = new Date(item.date);
    const itemMonth = formatterMonth.format(itemDate);
    const itemYear = formatterYear.format(itemDate);
    return itemMonth === currentMonth && itemYear === currentYear;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Today's Menu & Schedule</h1>
        <p className="text-muted-foreground">Keep track of your weekly meal plans and check daily specials.</p>
      </div>

      {/* Today's Festival Menu Banner */}
      {todayFestivalMenu && (
        <Card className="border-amber-200 bg-amber-50/20 shadow-md border-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
              <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" /> Today's Festival Special Feast!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <h3 className="text-xl font-extrabold text-amber-950">{todayFestivalMenu.title}</h3>
            <p className="text-sm text-neutral-800 leading-relaxed font-medium">
              {todayFestivalMenu.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Daily Special Banner */}
      {dailyMenu && (
        <Card className="border-orange-200 bg-orange-50/20 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
              <Award className="h-5 w-5 animate-pulse" /> Today's Special Broadcast
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">{dailyMenu.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {dailyMenu.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Weekly Schedule */}
      <Card className="shadow-md bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-indigo-600" /> Weekly Dine Planner
            </CardTitle>
            <CardDescription>Scheduled menu plan for the week</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DAYS_OF_WEEK.map((day) => {
              const entry = weeklyMenu.find(item => item.day === day);
              return (
                <div key={day} className={`rounded-xl border p-4 transition-all ${entry ? "bg-card shadow-sm border-indigo-100/50 hover:shadow-md" : "bg-muted/15 border-dashed border-2 flex flex-col justify-center items-center py-6"}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {day}
                    </span>
                    {entry && (
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-indigo-600" />
                    )}
                  </div>
                  
                  {entry ? (
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-sm text-foreground">{entry.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {entry.description || "No items listed."}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <span className="text-[11px] font-semibold text-muted-foreground/60">No plan published</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Festivals & Special Events of the Month */}
      {monthlyFestivalMenus.length > 0 && (
        <Card className="shadow-md bg-card border-amber-100">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-amber-900">
              <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" /> Festival & Event Specials This Month
            </CardTitle>
            <CardDescription>Plan your month with upcoming festival feasts</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {monthlyFestivalMenus.map((item) => {
                const isToday = getKolkataDateString(item.date) === todayStr;
                return (
                  <div key={item.id} className={`rounded-xl border p-4 transition-all ${isToday ? "bg-amber-50/30 border-amber-300 shadow-sm" : "bg-card border-neutral-100 shadow-sm"}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        {new Date(item.date).toLocaleDateString("en-US", { timeZone: "Asia/Kolkata", dateStyle: "medium" })}
                      </span>
                      {isToday && (
                        <span className="text-[10px] font-bold text-amber-600 animate-pulse uppercase">TODAY</span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-extrabold text-sm text-neutral-800">{item.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
