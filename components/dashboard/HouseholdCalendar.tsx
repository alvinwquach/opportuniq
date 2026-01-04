"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IoHome, IoBriefcase, IoConstruct, IoPeople, IoTime } from "react-icons/io5";

type EventType = "contractor" | "diy" | "wfh" | "away";

interface CalendarEvent {
  date: Date;
  type: EventType;
  title: string;
  time?: string;
  members?: string[];
  description?: string;
}

// Example events - replace with real data from your database
const sampleEvents: CalendarEvent[] = [
  {
    date: new Date(2025, 0, 22), // Jan 22
    type: "contractor",
    title: "Plumber Visit",
    time: "2:00 PM - 4:00 PM",
    description: "Bay Area Plumbing - Water heater inspection",
  },
  {
    date: new Date(2025, 0, 24), // Jan 24
    type: "wfh",
    title: "Sarah WFH",
    members: ["Sarah"],
    description: "Available for contractor visits",
  },
  {
    date: new Date(2025, 0, 26), // Jan 26
    type: "diy",
    title: "Ceiling Fan Installation",
    time: "10:00 AM",
    members: ["John", "Sarah"],
    description: "Need 2 people - coordinated schedule",
  },
];

const eventConfig = {
  contractor: {
    icon: IoConstruct,
    label: "Contractor Visit",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  diy: {
    icon: IoPeople,
    label: "DIY Task",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  wfh: {
    icon: IoHome,
    label: "Working From Home",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  away: {
    icon: IoBriefcase,
    label: "Away",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  },
};

export function HouseholdCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events] = useState<CalendarEvent[]>(sampleEvents);

  // Get events for selected date
  const selectedEvents = events.filter(
    (event) =>
      selectedDate &&
      event.date.getDate() === selectedDate.getDate() &&
      event.date.getMonth() === selectedDate.getMonth() &&
      event.date.getFullYear() === selectedDate.getFullYear()
  );

  // Get dates that have events for calendar highlighting
  const datesWithEvents = events.map((event) => event.date);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Household Schedule</CardTitle>
          <CardDescription>
            Coordinate contractor visits, DIY tasks, and availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              hasEvent: datesWithEvents,
            }}
            modifiersClassNames={{
              hasEvent: "bg-primary/10 font-semibold",
            }}
          />

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-2">
            {Object.entries(eventConfig).map(([type, config]) => (
              <div key={type} className="flex items-center gap-2 text-sm">
                <config.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{config.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {selectedDate ? selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric"
            }) : "Select a date"}
          </CardTitle>
          <CardDescription>
            {selectedEvents.length === 0
              ? "No events scheduled"
              : `${selectedEvents.length} event${selectedEvents.length > 1 ? "s" : ""}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedEvents.length === 0 ? (
            <div className="text-center py-8">
              <IoTime className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                No events scheduled for this day
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedEvents.map((event, i) => {
                const config = eventConfig[event.type];
                const Icon = config.icon;

                return (
                  <div
                    key={i}
                    className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{event.title}</h4>
                          <Badge variant="secondary" className={config.color}>
                            {config.label}
                          </Badge>
                        </div>

                        {event.time && (
                          <p className="text-sm text-muted-foreground mb-2">
                            <IoTime className="h-3 w-3 inline mr-1" />
                            {event.time}
                          </p>
                        )}

                        {event.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {event.description}
                          </p>
                        )}

                        {event.members && event.members.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <IoPeople className="h-3 w-3 text-muted-foreground" />
                            <div className="flex gap-1">
                              {event.members.map((member, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground"
                                >
                                  {member}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
