import { createId } from '@paralleldrive/cuid2';
import { db } from '../config/database.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

interface CreateQuizInput {
  title: string;
  description?: string;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
}

interface SubmitQuizInput {
  respondentName: string;
  answers: number[]; // index of chosen option per question
}

export async function createQuiz(coupleId: string, userId: string, input: CreateQuizInput) {
  await verifyCoupleOwnership(coupleId, userId);

  return db.transaction().execute(async (trx) => {
    const quiz = await trx
      .insertInto('quizzes')
      .values({
        id: createId(),
        couple_id: coupleId,
        title: input.title,
        description: input.description ?? null,
        is_active: true,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    for (let i = 0; i < input.questions.length; i++) {
      const q = input.questions[i];
      await trx
        .insertInto('quiz_questions')
        .values({
          id: createId(),
          quiz_id: quiz.id,
          question: q.question,
          options: JSON.stringify(q.options),
          correct_answer: q.correctAnswer,
          sort_order: i,
        })
        .execute();
    }

    return quiz;
  });
}

export async function getQuizById(id: string) {
  const quiz = await db
    .selectFrom('quizzes')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  if (!quiz) throw NotFoundError('Quiz');
  return quiz;
}

export async function listQuizzesByCoupleId(coupleId: string) {
  return db
    .selectFrom('quizzes')
    .selectAll()
    .where('couple_id', '=', coupleId)
    .orderBy('sort_order', 'asc')
    .execute();
}

export async function reorderQuizzes(coupleId: string, userId: string, quizIds: string[]) {
  await verifyCoupleOwnership(coupleId, userId);

  await Promise.all(
    quizIds.map((id, i) =>
      db.updateTable('quizzes')
        .set({ sort_order: i })
        .where('id', '=', id)
        .where('couple_id', '=', coupleId)
        .execute(),
    ),
  );

  return true;
}

export async function getQuestions(quizId: string) {
  return db
    .selectFrom('quiz_questions')
    .selectAll()
    .where('quiz_id', '=', quizId)
    .orderBy('sort_order', 'asc')
    .execute();
}

export async function submitQuiz(quizId: string, input: SubmitQuizInput) {
  const quiz = await getQuizById(quizId);
  if (!quiz.is_active) throw ForbiddenError('This quiz is no longer active');

  const questions = await getQuestions(quizId);

  let score = 0;
  for (let i = 0; i < questions.length; i++) {
    if (input.answers[i] === questions[i].correct_answer) {
      score++;
    }
  }

  const response = await db
    .insertInto('quiz_responses')
    .values({
      id: createId(),
      quiz_id: quizId,
      respondent_name: input.respondentName,
      score,
      total_questions: questions.length,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return response;
}

export async function getLeaderboard(quizId: string) {
  return db
    .selectFrom('quiz_responses')
    .selectAll()
    .where('quiz_id', '=', quizId)
    .orderBy('score', 'desc')
    .orderBy('created_at', 'asc')
    .limit(20)
    .execute();
}

export async function removeQuiz(id: string, userId: string) {
  const quiz = await getQuizById(id);
  await verifyCoupleOwnership(quiz.couple_id, userId);
  await db.deleteFrom('quizzes').where('id', '=', id).execute();
  return true;
}

async function verifyCoupleOwnership(coupleId: string, userId: string) {
  const couple = await db
    .selectFrom('couples')
    .select(['partner1_id', 'partner2_id'])
    .where('id', '=', coupleId)
    .executeTakeFirst();

  if (!couple) throw NotFoundError('Couple');
  if (couple.partner1_id !== userId && couple.partner2_id !== userId) {
    throw ForbiddenError('You are not a member of this couple');
  }
}
