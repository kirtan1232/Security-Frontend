import React from 'react';
import logoImage from '../assets/images/logo.png';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t, i18n } = useTranslation();

  return (
    <footer className={`bg-gray-800/80 backdrop-blur-xl rounded-lg shadow-xl border border-gray-700/50 m-4 relative ${i18n.language === 'ne' ? 'font-noto-sans' : ''}`}>
      {/* Big logo positioned at left center */}
      <div className="absolute left-8 top-1/2 transform -translate-y-1/2">
        <a href="https://flowbite.com/" className="flex items-center">
          <img 
            src={logoImage} 
            className="h-24 md:h-32 lg:h-40"
            alt="Anna Logo" 
          />
        </a>
      </div>

      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8 pl-32 md:pl-40 lg:pl-48">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
            <div className="flex space-x-4 ml-4">
              <a href="https://facebook.com" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                <i className="fab fa-facebook-f text-2xl"></i>
              </a>
              <a href="https://twitter.com" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                <i className="fab fa-twitter text-2xl"></i>
              </a>
              <a href="https://instagram.com" className="text-gray-400 hover:text-purple-400 transition-colors duration-300">
                <i className="fab fa-instagram text-2xl"></i>
              </a>
            </div>
          </div>
          <ul className="flex flex-wrap items-center mb-6 text-lg font-medium text-gray-300 sm:mb-0">
            <li>
              <a href="#" className="hover:text-purple-400 transition-colors duration-300 me-4 md:me-6">{t('About')}</a>
            </li>
            <li>
              <a href="#" className="hover:text-purple-400 transition-colors duration-300 me-4 md:me-6">{t('Privacy Policy')}</a>
            </li>
            <li>
              <a href="#" className="hover:text-purple-400 transition-colors duration-300 me-4 md:me-6">{t('Licensing')}</a>
            </li>
            <li>
              <a href="#" className="hover:text-purple-400 transition-colors duration-300">{t('Contact')}</a>
            </li>
          </ul>
        </div>
        
        <hr className="my-6 border-gray-700 sm:mx-auto lg:my-8" />
        <span className="block text-sm text-gray-400 sm:text-center">
          {t('© 2025 Soundwise™. All Rights Reserved.')}<br />{t('Kirtan Shrestha')}
        </span>
      </div>
    </footer>
  );
};

export default Footer;