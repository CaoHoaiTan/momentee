import { gql } from '@apollo/client';

export const GET_QUIZZES = gql`
  query Quizzes($coupleId: ID!) {
    quizzes(coupleId: $coupleId) {
      id
      coupleId
      title
      description
      isActive
      createdAt
    }
  }
`;

export const GET_QUIZ = gql`
  query Quiz($id: ID!) {
    quiz(id: $id) {
      id
      coupleId
      title
      description
      isActive
      questions {
        id
        quizId
        question
        options
        correctAnswer
        sortOrder
      }
      createdAt
    }
  }
`;

export const GET_QUIZ_LEADERBOARD = gql`
  query QuizLeaderboard($quizId: ID!) {
    quizLeaderboard(quizId: $quizId) {
      id
      quizId
      respondentName
      score
      totalQuestions
      createdAt
    }
  }
`;
