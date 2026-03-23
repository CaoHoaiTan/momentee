'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_QUIZ_FOR_GUEST } from '../../graphql/queries/quiz.queries';
import { SUBMIT_QUIZ } from '../../graphql/mutations/quiz.mutations';

interface QuizSummary {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  sortOrder: number;
}

interface QuizDetail {
  id: string;
  title: string;
  description: string | null;
  questions: QuizQuestion[];
}

interface SubmitResult {
  submitQuiz: {
    id: string;
    score: number;
    totalQuestions: number;
  };
}

interface QuizPlayerProps {
  quizzes: QuizSummary[];
  coupleId: string;
}

export function QuizPlayer({ quizzes, coupleId }: QuizPlayerProps) {
  const activeQuizzes = quizzes.filter((q) => q.isActive);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(
    activeQuizzes.length === 1 ? activeQuizzes[0].id : null,
  );
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [respondentName, setRespondentName] = useState('');
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);
  const [step, setStep] = useState<'select' | 'play' | 'name' | 'result'>(
    activeQuizzes.length === 1 ? 'play' : 'select',
  );

  const { data: quizData, loading: quizLoading } = useQuery<{ quiz: QuizDetail }>(
    GET_QUIZ_FOR_GUEST,
    {
      variables: { id: selectedQuizId },
      skip: !selectedQuizId,
    },
  );

  const [submitQuiz, { loading: submitting }] = useMutation<SubmitResult>(SUBMIT_QUIZ);

  const questions = quizData?.quiz?.questions ?? [];
  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id] !== undefined);

  const handleSelectQuiz = (id: string) => {
    setSelectedQuizId(id);
    setStep('play');
    setAnswers({});
    setResult(null);
  };

  const handleAnswer = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleProceedToName = () => {
    if (allAnswered) setStep('name');
  };

  const handleSubmit = async () => {
    if (!selectedQuizId || !respondentName.trim()) return;
    const sorted = [...questions].sort((a, b) => a.sortOrder - b.sortOrder);
    const answerArray = sorted.map((q) => answers[q.id] ?? 0);

    const { data } = await submitQuiz({
      variables: {
        quizId: selectedQuizId,
        input: { respondentName: respondentName.trim(), answers: answerArray },
      },
    });

    if (data?.submitQuiz) {
      setResult({ score: data.submitQuiz.score, total: data.submitQuiz.totalQuestions });
      setStep('result');
    }
  };

  const handleReset = () => {
    setAnswers({});
    setRespondentName('');
    setResult(null);
    setStep(activeQuizzes.length === 1 ? 'play' : 'select');
    if (activeQuizzes.length > 1) setSelectedQuizId(null);
  };

  if (activeQuizzes.length === 0) return null;

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {/* Step 1: Select a quiz */}
        {step === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-3"
          >
            {activeQuizzes.map((quiz) => (
              <button
                key={quiz.id}
                onClick={() => handleSelectQuiz(quiz.id)}
                className="w-full rounded-xl p-4 text-left transition-shadow hover:shadow-md"
                style={{
                  background: 'var(--theme-surface)',
                  border: '1px solid var(--theme-border)',
                }}
              >
                <h3 className="font-semibold" style={{ color: 'var(--theme-text)' }}>
                  {quiz.title}
                </h3>
                {quiz.description && (
                  <p className="mt-1 text-sm" style={{ color: 'var(--theme-text-muted)' }}>
                    {quiz.description}
                  </p>
                )}
              </button>
            ))}
          </motion.div>
        )}

        {/* Step 2: Answer questions */}
        {step === 'play' && (
          <motion.div
            key="play"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            {quizLoading ? (
              <div className="flex justify-center py-8">
                <div
                  className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
                  style={{ borderColor: 'var(--theme-primary)', borderTopColor: 'transparent' }}
                />
              </div>
            ) : (
              <>
                {quizData?.quiz && (
                  <p className="text-center text-sm" style={{ color: 'var(--theme-text-muted)' }}>
                    {quizData.quiz.title}
                  </p>
                )}
                {questions.map((q, qi) => (
                  <div
                    key={q.id}
                    className="rounded-xl p-4"
                    style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}
                  >
                    <p className="mb-3 font-medium" style={{ color: 'var(--theme-text)' }}>
                      {qi + 1}. {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((option, oi) => (
                        <button
                          key={oi}
                          onClick={() => handleAnswer(q.id, oi)}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors"
                          style={{
                            background: answers[q.id] === oi ? 'var(--theme-primary)' : 'var(--theme-bg)',
                            color: answers[q.id] === oi ? '#fff' : 'var(--theme-text)',
                          }}
                        >
                          <span
                            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                            style={{
                              background: answers[q.id] === oi ? 'rgba(255,255,255,0.25)' : 'var(--theme-surface)',
                              color: answers[q.id] === oi ? '#fff' : 'var(--theme-text-muted)',
                            }}
                          >
                            {String.fromCharCode(65 + oi)}
                          </span>
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleProceedToName}
                    disabled={!allAnswered}
                    className="rounded-full px-6 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-40"
                    style={{ background: 'var(--theme-primary)' }}
                  >
                    Continue
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Step 3: Enter name */}
        {step === 'name' && (
          <motion.div
            key="name"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="rounded-xl p-6 text-center"
            style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}
          >
            <p className="mb-4 font-medium" style={{ color: 'var(--theme-text)' }}>
              Enter your name to see your score
            </p>
            <input
              type="text"
              value={respondentName}
              onChange={(e) => setRespondentName(e.target.value)}
              placeholder="Your name"
              className="mx-auto block w-full max-w-xs rounded-lg border px-4 py-2 text-center text-sm outline-none"
              style={{
                background: 'var(--theme-bg)',
                color: 'var(--theme-text)',
                borderColor: 'var(--theme-border)',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && respondentName.trim()) handleSubmit();
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={!respondentName.trim() || submitting}
              className="mt-4 rounded-full px-6 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-40"
              style={{ background: 'var(--theme-primary)' }}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </motion.div>
        )}

        {/* Step 4: Result */}
        {step === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="rounded-xl p-8 text-center"
            style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}
          >
            <div className="text-4xl">
              {result.score === result.total ? '🎉' : result.score >= result.total / 2 ? '👏' : '💪'}
            </div>
            <p className="mt-3 text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>
              {result.score}/{result.total}
            </p>
            <p className="mt-1 text-sm" style={{ color: 'var(--theme-text-muted)' }}>
              {result.score === result.total
                ? 'Perfect score! You know them so well!'
                : result.score >= result.total / 2
                  ? 'Great job! You know them pretty well!'
                  : 'Nice try! Better luck next time!'}
            </p>
            <button
              onClick={handleReset}
              className="mt-4 rounded-full px-6 py-2 text-sm font-medium transition-colors"
              style={{
                background: 'var(--theme-bg)',
                color: 'var(--theme-text)',
                border: '1px solid var(--theme-border)',
              }}
            >
              Play Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
