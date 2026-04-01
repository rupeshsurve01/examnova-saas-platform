import React from 'react'
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const addQuestions = () => {

    const naviage = useNavigate();

  return (
    <div>
      <form action="">
        <textarea placeholder="Question Text" />
        <input type="text" placeholder="Option A" />
        <input type="text" placeholder="Option B" />    
        <input type="text" placeholder="Option C" />
        <input type="text" placeholder="Option D" />
        <input type="text" placeholder="Correct Option (A/B/C/D)" />    
        <button type="submit" onClick={()=> {
            naviage('/add-questions');
        }}>Add Question</button>

        <button onClick={() => naviage('/exams')}>View Exams</button>
      </form>
    </div>
  )
}

export default addQuestions
