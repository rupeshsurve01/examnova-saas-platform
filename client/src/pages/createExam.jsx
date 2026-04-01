import React from 'react'
import API from "../services/api";
import { useNavigate } from "react-router-dom"; 

const createExam = () => {

    const navigate = useNavigate();
    const createExam = async () => {
        try {
             await API.post(`/exams/create`);
             navigate("/add-questions");
        } catch (error) {
            console.error(error);
        }
    }
  return (
    <div>
      <h1>Create Exam</h1>
      <form>
        <input type="text" placeholder="Exam Title" />
        <textarea placeholder="Exam Description" />
        <input type="text" placeholder="Exam Duration (minutes)" />
        <input type="text" placeholder="Total Marks" />
        <input type="text" placeholder="Exam Code"  />
        <button type="submit" onClick={createExam}>Create Exam</button>
      </form>
    </div>
  )
}

export default createExam
