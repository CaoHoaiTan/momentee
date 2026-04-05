import gql from 'graphql-tag';

export const quizTypeDefs = gql`
  type Quiz {
    id: ID!
    coupleId: ID!
    title: String!
    description: String
    isActive: Boolean!
    sortOrder: Int!
    questions: [QuizQuestion!]!
    createdAt: DateTime!
  }

  type QuizQuestion {
    id: ID!
    quizId: ID!
    question: String!
    options: [String!]!
    correctAnswer: Int
    sortOrder: Int!
  }

  type QuizResponse {
    id: ID!
    quizId: ID!
    respondentName: String!
    score: Int!
    totalQuestions: Int!
    createdAt: DateTime!
  }

  input QuizQuestionInput {
    question: String!
    options: [String!]!
    correctAnswer: Int!
  }

  input CreateQuizInput {
    title: String!
    description: String
    questions: [QuizQuestionInput!]!
  }

  input SubmitQuizInput {
    respondentName: String!
    answers: [Int!]!
  }

  extend type Query {
    quizzes(coupleId: ID!): [Quiz!]!
    quiz(id: ID!): Quiz
    quizLeaderboard(quizId: ID!): [QuizResponse!]!
  }

  extend type Mutation {
    createQuiz(coupleId: ID!, input: CreateQuizInput!): Quiz!
    deleteQuiz(id: ID!): Boolean!
    submitQuiz(quizId: ID!, input: SubmitQuizInput!): QuizResponse!
    reorderQuizzes(coupleId: ID!, quizIds: [ID!]!): Boolean!
  }
`;
