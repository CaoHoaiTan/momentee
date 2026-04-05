'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client/react';
import { useToast } from '../../../../lib/toast-context';
import { useAuth } from '../../../../hooks/useAuth';
import { useCouple } from '../../../../hooks/useCouple';
import { GET_QUIZZES, GET_QUIZ_LEADERBOARD } from '../../../../graphql/queries/quiz.queries';
import { CREATE_QUIZ, DELETE_QUIZ, REORDER_QUIZZES } from '../../../../graphql/mutations/quiz.mutations';
import { ConfirmModal } from '../../../../components/ui/confirm-modal';
import { Button } from '../../../../components/ui/button';
import { LoadingSpinner } from '../../../../components/ui/loading-spinner';

interface QuizData {
  id: string;
  coupleId: string;
  title: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

interface QuestionInput {
  question: string;
  options: string[];
  correctAnswer: number;
}

export default function QuizPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { couple, loading: coupleLoading } = useCouple();
  const { showError, showSuccess } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  // Quiz form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<QuestionInput[]>([
    { question: '', options: ['', '', '', ''], correctAnswer: 0 },
  ]);

  useEffect(() => {
    if (authLoading || coupleLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
    } else if (!couple) {
      router.push('/onboarding');
    }
  }, [authLoading, coupleLoading, isAuthenticated, couple, router]);

  const { data, loading: quizzesLoading } = useQuery<{ quizzes: QuizData[] }>(GET_QUIZZES, {
    variables: { coupleId: couple?.id },
    skip: !couple?.id,
  });

  const { data: leaderboardData } = useQuery<{
    quizLeaderboard: { id: string; respondentName: string; score: number; totalQuestions: number; createdAt: string }[];
  }>(GET_QUIZ_LEADERBOARD, {
    variables: { quizId: selectedQuiz },
    skip: !selectedQuiz,
  });

  const [createQuiz, { loading: creating }] = useMutation(CREATE_QUIZ, {
    refetchQueries: [{ query: GET_QUIZZES, variables: { coupleId: couple?.id } }],
    onError: (error) => showError(error.message),
    onCompleted: () => showSuccess('Quiz created!'),
  });

  const [deleteQuiz, { loading: deleting }] = useMutation(DELETE_QUIZ, {
    refetchQueries: [{ query: GET_QUIZZES, variables: { coupleId: couple?.id } }],
    onError: (error) => showError(error.message),
    onCompleted: () => showSuccess('Quiz deleted'),
  });

  const [reorderQuizzes] = useMutation(REORDER_QUIZZES, {
    refetchQueries: [{ query: GET_QUIZZES, variables: { coupleId: couple?.id } }],
    onError: (error) => showError(error.message),
  });

  if (authLoading || coupleLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }
  if (!isAuthenticated || !couple) return null;

  const quizzes = data?.quizzes ?? [];

  const moveQuiz = async (idx: number, direction: -1 | 1) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= quizzes.length) return;
    const newOrder = [...quizzes];
    [newOrder[idx], newOrder[newIdx]] = [newOrder[newIdx], newOrder[idx]];
    await reorderQuizzes({
      variables: { coupleId: couple.id, quizIds: newOrder.map((q) => q.id) },
    });
  };
  const leaderboard = leaderboardData?.quizLeaderboard ?? [];

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: string, value: string | number) => {
    const updated = [...questions];
    if (field === 'question') updated[index].question = value as string;
    if (field === 'correctAnswer') updated[index].correctAnswer = value as number;
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleCreate = async () => {
    const validQuestions = questions.filter((q) => q.question.trim() && q.options.every((o) => o.trim()));
    if (!title.trim() || validQuestions.length === 0) {
      setFormError('Please fill in a title and at least one complete question with all options.');
      return;
    }
    setFormError('');
    try {
      await createQuiz({
        variables: {
          coupleId: couple.id,
          input: { title: title.trim(), description: description.trim() || null, questions: validQuestions },
        },
      });
      setFormOpen(false);
      setTitle('');
      setDescription('');
      setQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create quiz. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteQuiz({ variables: { id: deleteId } });
    setDeleteId(null);
    if (selectedQuiz === deleteId) setSelectedQuiz(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quiz Game</h1>
          <p className="mt-1 text-gray-500">How well do your friends know you two?</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setFormOpen(true)}>Create Quiz</Button>
      </div>

      {quizzesLoading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : quizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-100">
          <span className="text-5xl">🧩</span>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No quizzes yet</h3>
          <p className="mt-1 text-sm text-gray-500">Create a quiz to test how well your friends know you</p>
          <Button variant="primary" size="sm" className="mt-4" onClick={() => setFormOpen(true)}>Create Quiz</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Quiz list */}
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                onClick={() => setSelectedQuiz(quiz.id)}
                className={`cursor-pointer rounded-2xl bg-white p-5 shadow-sm ring-1 transition-shadow hover:shadow-md ${
                  selectedQuiz === quiz.id ? 'ring-[var(--color-coral)]' : 'ring-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${quiz.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {quiz.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {quiz.description && <p className="mt-1 text-sm text-gray-500">{quiz.description}</p>}
                <div className="mt-3 flex items-center gap-2">
                  {quizzes.length > 1 && (
                    <div className="flex gap-0.5">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); moveQuiz(quizzes.indexOf(quiz), -1); }}
                        disabled={quizzes.indexOf(quiz) === 0}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
                        aria-label="Move up"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); moveQuiz(quizzes.indexOf(quiz), 1); }}
                        disabled={quizzes.indexOf(quiz) === quizzes.length - 1}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
                        aria-label="Move down"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </button>
                    </div>
                  )}
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDeleteId(quiz.id); }} className="!text-red-500">Delete</Button>
                </div>
              </div>
            ))}
          </div>

          {/* Leaderboard */}
          {selectedQuiz && (
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <h3 className="mb-4 font-semibold text-gray-900">Leaderboard</h3>
              {leaderboard.length === 0 ? (
                <p className="text-sm text-gray-400">No responses yet</p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, i) => (
                    <div key={entry.id} className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-2">
                      <span className="text-lg font-bold text-gray-400">#{i + 1}</span>
                      <span className="flex-1 text-sm font-medium text-gray-700">{entry.respondentName}</span>
                      <span className="text-sm font-semibold text-[var(--color-coral)]">
                        {entry.score}/{entry.totalQuestions}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Quiz Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setFormOpen(false)} />
          <div className="relative mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Create Quiz</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. How well do you know us?"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none transition-colors focus:border-[var(--color-coral)] focus:ring-1 focus:ring-[var(--color-coral)]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="A fun quiz about our relationship!"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none transition-colors focus:border-[var(--color-coral)] focus:ring-1 focus:ring-[var(--color-coral)]"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Questions</label>
                {questions.map((q, qi) => (
                  <div key={qi} className="rounded-xl bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Question {qi + 1}</span>
                      {questions.length > 1 && (
                        <button onClick={() => removeQuestion(qi)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => updateQuestion(qi, 'question', e.target.value)}
                      placeholder="What was our first date?"
                      className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-[var(--color-coral)]"
                    />
                    <div className="mt-2 space-y-1">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`q-${qi}`}
                            checked={q.correctAnswer === oi}
                            onChange={() => updateQuestion(qi, 'correctAnswer', oi)}
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => updateOption(qi, oi, e.target.value)}
                            placeholder={`Option ${oi + 1}`}
                            className="flex-1 rounded-lg border border-gray-200 px-3 py-1 text-sm outline-none focus:border-[var(--color-coral)]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addQuestion}>+ Add Question</Button>
              </div>

              {formError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" size="sm" onClick={() => { setFormOpen(false); setFormError(''); }} disabled={creating}>Cancel</Button>
                <Button variant="primary" size="sm" loading={creating} onClick={handleCreate}>Create Quiz</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Delete Quiz"
        message="Are you sure? All questions and responses will be deleted."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
