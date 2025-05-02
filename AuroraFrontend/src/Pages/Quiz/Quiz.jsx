import React, { useState } from 'react';
import './Quiz.css';

const questions = [
  {
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    correct: 2,
  },
  {
    question: "Which language is used for web apps?",
    options: ["Python", "JavaScript", "C++", "Java"],
    correct: 1,
  },
  {
    question: "Who wrote '1984'?",
    options: ["Aldous Huxley", "George Orwell", "J.K. Rowling", "Mark Twain"],
    correct: 1,
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Jupiter", "Saturn"],
    correct: 1,
  },
  {
    question: "Which element has the chemical symbol O?",
    options: ["Oxygen", "Gold", "Silver", "Iron"],
    correct: 0,
  },
];

export default function Quiz( ) {
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);

  const handleOptionChange = (qIndex, optionIndex) => {
    if (!submitted) {
      const updatedAnswers = [...answers];
      updatedAnswers[qIndex] = optionIndex;
      setAnswers(updatedAnswers);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const score = answers.reduce((acc, ans, idx) =>
    ans === questions[idx].correct ? acc + 1 : acc, 0);

  return (
    <div className="quiz-container">
      <h2 className="title">Quiz</h2>
      {questions.map((q, qIndex) => (
        <div key={qIndex} className={`question-block ${submitted ? 'submitted' : ''}`}>
          <p className="question-text">{qIndex + 1}. {q.question}</p>
          <ul className="options-list">
            {q.options.map((option, oIndex) => {
              const isCorrect = submitted && oIndex === q.correct;
              const isSelected = answers[qIndex] === oIndex;
              const isWrong = submitted && isSelected && oIndex !== q.correct;
              return (
                <li key={oIndex}>
                  <label className={`option-label 
                    ${isCorrect ? 'correct' : ''} 
                    ${isWrong ? 'wrong' : ''}`}>
                    <input
                      type="radio"
                      name={`question-${qIndex}`}
                      value={oIndex}
                      checked={isSelected}
                      onChange={() => handleOptionChange(qIndex, oIndex)}
                      disabled={submitted}
                    />
                    {option}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      {!submitted ? (
        <button className="submit-btn" onClick={handleSubmit}>Submit</button>
      ) : (
        <div className="result">Your score: {score} / {questions.length}</div>
      )}
    </div>
  );
}
