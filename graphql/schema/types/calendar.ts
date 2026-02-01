/**
 * Calendar GraphQL Type Definitions
 */

export const calendarTypes = /* GraphQL */ `
  "Event type for calendar events"
  enum CalendarEventType {
    contractor
    diy
    reminder
    income
    expense
  }

  "A calendar event"
  type CalendarEventDetail {
    id: ID!
    title: String!
    date: String!
    time: String
    type: CalendarEventType!
    isRecurring: Boolean
    recurringPattern: String
    location: String
    assignee: String
    notes: String
    estimatedCost: Float
    reminder: String
    linkedIssueId: ID
    linkedIssueTitle: String
    groupId: ID
    groupName: String
  }

  "Stats for the current month"
  type CalendarMonthStats {
    scheduledEvents: Int!
    completedEvents: Int!
    proVisits: Int!
    diyProjects: Int!
    reminders: Int!
  }

  "Upcoming expense for calendar sidebar"
  type CalendarUpcomingExpense {
    id: ID!
    title: String!
    date: String!
    amount: Float!
    type: CalendarEventType!
  }

  "Event type distribution for pie chart"
  type CalendarEventTypeDistribution {
    name: String!
    value: Int!
    color: String!
  }

  "Weekly activity data for bar chart"
  type CalendarWeeklyActivity {
    week: String!
    events: Int!
    expenses: Float!
  }

  "Monthly comparison data for area chart"
  type CalendarMonthlyComparison {
    month: String!
    events: Int!
    completed: Int!
  }

  "Comprehensive data for the calendar page view"
  type CalendarPageData {
    # All events for the current user's groups
    events: [CalendarEventDetail!]!

    # Stats for this month
    monthStats: CalendarMonthStats!

    # Upcoming expenses
    upcomingExpenses: [CalendarUpcomingExpense!]!
    totalUpcomingExpenses: Float!

    # Chart data
    eventTypeDistribution: [CalendarEventTypeDistribution!]!
    weeklyActivity: [CalendarWeeklyActivity!]!
    monthlyComparison: [CalendarMonthlyComparison!]!

    # Upcoming events for sidebar
    upcomingEvents: [CalendarEventDetail!]!

    # Issues available for linking
    schedulableIssues: [CalendarSchedulableIssue!]!
  }

  "Issue available for scheduling"
  type CalendarSchedulableIssue {
    id: ID!
    title: String!
    groupName: String!
    status: String!
  }
`;

export const calendarQueries = /* GraphQL */ `
  extend type Query {
    "Get comprehensive data for the calendar page view"
    calendarPageData(year: Int, month: Int): CalendarPageData!
  }
`;

export const calendarMutations = /* GraphQL */ `
  extend type Mutation {
    "Create a new calendar event"
    createCalendarEvent(input: CreateCalendarEventInput!): CalendarEventDetail!

    "Update a calendar event"
    updateCalendarEvent(id: ID!, input: UpdateCalendarEventInput!): CalendarEventDetail!

    "Delete a calendar event"
    deleteCalendarEvent(id: ID!): Boolean!
  }

  input CreateCalendarEventInput {
    title: String!
    date: String!
    time: String
    type: CalendarEventType!
    isRecurring: Boolean
    recurringPattern: String
    location: String
    notes: String
    estimatedCost: Float
    reminder: String
    linkedIssueId: ID
  }

  input UpdateCalendarEventInput {
    title: String
    date: String
    time: String
    type: CalendarEventType
    isRecurring: Boolean
    recurringPattern: String
    location: String
    notes: String
    estimatedCost: Float
    reminder: String
    linkedIssueId: ID
  }
`;
