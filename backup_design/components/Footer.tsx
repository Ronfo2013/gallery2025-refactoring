import React from 'react';
import { useAppContext } from '../contexts/AppContext';

const Footer: React.FC = () => {
  const { siteSettings } = useAppContext();

  return (
    <footer className="bg-white mt-12 py-8 border-t border-gray-200">
      <div className="container-xl mx-auto px-6 text-center">
        <p className="text-gray-600 text-sm">{siteSettings.footerText}</p>
        <p className="text-gray-400 text-xs mt-2">Built with ❤️ using modern web technologies</p>
      </div>
    </footer>
  );
};

export default Footer;
