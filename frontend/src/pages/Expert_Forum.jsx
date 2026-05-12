import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Expert_Forum = () => {
  const [questions, setQuestions] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  //const [voting, setVoting] = useState(null);
  
  // Remove voteError state since we're not showing vote button anymore
  //const userData = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/expertForum/questions`,
          {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
          }
        );
        
        const questionsData = res.data.questions || res.data || [];
        setQuestions(questionsData);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError(err.response?.data?.message || 'Failed to load questions');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/expert-login';
        }
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleReply = async (question_id) => {
    if (!replyText.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/expertForum/reply`,
        { 
          question_id,
          reply_text: replyText 
        },
        { 
          headers: { Authorization: `Bearer ${token}` } 
        }
      );

      // Update UI
      const updatedQuestions = questions.map(q => {
        if (q.id === question_id) {
          return {
            ...q,
            ForumReplies: [
              ...(q.ForumReplies || []),
              res.data.reply
            ]
          };
        }
        return q;
      });
      
      setQuestions(updatedQuestions);
      setReplyText('');
      setActiveId(null);
    } catch (err) {
      console.error('Error submitting reply:', err);
      alert(err.response?.data?.message || 'Failed to submit reply');
    }
  };

  if (loading) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Expert Forum</h2>
        <p>Loading questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Expert Forum</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Expert Forum</h2>
      
      {questions.length === 0 ? (
        <p className="text-gray-500">No questions found. Check back later or refresh the page.</p>
      ) : (
        questions.map((q) => (
          <div key={q.id} className="border p-4 rounded mb-4 shadow-sm">
            <div className="font-semibold">
              {q.Farmer?.name || 'Unknown farmer'} - {q.region || 'Unknown region'}
              {q.is_emergency && (
                <span className="ml-2 bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                  Emergency
                </span>
              )}
            </div>
            
            <p className="text-gray-700 mt-1">{q.question_text}</p>

            {q.audio_path && (
              <audio
                controls
                src={`${process.env.REACT_APP_API_URL}/${q.audio_path}`}
                className="mt-2 w-full"
              />
            )}

            {/* Replies Section */}
            <div className="mt-3">
              <h4 className="font-medium text-sm mb-2">Replies:</h4>
              {q.ForumReplies?.length > 0 ? (
                q.ForumReplies.map((reply) => (
                  <div key={reply.id} className="bg-gray-50 p-3 rounded mt-2">
                    <div className="flex justify-between items-start">
                      <div>
                        {reply.Expert ? (
                          <div className="flex items-center gap-2">
                            <strong className="text-gray-800">
                              {reply.Expert.name}
                            </strong>
                            {reply.Expert.is_verified && (
                              <span className="text-green-600 font-medium text-xs flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Verified
                              </span>
                            )}
                          </div>
                        ) : (
                          <strong className="text-gray-800">
                            {reply.Farmer?.name || 'Farmer'}
                          </strong>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(reply.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-gray-700">{reply.reply_text}</p>
                  
                    {/* Display vote count as non-interactive element */}
                    <div className="mt-2 inline-block px-2 py-1 text-sm border bg-yellow-100 rounded">
                      👍 {reply.upvotes || 0}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No replies yet</p>
              )}
            </div>

            {/* Reply Box */}
            {activeId === q.id ? (
              <div className="mt-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full border p-2 rounded text-sm"
                  placeholder="Type your reply..."
                  rows={3}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => setActiveId(null)}
                    className="text-sm px-3 py-1 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReply(q.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    disabled={!replyText.trim()}
                  >
                    Submit Reply
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setActiveId(q.id)}
                className="text-sm text-blue-600 hover:text-blue-800 mt-2"
              >
                Add Reply
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Expert_Forum;