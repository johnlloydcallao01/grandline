import React, { useState, useEffect, useCallback } from 'react';

export interface QuizQuestionOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  type: 'single_choice' | 'multiple_choice' | 'true_false';
  prompt: string;
  explanation?: string;
  options: QuizQuestionOption[];
}

interface QuizPlayerProps {
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimitMinutes?: number | null;
  maxAttempts?: number | null;
  attemptsUsed?: number;
  showCorrectAnswer?: boolean;
  onComplete?: (result: { score: number; passed: boolean; answers: Record<string, string | string[]> }) => void;
  onExit?: () => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  title,
  questions,
  passingScore,
  timeLimitMinutes,
  maxAttempts,
  attemptsUsed = 0,
  showCorrectAnswer = false,
  onComplete,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(
    timeLimitMinutes ? timeLimitMinutes * 60 : null
  );
  const [showResults, setShowResults] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (optionId: string) => {
    if (isSubmitted) return;

    const questionId = currentQuestion.id;
    const type = currentQuestion.type;

    setAnswers((prev) => {
      if (type === 'multiple_choice') {
        const current = (prev[questionId] as string[]) || [];
        if (current.includes(optionId)) {
          return { ...prev, [questionId]: current.filter((id) => id !== optionId) };
        } else {
          return { ...prev, [questionId]: [...current, optionId] };
        }
      } else {
        return { ...prev, [questionId]: optionId };
      }
    });
  };

  const calculateScore = useCallback(() => {
    let correctCount = 0;

    questions.forEach((q) => {
      const userAnswer = answers[q.id];
      if (!userAnswer) return;

      if (q.type === 'multiple_choice') {
        const userSelected = userAnswer as string[];
        const correctOptions = q.options.filter((o) => o.isCorrect).map((o) => o.id);

        // Check if exact match (ignoring order)
        if (
          userSelected.length === correctOptions.length &&
          userSelected.every((id) => correctOptions.includes(id))
        ) {
          correctCount++;
        }
      } else {
        // single_choice or true_false
        const correctOption = q.options.find((o) => o.isCorrect);
        if (correctOption && userAnswer === correctOption.id) {
          correctCount++;
        }
      }
    });

    const percentage = Math.round((correctCount / questions.length) * 100);
    return { correctCount, percentage };
  }, [questions, answers]);

  const handleSubmit = () => {
    setIsSubmitted(true);
    setShowResults(true);
    const { percentage } = calculateScore();
    const passed = percentage >= passingScore;

    if (onComplete) {
      onComplete({ score: percentage, passed, answers });
    }
  };

