import { gql } from '@apollo/client';

export const CREATE_QUIZ = gql`
  mutation CreateQuiz($coupleId: ID!, $input: CreateQuizInput!) {
    createQuiz(coupleId: $coupleId, input: $input) {
      id
      coupleId
      title
      description
      isActive
      createdAt
    }
  }
`;

export const DELETE_QUIZ = gql`
  mutation DeleteQuiz($id: ID!) {
    deleteQuiz(id: $id)
  }
`;

export const SUBMIT_QUIZ = gql`
  mutation SubmitQuiz($quizId: ID!, $input: SubmitQuizInput!) {
    submitQuiz(quizId: $quizId, input: $input) {
      id
      quizId
      respondentName
      score
      totalQuestions
      createdAt
    }
  }
`;
