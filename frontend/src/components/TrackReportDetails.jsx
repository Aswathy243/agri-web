import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const TrackReportDetails = () => {
  const { trackingId } = useParams();
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(`/api/report/TrackReportDetails/${trackingId}`);
        setReport(response.data.report);

      } catch (err) {
        setError('Report not found or server error.');
      }
    };

    fetchReport();
  }, [trackingId]);

  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;
  if (!report) return <div className="text-center mt-8">Loading...</div>;

  const statusStyle = {
    pending: 'bg-gray-100 text-gray-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    review: 'bg-blue-100 text-blue-700',
  }[(report?.status || '').toLowerCase()] || 'bg-gray-100 text-gray-700';

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white shadow-xl rounded-xl p-10">
      <h2 className="text-3xl font-bold text-center mb-8">Report Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div>
          <label className="block text-sm font-medium text-gray-600">Farmer Name</label>
          <div className="mt-1 p-2 bg-gray-100 rounded">{report.name || '—'}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Crop Type</label>
          <div className="mt-1 p-2 bg-gray-100 rounded">{report.cropType || '—'}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Land (ha)</label>
          <div className="mt-1 p-2 bg-gray-100 rounded">{report.land || '—'}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Damage Cause</label>
          <div className="mt-1 p-2 bg-gray-100 rounded">{report.damageCause || '—'}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Loss (%)</label>
          <div className="mt-1 p-2 bg-gray-100 rounded">
            {report.percentage ? `${report.percentage}%` : '—'}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Status</label>
          <div
            className={`mt-1 inline-block px-3 py-1 text-sm rounded-full font-medium ${statusStyle}`}
          >
            {report.status || 'Pending'}
          </div>
        </div>
      </div>

      {/* Full-width Description */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-600">Description</label>
        <div className="mt-1 p-2 bg-gray-100 rounded">{report.description || '—'}</div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-sm text-gray-500 border-t pt-4 text-right">
        Tracking ID: <span className="font-medium">{trackingId}</span>
      </div>
    </div>
  );
};

export default TrackReportDetails;
