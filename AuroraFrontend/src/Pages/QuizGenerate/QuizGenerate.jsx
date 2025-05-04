import React, { useState } from 'react';
import './QuizGenerate.css';
import Quiz from '../../components/Quiz/Quiz.jsx'
import Cookies from 'universal-cookie';

function QuizGenerate() {
    const [topic, setTopic] = useState('');
    const [questions, setQuestions] = useState([]);
    const cookies = new Cookies();
    const handleGenerate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('https://localhost:7242/api/Quiz/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json',
                  'Authorization': cookies.get("JWT")
                 },
                 body: `{"topic":"${topic}"}`
              });
            const json = await response.json();
            console.log(json.questions);
            setQuestions(json.questions);
        } 
        catch (err) {
            console.error(err);
        }
    };
    return(
    <>
    <div>
      <h2>AI Quiz Generator</h2>
      <form onSubmit={handleGenerate}>
        <input type="text" className="input-field" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Enter a topic"/>
        <button type='submit'>Generate Quiz</button>
      </form>
      </div>

      {questions.length > 0 && <Quiz questions={questions} />}
    </>
    )
}
export default QuizGenerate;