  if (showResults) {
    const { percentage: score, correctCount } = calculateScore();
    const passed = score >= passingScore;

    if (showReview) {
      return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col min-h-[400px]">
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Quiz Review</h2>
            <div className="text-sm font-medium text-gray-900">
              Score: {score}% ({correctCount}/{questions.length})
            </div>
          </div>

          <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[70vh]">
            <div className="max-w-3xl mx-auto space-y-12">
              {questions.map((q, idx) => {
                const userAnswer = answers[q.id];
                const isMultiple = q.type === 'multiple_choice';

                // Determine if user answered this question correctly
                let isCorrect = false;
                if (isMultiple) {
                  const userSelected = (userAnswer as string[]) || [];
                  const correctOptions = q.options.filter((o) => o.isCorrect).map((o) => o.id);
                  isCorrect = userSelected.length === correctOptions.length &&
                    userSelected.every((id) => correctOptions.includes(id));
                } else {
                  const correctOption = q.options.find((o) => o.isCorrect);
                  isCorrect = correctOption ? userAnswer === correctOption.id : false;
                }

                return (
                  <div key={q.id} className="border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                    <div className="flex gap-4 mb-4">
                      <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="text-lg font-medium text-gray-900 mb-4">{q.prompt}</div>

                        <div className="space-y-3">
                          {q.options.map((option) => {
                            const isSelected = isMultiple
                              ? ((userAnswer as string[]) || []).includes(option.id)
                              : userAnswer === option.id;
                            const isOptionCorrect = option.isCorrect;

                            let borderClass = 'border-gray-200';
                            let bgClass = 'bg-white';
                            let icon: React.ReactNode = null;

                            if (isOptionCorrect) {
                              borderClass = 'border-green-500';
                              bgClass = 'bg-green-50';
                              icon = <i className="fa fa-check text-green-600 ml-auto" />;
                            } else if (isSelected && !isOptionCorrect) {
                              borderClass = 'border-red-500';
                              bgClass = 'bg-red-50';
                              icon = <i className="fa fa-times text-red-600 ml-auto" />;
                            }

                            return (
                              <div
                                key={option.id}
                                className={`flex items-center p-4 rounded-lg border ${borderClass} ${bgClass}`}
                              >
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${isSelected ? (isOptionCorrect ? 'border-green-600 bg-green-600' : 'border-red-600 bg-red-600') : 'border-gray-300'
                                  }`}>
                                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                <span className={`text-gray-700 ${isOptionCorrect ? 'font-medium text-green-900' : ''}`}>
                                  {option.label}
                                </span>
                                {icon}
                              </div>
                            );
                          })}
                        </div>

                        {q.explanation && (
                          <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
                            <span className="font-bold block mb-1">Explanation:</span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-center">
            <button
              onClick={() => setShowReview(false)}
              className="px-6 py-2 bg-[#0056d2] text-white rounded-lg hover:bg-[#0041a8] font-medium"
            >
              Back to Results
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden p-6 md:p-8">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            <i className={`fa ${passed ? 'fa-check' : 'fa-times'} text-3xl`} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {passed ? 'Assessment Passed!' : 'Assessment Failed'}
          </h2>
          <p className="text-gray-600">
            You scored <span className="font-semibold">{score}%</span> ({correctCount}/{questions.length}). The passing score is {passingScore}%.
          </p>
          {maxAttempts && (
            <p className="text-sm text-gray-500 mt-2">
              Remaining Attempts: <span className="font-medium">{Math.max(0, maxAttempts - (attemptsUsed + 1))}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="flex justify-center gap-4">
            <button
              onClick={onExit}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Back to Course
            </button>
            {!passed && (
              <button
                onClick={() => window.location.reload()} // Simple reload to retry for now
                className="px-6 py-2 bg-[#0056d2] text-white rounded-lg hover:bg-[#0041a8] font-medium"
              >
                Retry
              </button>
            )}
          </div>

          {showCorrectAnswer && (
            <button
              onClick={() => setShowReview(true)}
              className="text-[#0056d2] hover:text-[#0041a8] font-medium text-sm flex items-center gap-2 mt-2"
            >
              <i className="fa fa-eye" />
              Reveal Correct Answers
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col min-h-[400px]">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <div className="flex items-center gap-4 text-sm">
          {timeLeft !== null && (
            <div className={`font-mono font-medium ${timeLeft < 60 ? 'text-red-600' : 'text-gray-600'}`}>
              <i className="fa fa-clock-o mr-2" />
              {formatTime(timeLeft)}
            </div>
          )}
          <div className="text-gray-500">
            Question {currentIndex + 1} of {questions.length}
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 text-lg font-medium text-gray-900">
            {currentQuestion.prompt}
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = currentQuestion.type === 'multiple_choice'
                ? ((answers[currentQuestion.id] as string[]) || []).includes(option.id)
                : answers[currentQuestion.id] === option.id;

              return (
                <label
                  key={option.id}
                  className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${isSelected
                    ? 'border-[#0056d2] bg-[#f0f7ff] ring-1 ring-[#0056d2]'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <input
                    type={currentQuestion.type === 'multiple_choice' ? 'checkbox' : 'radio'}
                    name={currentQuestion.id}
                    value={option.id}
                    checked={isSelected}
                    onChange={() => handleOptionSelect(option.id)}
                    className="h-4 w-4 text-[#0056d2] border-gray-300 focus:ring-[#0056d2]"
                  />
                  <span className="ml-3 text-gray-700">{option.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-between">
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            className="px-6 py-2 text-sm font-medium text-white bg-[#0056d2] rounded-lg hover:bg-[#0041a8]"
          >
            Submit Assessment
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
            className="px-4 py-2 text-sm font-medium text-white bg-[#0056d2] rounded-lg hover:bg-[#0041a8]"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};
