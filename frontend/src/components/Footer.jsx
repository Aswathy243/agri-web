import React from 'react';


const Footer = () => {
  return (
    <footer className="bg-green-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Digital Agricultural Companion</h3>
            <p className="text-green-200">Smart farming solutions for Idukki district</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="hover:text-green-300">Home</a></li>
              <li><a href="/advisory" className="hover:text-green-300">Smart Advisory</a></li>
              <li><a href="/crop-loss" className="hover:text-green-300">Crop Loss Report</a></li>
              <li><a href="/forum" className="hover:text-green-300">Farmer Forum</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <p className="text-green-200">Idukki Collectorate</p>
            <p className="text-green-200">Phone: +91 1234567890</p>
            <p className="text-green-200">Email: agricompanion@idukki.gov.in</p>
          </div>
        </div>
        <small className="text-xs text-gray-500 text-center mt-2">
  Translation powered by Google Translate.
</small>

        <div className="border-t border-green-700 mt-8 pt-6 text-center text-green-300">
          <p>© 2025 Digital Agricultural Companion. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;