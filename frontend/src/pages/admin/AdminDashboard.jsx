// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AdminNavbar from '../../components/admin/AdminNavbar';
//import html2canvas from 'html2canvas';
import { useRef } from 'react';
//import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.default.vfs;


const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState({
    critical: 0,
    pending: 0,
    approved: 0,
    compensated: 0
  });
  const [filters, setFilters] = useState({
    damagecause: '', urgency: '', block: '', panchayat: '', status: ''
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [action, setAction] = useState('');
  const [remarks, setRemarks] = useState('');
  const pdfRef = useRef();
  const fetchData = useCallback(async () => {
    try {
      const sumRes = await axios.get('/api/admin/summary');
      setSummary(sumRes.data || {});
      const repRes = await axios.get('/api/admin/reports', { params: filters });
      setReports(repRes.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleActionSubmit = async () => {
    if (!selectedReport || !action) return;
    try {
      await axios.patch(`/api/admin/reports/${selectedReport.id}`, {
        status: action,
        remarks
      });
      setAction('');
      setRemarks('');
      setSelectedReport(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error updating report');
    }
  };

 const handleDownload = async () => {
  if (!selectedReport) return;

  const formatDate = dateStr =>
    dateStr ? new Date(dateStr).toLocaleDateString() : '—';

  // 1. Convert image URL to base64
  const toDataURL = url =>
    fetch(url)
      .then(response => response.blob())
      .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }));

  let imageBase64 = null;
  try {
    if (selectedReport.imageurl) {
      imageBase64 = await toDataURL(selectedReport.imageurl);
    }
  } catch (e) {
    console.error('Image conversion failed:', e);
    alert('Failed to load image for PDF. Proceeding without image.');
  }

  const fields = {
    'Farmer Name': selectedReport.farmer_name,
    'Location': selectedReport.location,
    'Panchayat': selectedReport.panchayat,
    'Block': selectedReport.block,
    'Crop': selectedReport.crop,
    'Crop Type': selectedReport.croptype,
    'Area (in ha)': selectedReport.area,
    'Loss Percent': selectedReport.losspercent + '%',
    'Loss Date': formatDate(selectedReport.loss_date),
    'Damage Cause': selectedReport.damagecause,
    'Urgency': selectedReport.urgency,
    'Status': selectedReport.status,
    'Description': selectedReport.description,
    'Remarks': selectedReport.remarks,
    'Tracking ID': selectedReport.trackingid,
    'Processed Date': formatDate(selectedReport.processed_date),
    'Submitted At': formatDate(selectedReport.submitted_at),
    'In Review At': formatDate(selectedReport.in_review_at),
    'Approved At': formatDate(selectedReport.approved_at),
    'Rejected At': formatDate(selectedReport.rejected_at),
    'Compensated At': formatDate(selectedReport.compensated_at),
  };

  const body = Object.entries(fields).map(([key, value]) => [
    { text: key, bold: true, margin: [0, 4] },
    { text: value || '—', margin: [0, 4] }
  ]);

  const docDefinition = {
    pageSize: 'A4',
    content: [
      { text: 'Crop Loss Individual Report', style: 'header' },
      { text: `Generated on: ${new Date().toLocaleDateString()}`, style: 'subheader', margin: [0, 0, 0, 20] },
      {
        table: {
          widths: ['30%', '70%'],
          body: body
        },
        layout: 'lightHorizontalLines'
      },
      imageBase64 && {
        text: 'Attached Image Evidence:',
        style: 'subheader',
        margin: [0, 20, 0, 10]
      },
      imageBase64 && {
        image: imageBase64,
        width: 400,
        alignment: 'center',
        margin: [0, 0, 0, 20]
      }
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 10]
      },
      subheader: {
        fontSize: 12,
        color: '#444',
        alignment: 'center'
      }
    }
  };

  pdfMake.createPdf(docDefinition).download(`Report_${selectedReport.id}.pdf`);
};




  const getStatusColor = s => ({
    Pending: 'bg-yellow-100 text-yellow-800',
    'In Review': 'bg-blue-100 text-blue-800',
    Approved: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
    Compensated: 'bg-purple-100 text-purple-800'
  }[s] || 'bg-gray-100 text-gray-800');

  const getUrgencyColor = u => ({
    Critical: 'bg-red-100 text-red-800',
    High: 'bg-orange-100 text-orange-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Low: 'bg-green-100 text-green-800'
  }[u] || 'bg-gray-100 text-gray-800');

  const formatDate = dateStr => dateStr ? new Date(dateStr).toLocaleDateString() : '—';

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Idukki District Agricultural Loss Management</h1>
            <p className="text-gray-600">Administration Dashboard</p>
          </div>
          <div className="bg-green-600 text-white px-4 py-2 rounded-md">
            Officer: Agriculture Department
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Critical Cases', count: summary.critical, color: 'border-red-500' },
            { label: 'Pending Review', count: summary.pending, color: 'border-yellow-500' },
            { label: 'Approved', count: summary.approved, color: 'border-green-500' },
            { label: 'Compensated', count: summary.compensated, color: 'border-purple-500' }
          ].map(card => (
            <div key={card.label} className={`bg-white p-4 rounded-lg shadow border-l-4 ${card.color}`}>
              <h3 className="text-gray-500 text-sm font-medium">{card.label}</h3>
              <p className="text-2xl font-bold">{card.count}</p>
              <p className="text-xs text-gray-500">{
                card.label === 'Critical Cases' ? 'Require immediate attention' :
                card.label === 'Pending Review' ? 'Awaiting assessment' :
                card.label === 'Approved' ? 'Ready for compensation' :
                'Cases resolved'
              }</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Filter Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {['damagecause', 'urgency', 'block', 'panchayat', 'status'].map(key => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={filters[key]}
                  onChange={e => setFilters(prev => ({ ...prev, [key]: e.target.value }))}
                >
                  <option value="">All</option>
                  {(key === 'damagecause'
                    ? ['Flood', 'Drought', 'Landslide', 'Pest Attack', 'Disease']
                    : key === 'urgency'
                    ? ['Critical', 'High', 'Medium', 'Low']
                    : key === 'block'
                    ? ['Thodupuzha', 'Idukki', 'Adimali', 'Nedumkandam', 'Devikulam']
                    : key === 'panchayat'
                    ? ['Vannappuram', 'Rajakumari', 'Adimali', 'Muttom', 'Chakkupallam']
                    : ['Pending', 'In Review', 'Approved', 'Rejected', 'Compensated']
                  ).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
</div>


        {/* Reports Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Crop Loss Reports</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>{['ID', 'Farmer', 'Location', 'Crop', 'Cause', 'Urgency', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{r.id}</td>
                    <td className="px-6 py-4">{r.farmer_name}</td>
                    <td className="px-6 py-4">{r.panchayat}<br/><span className="text-xs text-gray-400">{r.block}</span></td>
                    <td className="px-6 py-4">{r.crop}<br/><span className="text-xs text-gray-400">{r.area} ha</span></td>
                    <td className="px-6 py-4">{r.damagecause}</td>
                    <td className="px-6 py-4">
  {r.losspercent}%<br/>
  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getUrgencyColor(r.urgency)}`}>
    {r.urgency}
  </span>
</td>

                    <td className="px-6 py-4"><span className={`px-2 inline-flex text-xs font-semibold rounded-full ${getStatusColor(r.status)}`}>{r.status}</span></td>
                    <td className="px-6 py-4"><button onClick={() => setSelectedReport(r)} className="text-green-600 hover:text-green-900">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-medium text-gray-900">Report Details - #{selectedReport.id}</h3>
                <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-500">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              

              {/* Detail grid */}
              <div  ref={pdfRef} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Farmer Info</h4>
                  <p className="text-sm text-gray-900">{selectedReport.farmer_name}<br/>{selectedReport.panchayat}, {selectedReport.block}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Crop Info</h4>
                  <p className="text-sm text-gray-900">{selectedReport.crop} – {selectedReport.area} ha<br/>Loss: {formatDate(selectedReport.loss_date)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Urgency & Cause</h4>
                  <p className="text-sm text-gray-900">{selectedReport.damagecause}<br/><span className={`mt-1 px-2 inline-flex text-xs rounded-full ${getUrgencyColor(selectedReport.urgency)}`}>{selectedReport.urgency}</span></p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <p className="text-sm text-gray-900"><span className={`px-2 inline-flex text-xs rounded-full ${getStatusColor(selectedReport.status)}`}>{selectedReport.status}</span></p>
                </div>
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-500">Details</h4>
                  <p className="text-sm text-gray-900">{selectedReport.description}</p>
                </div>
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-500">Timeline</h4>
                  <ul className="text-sm text-gray-700 mt-1 space-y-1">
                    <li>Reported: {formatDate(selectedReport.submitted_at)}</li>
                    <li>In Review: {formatDate(selectedReport.in_review_at)}</li>
                    <li>Approved: {formatDate(selectedReport.approved_at)}</li>
                    <li>Rejected: {formatDate(selectedReport.rejected_at)}</li>
                    <li>Compensated: {formatDate(selectedReport.compensated_at)}</li>
                  </ul>
                </div>

                <div className="md:col-span-2">
  <h4 className="text-sm font-medium text-gray-500">Tracking ID</h4>
  <p className="text-sm text-gray-900">{selectedReport.trackingid}</p>
</div>
{selectedReport.imageurl && (
  <div className="md:col-span-2">
    <h4 className="text-sm font-medium text-gray-500">Image Evidence</h4>
    <img src={selectedReport.imageurl} alt="Damage" className="max-w-full h-auto rounded border" />
  </div>
)}

              </div>

              {/* Action Section */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Take Action</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Action</label>
                    <select
                      className="w-full border border-gray-300 rounded-md p-2"
                      value={action}
                      onChange={e => setAction(e.target.value)}
                    >
                      <option value="">Select Action</option>
                      <option value="In Review">Mark as In Review</option>
                      <option value="Approved">Approve for Compensation</option>
                      <option value="Rejected">Reject Claim</option>
                      <option value="Compensated">Mark as Compensated</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Remarks</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-md p-2"
                      rows="2"
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                      placeholder="Add remarks"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
  <button 
    onClick={() => setSelectedReport(null)} 
    className="px-4 py-2 border rounded-md text-sm bg-white hover:bg-gray-50"
  >
    Cancel
  </button>

  {/* New Download PDF Button */}
  <button
    onClick={handleDownload}
    className="flex items-center px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 mr-2"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
    Download PDF
  </button>

  <button
    onClick={handleActionSubmit}
    disabled={!action}
    className={`px-4 py-2 text-sm text-white rounded-md bg-green-600 hover:bg-green-700 ${!action && 'opacity-50 cursor-not-allowed'}`}
  >
    Submit Action
  </button>
</div>
              </div>
            </div>
          </div>
        )}
      </div>
    
  );
};

export default AdminDashboard;
