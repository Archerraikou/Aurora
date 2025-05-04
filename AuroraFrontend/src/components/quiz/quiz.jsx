import React, { useState } from 'react';
import './quiz.css';
export default function Quiz( questions ) {
  questions=questions.questions
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
