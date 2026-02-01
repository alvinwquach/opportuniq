/**
 * Schedule GraphQL Type Definitions
 */

export const scheduleTypes = /* GraphQL */ `
  type DiySchedule {
    id: ID!
    scheduledTime: DateTime!
    estimatedDuration: Int
    participants: [ID!]
    participantMembers: [GroupMember!]!
    calendarEventId: String
    createdAt: DateTime!
    updatedAt: DateTime!
    issue: Issue!
    createdBy: GroupMember!
  }

  type ScheduleWithDetails {
    id: ID!
    scheduledTime: DateTime!
    estimatedDuration: Int
    participants: [ID!]
    participantMembers: [GroupMember!]!
    calendarEventId: String
    createdAt: DateTime!
    issueId: ID!
    issueTitle: String
    groupId: ID!
    groupName: String
    createdBy: GroupMember!
  }
`;

export const scheduleInputs = /* GraphQL */ `
  input CreateScheduleInput {
    issueId: ID!
    scheduledTime: DateTime!
    estimatedDuration: Int
    participants: [ID!]
  }

  input UpdateScheduleInput {
    scheduledTime: DateTime
    estimatedDuration: Int
    participants: [ID!]
  }
`;

export const scheduleQueries = /* GraphQL */ `
  extend type Query {
    "Get a schedule by ID"
    schedule(id: ID!): DiySchedule

    "Get user's schedules within a date range"
    mySchedules(startDate: DateTime, endDate: DateTime): [ScheduleWithDetails!]!

    "Get schedules for a specific group"
    groupSchedules(groupId: ID!, startDate: DateTime, endDate: DateTime): [ScheduleWithDetails!]!

    "Get issues available for scheduling in a group"
    issuesForScheduling(groupId: ID!): [Issue!]!
  }
`;

export const scheduleMutations = /* GraphQL */ `
  extend type Mutation {
    "Create a new DIY schedule"
    createSchedule(input: CreateScheduleInput!): DiySchedule!

    "Update an existing schedule"
    updateSchedule(id: ID!, input: UpdateScheduleInput!): DiySchedule!

    "Delete a schedule"
    deleteSchedule(id: ID!): Boolean!
  }
`;
