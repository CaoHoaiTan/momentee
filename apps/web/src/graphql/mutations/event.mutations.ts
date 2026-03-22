import { gql } from '@apollo/client';

export const CREATE_EVENT = gql`
  mutation CreateEvent($coupleId: ID!, $input: CreateEventInput!) {
    createEvent(coupleId: $coupleId, input: $input) {
      id
      coupleId
      title
      description
      location
      startDate
      endDate
      isPublic
      maxGuests
      createdAt
    }
  }
`;

export const UPDATE_EVENT = gql`
  mutation UpdateEvent($id: ID!, $input: UpdateEventInput!) {
    updateEvent(id: $id, input: $input) {
      id
      coupleId
      title
      description
      location
      startDate
      endDate
      isPublic
      maxGuests
      createdAt
    }
  }
`;

export const DELETE_EVENT = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`;

export const CREATE_RSVP = gql`
  mutation CreateRsvp($eventId: ID!, $input: CreateRsvpInput!) {
    createRsvp(eventId: $eventId, input: $input) {
      id
      eventId
      name
      email
      status
      plusOne
      note
      createdAt
    }
  }
`;

export const DELETE_RSVP = gql`
  mutation DeleteRsvp($id: ID!) {
    deleteRsvp(id: $id)
  }
`;
