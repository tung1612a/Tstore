import React from 'react';
import { Form, FormControl, Button, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

function SearchBar({ onSearch }) {
  const [keyword, setKeyword] = React.useState('');
  const submit = (e) => {
    e.preventDefault();
    onSearch?.(keyword);
  };
  const { t } = useTranslation();

  return (
    <Form onSubmit={submit} className="mb-3">
      <InputGroup>
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
