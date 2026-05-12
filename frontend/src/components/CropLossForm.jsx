// frontend/src/CropLossForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CropLossForm = () => {
  const navigate = useNavigate();

  // Main form data
  const [formData, setFormData] = useState({
    name: '', location: '', panchayat: '', block: '',
    cropType: '', damageCause: '', description: '',
    percentage: '', land: '', submitted_at: '', image: null,
  });

  // For "Other" inputs
  const [customCrop, setCustomCrop] = useState('');
  const [customCause, setCustomCause] = useState('');

  // Block & Panchayat lookup data (Idukki)
  const blockOptions = ['Adimaly','Azhutha','Devikulam','Elamdesam','Idukki','Kattappana','Nedumkandam','Thodupuzha'];
  const panchayatsByBlock = {
    Adimaly: ['Bysonvalley','Konnathady','Pallivasal','Vellathooval','Adimaly'],
    Azhutha: ['Elappara','Kokkayar','Kumily','Peerumedu','Peruvanthanam','Vandiperiyar'],
    Devikulam: ['Chinnakkanal','Edamalakudy','Kanthalloor','Mankulam','Marayoor','Munnar','Santhanpara','Vattavada','Vellathooval'],
    Elamdesam: ['Alakode','Karimannoor','Kodikulam','Kudayathoor','Udumbannoor','Vannappuram','Velliamattom'],
    Idukki: ['Arakkulam','Kamakshy','Kanjikuzhy','Mariapuram','Vathykudy','Vazhathoppu'],
    Kattappana: ['Ayyappankoil','Chakkupallam','Erattayar','Kanchiyar','Upputhara','Vandanmedu'],
    Nedumkandam: ['Karunapuram','Nedumkandam','Pampadumpara','Rajakkad','Rajakumary','Senapathy','Udumbanchola'],
    Thodupuzha: ['Thodupuzha'], // municipal
  };

  const [trackingIdInput, setTrackingIdInput] = useState('');
  const [showTrackingInput, setShowTrackingInput] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'block') setFormData(prev => ({ ...prev, panchayat: '' }));
  };

  const handleImageUpload = e => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => setFormData(prev => ({
        ...prev,
        location: pos.coords.latitude + ', ' + pos.coords.longitude,
      })),
      () => alert('Unable to fetch location')
    );
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (isNaN(formData.percentage) || isNaN(formData.land)) {
      alert('Percentage and Land must be numeric');
      return;
    }

    const payload = new FormData();
    for (let key of ['name','location','block','panchayat',
                     'percentage','land','submitted_at','description']) {
      payload.append(key, formData[key]);
    }
    // Crop/Cause adjustments
    payload.append('cropType', formData.cropType === 'Other' ? customCrop : formData.cropType);
    payload.append('damageCause', formData.damageCause === 'Other' ? customCause : formData.damageCause);
    if (formData.image) payload.append('image', formData.image);

    try {
      const res = await fetch('http://localhost:5000/api/report', {
        method: 'POST', body: payload,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Submission failed');
      alert(`Report submitted! Tracking ID: ${data.report?.trackingId || 'N/A'}`);
      setFormData({
        name:'', location:'', panchayat:'', block:'',
        cropType:'', damageCause:'', description:'',
        percentage:'', land:'', submitted_at:'', image:null,
      });
      setCustomCrop('');
      setCustomCause('');
    } catch (err) {
      alert(`Submission error: ${err.message}`);
    }
  };

  const handleTrackSubmit = e => {
    e.preventDefault();
    if (trackingIdInput.trim()) {
      navigate(`/TrackReportDetails/${trackingIdInput.trim()}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold text-green-800 mb-4">Crop Loss Report</h2>
      <form onSubmit={handleSubmit}>
        {/* Name, Location */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label>Name</label>
            <input name="name" value={formData.name} onChange={handleChange}
              className="w-full border px-2 py-1" required />
          </div>
          {/* Location */}
          <div>
            <label>Location</label>
            <div className="flex">
              <input name="location" value={formData.location}
                onChange={handleChange} className="flex-1 border px-2 py-1"
                placeholder="coords or address" required />
              <button type="button" onClick={getCurrentLocation}
                className="ml-2 bg-green-500 text-white px-3 rounded">GPS</button>
            </div>
          </div>

          {/* Block */}
          <div>
            <label>Block</label>
            <select name="block" value={formData.block} onChange={handleChange}
              className="w-full border px-2 py-1" required>
              <option value="">Select Block</option>
              {blockOptions.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Panchayat */}
          <div>
            <label>Panchayat</label>
            <select name="panchayat" value={formData.panchayat}
              onChange={handleChange}
              className="w-full border px-2 py-1"
              required disabled={!formData.block}>
              <option value="">Select Panchayat</option>
              { formData.block && panchayatsByBlock[formData.block]
                .sort()
                .map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* CropType */}
          <div>
            <label>Crop Type</label>
            <select name="cropType" value={formData.cropType}
              onChange={handleChange} className="w-full border px-2 py-1" required>
              <option value="">Select Crop</option>
              {['Coffee','Pepper','Cardamom','Tea','Vegetables','Fruits','Other']
                .map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {formData.cropType === 'Other' && (
              <input type="text" placeholder="Custom crop"
                value={customCrop} onChange={e => setCustomCrop(e.target.value)}
                className="w-full border px-2 py-1 mt-1" required />
            )}
          </div>

          {/* DamageCause */}
          <div>
            <label>Cause of Damage</label>
            <select name="damageCause" value={formData.damageCause}
              onChange={handleChange} className="w-full border px-2 py-1" required>
              <option value="">Select Cause</option>
              {['Climate','Man-Animal Conflict','Pest/Disease','Other']
                .map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {formData.damageCause === 'Other' && (
              <input type="text" placeholder="Custom cause"
                value={customCause} onChange={e => setCustomCause(e.target.value)}
                className="w-full border px-2 py-1 mt-1" required />
            )}
          </div>

          {/* Percentage */}
          <div>
            <label>Damage Percentage (%)</label>
            <input type="number" name="percentage"
              value={formData.percentage} onChange={handleChange}
              className="w-full border px-2 py-1" min="0" max="100" required />
          </div>

          {/* Land */}
          <div>
            <label>Land Area (acres)</label>
            <input type="float" name="land"
              value={formData.land} onChange={handleChange}
              className="w-full border px-2 py-1" min="0" required />
          </div>

          {/* Submitted Date */}
          <div>
            <label>Loss Date</label>
            <input type="date" name="submitted_at"
              value={formData.submitted_at} onChange={handleChange}
              className="w-full border px-2 py-1" />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label>Description (optional)</label>
            <textarea name="description" value={formData.description}
              onChange={handleChange}
              className="w-full border px-2 py-1" rows="4" />
          </div>

          {/* Image */}
          <div className="md:col-span-2">
            <label>Upload Photo (optional)</label>
            <input type="file" accept="image/*"
              onChange={handleImageUpload}
              className="border w-full px-2 py-1" />
          </div>

        </div>

        {/* Submit */}
        <button type="submit"
          className="mt-4 bg-green-700 text-white w-full py-2 rounded">
          Submit Report
        </button>
      </form>

      {/* Tracking */}
      <div className="mt-6 text-center">
        {!showTrackingInput ? (
          <button onClick={() => setShowTrackingInput(true)}
            className="bg-green-600 text-white px-4 py-2 rounded">
            Track Application Status
          </button>
        ) : (
          <form onSubmit={handleTrackSubmit} className="mt-2">
            <input type="text" placeholder="Tracking ID"
              value={trackingIdInput}
              onChange={e => setTrackingIdInput(e.target.value)}
              className="border px-2 py-1 mr-2" required />
            <button type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded">
              Submit
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CropLossForm;
