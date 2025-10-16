import React from 'react';
import { Form, FormControl, Button, InputGroup } from 'react-bootstrap';

function SearchBar({ onSearch }) {
  const [keyword, setKeyword] = React.useState('');
  const submit = (e) => {
    e.preventDefault();
    onSearch?.(keyword);
  };
  return (
    <Form onSubmit={submit} className="mb-3">
      <InputGroup>
        <FormControl
          placeholder="Tìm sản phẩm..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Button type="submit" variant="primary">Tìm</Button>
      </InputGroup>
    </Form>
  );
}

export default SearchBar;


