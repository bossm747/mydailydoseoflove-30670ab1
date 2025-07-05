import SharedCalendar from "@/components/calendar/SharedCalendar";

export default function Calendar() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <SharedCalendar />
      </main>
    </div>
  );
}