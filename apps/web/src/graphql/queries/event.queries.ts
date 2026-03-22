import { gql } from '@apollo/client';

export const GET_EVENTS = gql`
  query Events($coupleId: ID!) {
    events(coupleId: $coupleId) {
      id
      coupleId
      title
      description
      location
      startDate
      endDate
      coverPhoto
      isPublic
      maxGuests
      rsvps {
        id
        name
        status
        plusOne
      }
      createdAt
    }
  }
`;

export const GET_EVENT = gql`
  query Event($id: ID!) {
    event(id: $id) {
      id
      coupleId
      title
      description
      location
      startDate
      endDate
      coverPhoto
      isPublic
      maxGuests
      rsvps {
        id
        eventId
        name
        email
        status
        plusOne
        note
        createdAt
      }
      createdAt
    }
  }
`;

export const GET_RSVPS = gql`
  query Rsvps($eventId: ID!) {
    rsvps(eventId: $eventId) {
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
