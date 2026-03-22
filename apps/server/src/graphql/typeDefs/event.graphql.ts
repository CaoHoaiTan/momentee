import gql from 'graphql-tag';

export const eventTypeDefs = gql`
  type Event {
    id: ID!
    coupleId: ID!
    title: String!
    description: String
    location: String
    startDate: DateTime!
    endDate: DateTime
    coverPhoto: String
    isPublic: Boolean!
    maxGuests: Int
    rsvps: [Rsvp!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum RsvpStatus {
    ATTENDING
    MAYBE
    DECLINED
  }

  type Rsvp {
    id: ID!
    eventId: ID!
    name: String!
    email: String
    status: RsvpStatus!
    plusOne: Boolean!
    note: String
    createdAt: DateTime!
  }

  input CreateEventInput {
    title: String!
    description: String
    location: String
    startDate: String!
    endDate: String
    coverPhoto: String
    isPublic: Boolean
    maxGuests: Int
  }

  input UpdateEventInput {
    title: String
    description: String
    location: String
    startDate: String
    endDate: String
    coverPhoto: String
    isPublic: Boolean
    maxGuests: Int
  }

  input CreateRsvpInput {
    name: String!
    email: String
    status: RsvpStatus
    plusOne: Boolean
    note: String
  }

  extend type Query {
    events(coupleId: ID!): [Event!]!
    event(id: ID!): Event
    rsvps(eventId: ID!): [Rsvp!]!
  }

  extend type Mutation {
    createEvent(coupleId: ID!, input: CreateEventInput!): Event!
    updateEvent(id: ID!, input: UpdateEventInput!): Event!
    deleteEvent(id: ID!): Boolean!
    createRsvp(eventId: ID!, input: CreateRsvpInput!): Rsvp!
    deleteRsvp(id: ID!): Boolean!
  }
`;
