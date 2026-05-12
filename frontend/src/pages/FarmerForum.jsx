import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const FarmerForum = () => {
  const [formData, setFormData] = useState({
    question_text: '',
    region: '',
    is_emergency: false
  });
  const [audioURL, setAudioURL] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'mine'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // ID of question being replied to
  const [voting, setVoting] = useState(null); // Track voting state
  
  // ✅ FIXED: Improved user data handling
  const getUserData = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user || {};
  };
  
  const userData = getUserData();
  const userRole = userData.role || 'unknown';
  const userId = userData.id;

  // ✅ FIXED: Make votedReplies user-specific
  const [votedReplies, setVotedReplies] = useState(() => {
    // Use user-specific localStorage key
    const key = `votedReplies_${userId}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  });

  // ✅ FIXED: Save voted replies to user-specific key
  useEffect(() => {
    const key = `votedReplies_${userId}`;
    localStorage.setItem(key, JSON.stringify(votedReplies));
  }, [votedReplies, userId]); // Add userId to dependencies

  const recordingTimerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  // ✅ FIXED: Improved ownership check
  const isReplyOwner = (reply) => {
    if (!userData) return false;
    
    // Compare using the actual user ID
    const currentUserId = parseInt(userId);
    
    // Check both possible ID fields in the reply
    return (
      (reply.farmer_id && parseInt(reply.farmer_id) === currentUserId) ||
      (reply.expert_id && parseInt(reply.expert_id) === currentUserId)
    );
  };

  useEffect(() => {
    fetchQuestions();
    
    // Cleanup media resources when component unmounts
    return () => {
      if (mediaRecorderRef.current?.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      clearInterval(recordingTimerRef.current);
    };
  }, [viewMode]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const url = viewMode === 'mine' 
        ? '/api/forum/my-questions?my_questions_only=true&include_replies=true'
        : '/api/forum/my-questions?include_replies=true';
      
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err.response?.data?.message || 'Failed to load questions.');
      setQuestions([]);
      
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      setIsRecording(true);
      setRecordingDuration(0);
      
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setIsRecording(false);
        clearInterval(recordingTimerRef.current);
      };

      mediaRecorderRef.current.start(1000); // Collect data every second
    } catch (err) {
      setError('Microphone access denied or not available.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleVote = async (replyId, reply) => {
    // Only farmers can vote
    if (userRole !== 'farmer') {
      setError('Only farmers can vote');
      return;
    }
    
    // Check if user owns the reply
    if (isReplyOwner(reply)) {
      setError("You can't vote your own reply");
      return;
    }
    
    // Check if user has already voted for this reply
    if (votedReplies.includes(replyId)) {
      setError("You've already voted for this reply.");
      return;
    }
    
    setVoting(replyId);
    
    // Temporary optimistic update
    setQuestions(prev => prev.map(q => {
      if (!q.ForumReplies) return q;
      
      return {
        ...q,
        ForumReplies: q.ForumReplies.map(r => 
          r.id === replyId ? {...r, upvotes: (r.upvotes || 0) + 1} : r
        )
      };
    }));

    // Add to voted replies
    setVotedReplies(prev => [...prev, replyId]);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/forum/reply/${replyId}/vote`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Verify with server by refetching
      await fetchQuestions();
    } catch (err) {
      // Rollback on error
      setQuestions(prev => prev.map(q => {
        if (!q.ForumReplies) return q;
        
        return {
          ...q,
          ForumReplies: q.ForumReplies.map(r => 
            r.id === replyId ? {...r, upvotes: Math.max(0, (r.upvotes || 0) - 1)} : r
          )
        };
      }));
      
      // Remove from voted replies
      setVotedReplies(prev => prev.filter(id => id !== replyId));
      
      // Handle specific error cases
      if (err.response?.status === 400) {
        if (err.response.data.message?.includes('already voted')) {
          setError("You've already voted for this reply.");
        } else {
          setError("Invalid vote request. Please try again.");
        }
      } else {
        setError(err.response?.data?.message || 'Failed to vote');
      }
    } finally {
      setVoting(null);
    }
  };

  const handleSend = async () => {
    if (!formData.region.trim()) {
      setError('Please enter your region.');
      return;
    }
    if (!formData.question_text.trim() && !audioURL) {
      setError('Please enter a question or record audio.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formPayload = new FormData();
      formPayload.append('question_text', formData.question_text.trim());
      formPayload.append('region', formData.region.trim());
      formPayload.append('is_emergency', formData.is_emergency);

      if (audioURL) {
        const response = await fetch(audioURL);
        const audioBlob = await response.blob();
        formPayload.append('audio', audioBlob, `question-${Date.now()}.webm`);
      }

      setIsLoading(true);
      const res = await axios.post('/api/forum/submit', formPayload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      const newQuestion = res.data?.question || res.data?.data;
      if (newQuestion) {
        setQuestions(prev => [newQuestion, ...prev]);
        setFormData({
          question_text: '',
          region: '',
          is_emergency: false
        });
        setAudioURL('');
        setError(null);
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit question.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this question?');
    if (!confirm) return;

    try {
      const token = localStorage.getItem('token');
      setIsLoading(true);
      await axios.delete(`/api/forum/question/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setQuestions(prev => prev.filter(q => q?.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete question.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplySubmit = async (questionId) => {
    if (!replyText.trim()) {
      setError('Please enter a reply');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      setIsLoading(true);
      
      await axios.post('/api/forum/reply', {
        question_id: questionId,
        reply_text: replyText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh the questions to show the new reply
      await fetchQuestions();
      setReplyText('');
      setReplyingTo(null);
      setError(null);
    } catch (err) {
      console.error('Error submitting reply:', err);
      setError(err.response?.data?.message || 'Failed to submit reply');
    } finally {
      setIsLoading(false);
    }
  };

  const clearAudio = () => {
    setAudioURL('');
    setRecordingDuration(0);
    if (mediaRecorderRef.current?.state === 'recording') {
      stopRecording();
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Farmer Forum</h1>

      {/* Error message display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* View mode toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode('all')}
          className={`px-4 py-2 rounded ${viewMode === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          disabled={isLoading}
        >
          All Questions
        </button>
        <button
          onClick={() => setViewMode('mine')}
          className={`px-4 py-2 rounded ${viewMode === 'mine' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          disabled={isLoading}
        >
          My Questions
        </button>
      </div>

      {/* Question form - only for farmers */}
      {userRole === 'farmer' && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <textarea
            name="question_text"
            value={formData.question_text}
            onChange={handleInputChange}
            placeholder="Ask your question..."
            className="w-full border p-2 rounded"
            rows={4}
            disabled={isLoading}
          />

          <div className="mt-2">
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              placeholder="Region (e.g., Vattavada)*"
              className="w-full border p-2 rounded"
              required
              disabled={isLoading}
            />
          </div>

          <label className="flex items-center mt-2">
            <input
              type="checkbox"
              name="is_emergency"
              checked={formData.is_emergency}
              onChange={handleInputChange}
              className="mr-2"
              disabled={isLoading}
            />
            <span>Mark as Emergency</span>
          </label>

          {/* Audio recording controls */}
          <div className="mt-4 flex flex-col items-start gap-2">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={startRecording}
                disabled={isRecording || isLoading}
                className={`px-4 py-2 rounded text-white ${
                  isRecording || isLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                🎤 Start Recording
              </button>
              <button
                onClick={stopRecording}
                disabled={!isRecording || isLoading}
                className={`px-4 py-2 rounded text-white ${
                  !isRecording || isLoading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                🛑 Stop Recording
              </button>
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:bg-gray-400"
              >
                {isLoading ? 'Submitting...' : '📤 Submit Question'}
              </button>
            </div>

            {isRecording && (
              <div className="mt-1 text-red-600 font-semibold text-lg">
                ⏱️ Recording... {formatTime(recordingDuration)}
              </div>
            )}
          </div>

          {/* Audio preview */}
          {audioURL && (
            <div className="mt-4 relative">
              <p className="text-sm text-gray-600 mb-1">Audio Preview:</p>
              <audio controls src={audioURL} className="w-full pr-8" />
              <button
                onClick={clearAudio}
                className="absolute top-0 right-0 text-red-600 text-xl font-bold hover:text-red-800"
                title="Remove Audio"
                disabled={isLoading}
              >
                ❌
              </button>
            </div>
          )}
        </div>
      )}

      {/* Questions list header */}
      <h2 className="text-xl font-semibold border-b pb-2">
        {viewMode === 'mine' ? 'Your Posted Questions' : 'Community Questions'}
      </h2>

      {/* Loading state */}
      {isLoading && questions.length === 0 && (
        <div className="mt-4 text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading questions...</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && questions.length === 0 && (
        <p className="mt-4 text-gray-500">No questions posted yet.</p>
      )}

      {/* Questions list */}
      {!isLoading && questions.length > 0 && (
        <ul className="mt-4 space-y-4">
          {questions.filter(q => q).map((q) => (
            <li key={q?.id} className="p-4 border rounded-lg shadow-sm bg-white relative">
              {viewMode === 'all' && (
                <div className="mb-2 text-sm text-gray-600">
                  <strong>Posted by:</strong> {q?.Farmer?.name || 'Unknown farmer'} from {q?.Farmer?.village || 'unknown village'}
                </div>
              )}
              {viewMode === 'mine' && (
                <button
                  onClick={() => handleDelete(q?.id)}
                  className="absolute top-2 right-2 text-sm text-red-600 hover:text-red-800 font-medium"
                  disabled={isLoading}
                >
                  🗑️ Delete
                </button>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                <div>
                  <strong>Region:</strong> {q?.region || 'Not specified'}
                </div>
                <div className={q?.is_emergency ? 'text-red-600' : ''}>
                  <strong>Status:</strong> {q?.is_emergency ? '🚨 Emergency' : 'Normal'}
                </div>
              </div>
              
              {q?.question_text && (
                <div className="mb-2">
                  <strong>Question:</strong>
                  <p className="whitespace-pre-wrap">{q.question_text}</p>
                </div>
              )}
              
              {q?.audio_path && (
                <div className="mt-2">
                  <strong>Audio:</strong>
                  <audio controls src={`/${q.audio_path}`} className="w-full mt-1" />
                </div>
              )}

              {/* Reply button and form - show for all users except question owner */}
              {q?.farmer_id !== userId && (
                <div className="mt-4">
                  {replyingTo === q.id ? (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply here..."
                        className="w-full border p-2 rounded"
                        rows={3}
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleReplySubmit(q.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                          disabled={isLoading}
                        >
                          Submit Reply
                        </button>
                        <button
                          onClick={() => setReplyingTo(null)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                          disabled={isLoading}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingTo(q.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                      disabled={isLoading}
                    >
                      Reply to this Question
                    </button>
                  )}
                </div>
              )}
              
              {q?.ForumReplies?.length > 0 && (
                <div className="mt-4 border-t pt-3">
                  <h4 className="font-medium mb-2">Responses:</h4>
                  <ul className="space-y-3">
                    {q.ForumReplies.map(reply => {
                      const isOwner = isReplyOwner(reply);
                      const hasVoted = votedReplies.includes(reply.id);
                      // ✅ FIXED: Correct canVote logic
                      const canVote = userRole === 'farmer' && !isOwner && !hasVoted;
                      
                      return (
                        <li key={reply.id} className={`pl-4 border-l-2 ${voting === reply.id ? 'border-yellow-500' : 'border-blue-200'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <strong>
                              {reply?.Expert?.name || reply?.Farmer?.name || reply?.expert_name || reply?.farmer_name || 'Unknown user'}
                            </strong>
                            {reply?.Expert?.is_verified && (
                              <span className="text-green-500 text-sm flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Verified
                              </span>
                            )}
                          </div>
                          
                          <p className="whitespace-pre-wrap">{reply.reply_text}</p>
                          
                          <div className="flex justify-between items-center mt-1">
                            <div className="text-xs text-gray-500">
                              {new Date(reply.created_at).toLocaleString()}
                            </div>
                            
                            {/* ✅ FIXED: Voting button with proper logic */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{reply.upvotes || 0} votes</span>
                                  {!isOwner && (
                              <button

                                onClick={() => handleVote(reply.id, reply)}
                                disabled={!canVote || voting === reply.id}
                                className={`px-2 py-1 rounded text-sm ${
                                  !canVote || voting === reply.id
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-yellow-100 hover:bg-yellow-200 border border-yellow-300'
                                }`}
                                title={
                                  userRole !== 'farmer' ? "Only farmers can vote" :
                                  isOwner ? "You can't vote your own reply" :
                                  hasVoted ? "You've already voted" :
                                  "Vote for this reply"
                                }
                              >
                                {voting === reply.id ? (
                                  <span className="flex items-center">
                                    <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Voting...
                                  </span>
                                ) : hasVoted ? '✅ Voted' : '👍 Vote'}
                              </button>
                                  )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <div className="text-xs text-gray-500 mt-2">
                Posted on: {q?.created_at ? new Date(q.created_at).toLocaleString() : 'Unknown date'}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FarmerForum;