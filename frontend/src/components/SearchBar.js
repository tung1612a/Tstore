import React, { useEffect } from 'react';
import { Form, FormControl, Button, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

function SearchBar({ onSearch, className = '', initialValue = '' }) {
  const [keyword, setKeyword] = React.useState(initialValue);

  useEffect(() => {
    setKeyword(initialValue);
  }, [initialValue]);

  const submit = (e) => {
    e.preventDefault();
    onSearch?.(keyword.trim());
  };
  const { t } = useTranslation();
  const formClassName = ['search-bar-form', className].filter(Boolean).join(' ');

  return (
    <Form onSubmit={submit} className={formClassName}>
      <InputGroup className="w-100">
        <FormControl
          placeholder={t('SearchBar.1')}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Button type="submit" variant="primary">{t('SearchBar.2')}</Button>
      </InputGroup>
    </Form>
  );
}

export default SearchBar;
