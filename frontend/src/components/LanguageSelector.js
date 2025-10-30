import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FiGlobe } from 'react-icons/fi';

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const languages = [
    { code: 'vi', name: t('language.vietnamese'), flag: '🇻🇳' },
    { code: 'en', name: t('language.english'), flag: '🇺🇸' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <Dropdown align="end" className="me-2">
      <Dropdown.Toggle variant="outline-secondary" size="sm" className="d-flex align-items-center">
        <FiGlobe className="me-1" />
        {currentLanguage.flag}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {languages.map((lang) => (
          <Dropdown.Item
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            active={i18n.language === lang.code}
          >
            {lang.flag} {lang.name}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageSelector;

