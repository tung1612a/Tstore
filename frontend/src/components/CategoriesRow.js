import React from 'react';
import { Row, Col, Card, Spinner, Alert, ListGroup } from 'react-bootstrap';

function CategoriesRow() {
  const [categories, setCategories] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch('/api/categories')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load categories');
        const json = await res.json();
        if (isMounted) setCategories(json);
      })
      .catch((err) => isMounted && setError(err.message))
      .finally(() => isMounted && setLoading(false));
    return () => { isMounted = false; };
  }, []);

  if (loading) return <Spinner animation="border" size="sm" />;
  if (error) return <Alert variant="warning">{error}</Alert>;

  return (
    <Card>
      <Card.Body>
        <Card.Title className="h5">Danh mục</Card.Title>
        <ListGroup variant="flush">
          {categories.map((c) => (
            <ListGroup.Item key={c._id} action href="#">
              {c.name}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}

export default CategoriesRow;


