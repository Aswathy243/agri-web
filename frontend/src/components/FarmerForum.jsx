import React, { useState } from 'react';

const FarmerForum = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "Pepper plant disease identification",
      author: "Rajesh K",
      location: "Nedumkandam",
      content: "My pepper plants are showing yellow spots on leaves. Has anyone faced similar issues?",
      replies: 5,
      upvotes: 12,
      isVerified: false,
      isEmergency: false,
      timestamp: "2 hours ago"
    },
    {
      id: 2,
      title: "Best time to plant cardamom this season",
      author: "Dr. Anitha (Krishi Officer)",
      location: "Idukki",
      content: "Based on current weather patterns, I recommend planting cardamom in the next 2 weeks for optimal growth.",
      replies: 3,
      upvotes: 8,
      isVerified: true,
      isEmergency: false,
      timestamp: "1 day ago"
    },
    {
      id: 3,
      title: "URGENT: Wild boar attack prevention",
      author: "Suresh P",
      location: "Vandanmedu",
      content: "Wild boars destroyed my entire vegetable patch last night. Any effective prevention methods?",
      replies: 7,
      upvotes: 15,
      isVerified: false,
      isEmergency: true,
      timestamp: "3 hours ago"
    }
  ]);

  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    isEmergency: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPost(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const post = {
      id: posts.length + 1,
      title: newPost.title,
      author: "You",
      location: "Your Location",
      content: newPost.content,
      replies: 0,
      upvotes: 0,
      isVerified: false,
      isEmergency: newPost.isEmergency,
      timestamp: "Just now"
    };
    setPosts([post, ...posts]);
    setNewPost({ title: '', content: '', isEmergency: false });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-green-800 mb-6">Farmer Forum</h2>
      
      <div className="mb-8 bg-green-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Create New Post</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              name="title"
              value={newPost.title}
              onChange={handleInputChange}
              placeholder="Post title"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div className="mb-4">
            <textarea
              name="content"
              value={newPost.content}
              onChange={handleInputChange}
              placeholder="What's your question or advice?"
              rows="3"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            ></textarea>
          </div>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="emergency"
              name="isEmergency"
              checked={newPost.isEmergency}
              onChange={handleInputChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="emergency" className="ml-2 block text-sm text-gray-700">
              Mark as urgent (e.g., pest outbreaks, immediate threats)
            </label>
          </div>
          <button
            type="submit"
            className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg"
          >
            Post to Forum
          </button>
        </form>
      </div>
      
      <div className="space-y-6">
        {posts.map(post => (
          <div key={post.id} className={`border rounded-lg p-4 ${post.isEmergency ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">{post.title}</h3>
              {post.isEmergency && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">URGENT</span>
              )}
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <span className="font-medium">{post.author}</span>
              {post.isVerified && (
                <svg className="w-4 h-4 ml-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
              )}
              <span className="mx-1">•</span>
              <span>{post.location}</span>
              <span className="mx-1">•</span>
              <span>{post.timestamp}</span>
            </div>
            <p className="text-gray-700 mb-3">{post.content}</p>
            <div className="flex items-center text-sm text-gray-500">
              <button className="flex items-center mr-4 hover:text-green-700">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
                </svg>
                {post.upvotes}
              </button>
              <button className="flex items-center mr-4 hover:text-green-700">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                {post.replies} {post.replies === 1 ? 'reply' : 'replies'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FarmerForum;