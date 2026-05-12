import React, { useState, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import AdminNavbar from '../../components/admin/AdminNavbar';

const AdminNotifications = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filters, setFilters] = useState({
    urgency: '',
    reportedBy: '',
    date: '',
    status: '',
  });

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        console.log('Fetching all alerts from /api/admin/reports');
        const response = await fetch('http://localhost:5000/api/admin/reports', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched reports data:', data);
        
        const mappedAlerts = data.map(report => ({
          id: report.id,
          type: 'Crop Loss',
          block: report.block || 'N/A',
          panchayat: report.panchayat || 'N/A',
          croptype: report.cropType || 'Unknown',
          date: report.submitted_at ? new Date(report.submitted_at).toISOString().split('T')[0] : 'N/A',
          description: report.description || 'No description',
          reportedBy: report.name || 'Unknown Farmer',
          urgency: report.urgency || 'N/A',
          imageUrl: report.imageUrl ? `http://localhost:5000/${report.imageUrl}` : null, // Corrected image URL
          location: report.location || 'N/A',
          percentage: report.percentage || 0,
          land: report.land || 0,
          status: report.status || 'N/A',
          //read: false,
          read: report.read || false,
          trackingId: report.trackingId || 'N/A',
          damageCause: report.damageCause || 'N/A',
          createdAt: report.createdAt || 'N/A',
          processed_date: report.processed_date || 'N/A',
        }));
        
        console.log('Mapped alerts:', mappedAlerts);
        setAlerts(mappedAlerts);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  // Animation styles
  useEffect(() => {
    const styles = `
      @keyframes fadeInSlideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fadeInSlideUp {
        animation: fadeInSlideUp 0.3s ease-out;
      }
    `;
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  const unreadCount = alerts.filter(alert => !alert.read).length;

 /* const markAsRead = (id) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === id ? { ...alert, read: true } : alert
      )
    );
    if (selectedAlert && selectedAlert.id === id) {
      setSelectedAlert({ ...selectedAlert, read: true });
    }
  };*/
  const markAsRead = async (id) => {
  try {
    await fetch(`http://localhost:5000/api/admin/reports/${id}/mark-read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Update local state after successful response
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === id ? { ...alert, read: true } : alert
      )
    );

    if (selectedAlert && selectedAlert.id === id) {
      setSelectedAlert({ ...selectedAlert, read: true });
    }
  } catch (err) {
    console.error('Error marking alert as read:', err);
  }
};


  const applyFilters = (alerts) => {
    let filtered = [...alerts];
    if (filters.urgency) {
      filtered = filtered.filter(alert => alert.urgency.toLowerCase() === filters.urgency.toLowerCase());
    }
    if (filters.reportedBy) {
      filtered = filtered.filter(alert => alert.reportedBy.toLowerCase().includes(filters.reportedBy.toLowerCase()));
    }
    if (filters.date) {
      filtered = filtered.filter(alert => alert.date === filters.date);
    }
    if (filters.status) {
      filtered = filtered.filter(alert => alert.status.toLowerCase() === filters.status.toLowerCase());
    }
    return filtered;
  };

  const filteredAlerts = applyFilters(showAll ? alerts : alerts.filter(alert => !alert.read));

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />

      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
          <div className="flex items-center space-x-6">
            <span className="relative">
              <BellIcon className="w-8 h-8 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </span>
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
            >
              {showAll ? 'Show Unread Only' : 'Show All'}
            </button>
          </div>
        </div>

        {/* Filtering Section */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Filter Notifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-600 mb-2">Urgency</label>
              <select
                value={filters.urgency}
                onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-600 mb-2">Reported By</label>
              <input
                type="text"
                value={filters.reportedBy}
                onChange={(e) => setFilters({ ...filters, reportedBy: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-2">Date</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="In Review">In Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Compensated">Compensated</option>
              </select>
            </div>
          </div>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="text-center text-gray-500 py-12">No notifications to display.</div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-5 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${
                    !alert.read ? 'border-2 border-yellow-300' : ''
                  }`}
                  onClick={() => setSelectedAlert(alert)}
                >
                  {alert.imageUrl ? (
                    <img
                      src={alert.imageUrl}
                      alt=""
                      aria-hidden="true"

                      className="w-full h-48 object-cover rounded-t-lg mb-4"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                        console.error('Image failed to load:', alert.imageUrl);
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-t-lg mb-4">
                      <span className="text-gray-500">No Image Available</span>
                    </div>
                  )}
                  <div className="space-y-3">
                    <p className="text-base font-semibold text-gray-700">
                      {alert.type === 'Crop Loss' ? '🚨 Crop Loss' : '📢 Govt Message'}
                      {alert.type === 'Crop Loss' && (
                        <> in <span className="font-bold">{alert.panchayat}</span> ({alert.croptype})</>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">Date: {alert.date}</p>
                    <p className="text-sm text-gray-500">Reported By: {alert.reportedBy}</p>
                    <p className="text-sm text-gray-600">Details: {alert.description}</p>
                    <p className="text-sm text-gray-500">Urgency: {alert.urgency}</p>
                    <p className="text-sm text-gray-500">
                      Status: {alert.read ? '✅ Read' : '📩 Unread'}
                    </p>
                    {!alert.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(alert.id);
                        }}
                        className="mt-3 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {selectedAlert && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={() => setSelectedAlert(null)}
              >
                <div
                  className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl mx-4 md:mx-0 max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out animate-fadeInSlideUp"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Notification Details</h2>
                  <div className="space-y-4">
                    <p><strong>Tracking ID:</strong> {selectedAlert.trackingId}</p>
                    <p><strong>ID:</strong> {selectedAlert.id}</p>
                    <p><strong>Location:</strong> {selectedAlert.location}</p>
                    <p><strong>Damage Cause:</strong> {selectedAlert.damageCause}</p>
                    <p><strong>Percentage:</strong> {selectedAlert.percentage}%</p>
                    <p><strong>Land (acres):</strong> {selectedAlert.land}</p>
                    <p><strong>Status:</strong> {selectedAlert.status}</p>
                    <p><strong>Block:</strong> {selectedAlert.block}</p>
                    <p><strong>Panchayat:</strong> {selectedAlert.panchayat}</p>
                    <p><strong>Crop Type:</strong> {selectedAlert.croptype}</p>
                    <p><strong>Urgency:</strong> {selectedAlert.urgency}</p>
                    <p><strong>Report Date:</strong> {selectedAlert.date}</p>
                    <p><strong>Created At:</strong> {selectedAlert.createdAt}</p>
                    <p><strong>Reported By:</strong> {selectedAlert.reportedBy}</p>
                    <p><strong>Description:</strong> {selectedAlert.description}</p>
                    {selectedAlert.imageUrl ? (
                      <img
                        src={selectedAlert.imageUrl}
                        alt="Detailed View"
                        className="w-full max-h-96 object-contain rounded mt-4"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Available';
                        }}
                      />
                    ) : (
                      <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded mt-4">
                        <span className="text-gray-500">No Image Available</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedAlert(null)}
                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;