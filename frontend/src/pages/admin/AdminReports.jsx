import React, { useState } from 'react';
import AdminNavbar from '../../components/admin/AdminNavbar';

const mockReports = [
  {
    id: 1,
    cause: 'Flood',
    urgency: 'Medium',
    location: 'Udumbanchola',
    date: '2025-06-04',
    officer: 'Village Officer',
    status: 'Reviewed',
  },
  {
    id: 2,
    cause: 'Flood',
    urgency: 'Low',
    location: 'Devikulam',
    date: '2025-06-05',
    officer: 'Agriculture Officer',
    status: 'Pushed to Compensation',
  },
  {
    id: 3,
    cause: 'Wild Animal Attack',
    urgency: 'Medium',
    location: 'Devikulam',
    date: '2025-05-24',
    officer: 'Village Officer',
    status: 'Pending',
  },
  {
    id: 4,
    cause: 'Pest Attack',
    urgency: 'Medium',
    location: 'Peerumedu',
    date: '2025-05-20',
    officer: 'Village Officer',
    status: 'Reviewed',
  },
  {
    id: 5,
    cause: 'Wild Animal Attack',
    urgency: 'Medium',
    location: 'Udumbanchola',
    date: '2025-05-29',
    officer: 'Agriculture Officer',
    status: 'Reviewed',
  },
  {
    id: 6,
    cause: 'Drought',
    urgency: 'High',
    location: 'Udumbanchola',
    date: '2025-05-17',
    officer: 'Agriculture Officer',
    status: 'Pushed to Compensation',
  },
  {
    id: 7,
    cause: 'Pest Attack',
    urgency: 'High',
    location: 'Devikulam',
    date: '2025-05-22',
    officer: 'Agriculture Officer',
    status: 'Reviewed',
  },
  {
    id: 8,
    cause: 'Pest Attack',
    urgency: 'Medium',
    location: 'Thodupuzha',
    date: '2025-05-30',
    officer: 'Agriculture Officer',
    status: 'Pushed to Compensation',
  },
];

const AdminReports = () => {
  const [filter, setFilter] = useState('');
  const adminRole = localStorage.getItem('adminRole') || 'Agriculture Officer';

  const filteredReports = mockReports.filter(report =>
    filter ? report.cause === filter || report.urgency === filter : true
  );

  const handleAction = (id) => {
    alert(`Action triggered for report ID: ${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Crop Loss Reports ({adminRole})</h1>

        <div className="flex flex-wrap gap-4 mb-6">
          <select
            className="p-2 rounded border"
            onChange={(e) => setFilter(e.target.value)}
            defaultValue=""
          >
            <option value="">-- Filter by Cause/Urgency --</option>
            <option value="Flood">Flood</option>
            <option value="Drought">Drought</option>
            <option value="Pest Attack">Pest Attack</option>
            <option value="Wild Animal Attack">Wild Animal Attack</option>
            <option value="Low">Urgency: Low</option>
            <option value="Medium">Urgency: Medium</option>
            <option value="High">Urgency: High</option>
          </select>
        </div>

        <div className="grid gap-4">
          {filteredReports.length === 0 ? (
            <p>No reports found for selected filter.</p>
          ) : (
            filteredReports.map(report => (
              <div
                key={report.id}
                className="bg-white p-4 rounded shadow flex justify-between items-center"
              >
                <div>
                  <p><strong>Cause:</strong> {report.cause}</p>
                  <p><strong>Urgency:</strong> {report.urgency}</p>
                  <p><strong>Location:</strong> {report.location}</p>
                  <p><strong>Date:</strong> {report.date}</p>
                  <p><strong>Submitted by:</strong> {report.officer}</p>
                  <p><strong>Status:</strong> <span className="font-semibold">{report.status}</span></p>
                </div>
                <div>
                  {adminRole !== 'Collectorate' && report.status === 'Pending' && (
                    <button
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      onClick={() => handleAction(report.id)}
                    >
                      Push to Compensation
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
