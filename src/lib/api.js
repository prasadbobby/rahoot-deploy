// src/lib/api.js
export async function fetchData(endpoint, options = {}) {
    const response = await fetch(`/api/${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
    }
    
    return response.json();
  }
  export async function fetchQuizzes() {
    return fetchData('quizzes');
  }
  
  export async function fetchQuiz(id) {
    return fetchData(`quizzes/${id}`);
  }
  
  export async function createQuiz(quizData) {
    return fetchData('quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  }
  
  export async function updateQuiz(id, quizData) {
    return fetchData(`quizzes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(quizData),
    });
  }
  
  export async function deleteQuiz(id) {
    return fetchData(`quizzes/${id}`, {
      method: 'DELETE',
    });
  }
  
  export async function joinQuiz(code) {
    return fetchData('quizzes/join', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }
  
  export async function saveResult(resultData) {
    return fetchData('results', {
      method: 'POST',
      body: JSON.stringify(resultData),
    });
  }
  
  export async function fetchResults(quizId) {
    return fetchData(`results/${quizId}`);
  }
  
  export async function fetchUserResults(userId) {
    return fetchData(`results/user/${userId}`);
  }