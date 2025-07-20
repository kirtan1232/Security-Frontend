import React from 'react';
import logoImage from '../assets/images/logo.png';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t, i18n } = useTranslation();

  return (
    <footer className={`bg-white rounded-lg shadow-sm dark:bg-gray-900 m-4 relative ${i18n.language === 'ne' ? 'font-noto-sans' : ''}`}>
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
              <a href="https://facebook.com" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                <i className="fab fa-facebook-f text-2xl"></i>
              </a>
              <a href="https://twitter.com" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                <i className="fab fa-twitter text-2xl"></i>
              </a>
              <a href="https://instagram.com" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                <i className="fab fa-instagram text-2xl"></i>
              </a>
            </div>
          </div>
          <ul className="flex flex-wrap items-center mb-6 text-lg font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
            <li>
              <a href="#" className="hover:underline me-4 md:me-6">{t('About')}</a>
            </li>
            <li>
              <a href="#" className="hover:underline me-4 md:me-6">{t('Privacy Policy')}</a>
            </li>
            <li>
              <a href="#" className="hover:underline me-4 md:me-6">{t('Licensing')}</a>
            </li>
            <li>
              <a href="#" className="hover:underline">{t('Contact')}</a>
            </li>
          </ul>
        </div>
        
        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">
          {t('© 2025 Soundwise™. All Rights Reserved.')}<br />{t('Kirtan Shrestha')}
        </span>
      </div>
    </footer>
  );
};

export default Footer;