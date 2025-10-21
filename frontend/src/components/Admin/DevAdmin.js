import React from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { FiSettings, FiDatabase, FiMonitor, FiCode, FiShield, FiServer, FiActivity } from 'react-icons/fi';
import ProtectedRoute from '../ProtectedRoute';

function DevAdmin() {
  const systemStats = [
    { title: 'Server Status', value: 'Online', status: 'success' },
    { title: 'Database', value: 'Connected', status: 'success' },
    { title: 'API Response', value: '245ms', status: 'warning' },
    { title: 'Active Users', value: '1,234', status: 'info' }
  ];

  const recentLogs = [
    { level: 'ERROR', message: 'Database connection timeout', time: '2 minutes ago' },
    { level: 'WARN', message: 'High memory usage detected', time: '5 minutes ago' },
    { level: 'INFO', message: 'User login successful', time: '10 minutes ago' },
    { level: 'INFO', message: 'New order created', time: '15 minutes ago' }
  ];

  return (
    <ProtectedRoute requiredRole="devadmin">
      <Container className="py-4">
        <Row className="mb-4">
          <Col>
            <div className="d-flex align-items-center">
              <FiCode className="me-3 text-danger" size={32} />
              <div>
                <h2 className="mb-0">Dev Admin Dashboard</h2>
                <p className="text-muted mb-0">Quản lý hệ thống và phát triển</p>
              </div>
            </div>
          </Col>
        </Row>

        {/* System Status */}
        <Row className="mb-4">
          {systemStats.map((stat, index) => (
            <Col md={3} key={index} className="mb-3">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <Badge bg={stat.status} className="mb-2">
                    {stat.value}
                  </Badge>
                  <h6 className="mb-0">{stat.title}</h6>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* System Management */}
        <Row className="mb-4">
          <Col md={6} className="mb-4">
            <Card className="h-100">
              <Card.Header className="bg-danger text-white">
                <h5 className="mb-0">Hệ thống</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  <Button variant="outline-primary" href="/admin/system/status">
                    <FiMonitor className="me-2" />
                    System Status
                  </Button>
                  <Button variant="outline-success" href="/admin/system/restart">
                    <FiServer className="me-2" />
                    Restart Services
                  </Button>
                  <Button variant="outline-warning" href="/admin/system/backup">
                    <FiDatabase className="me-2" />
                    Database Backup
                  </Button>
                  <Button variant="outline-info" href="/admin/system/config">
                    <FiSettings className="me-2" />
                    System Config
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} className="mb-4">
            <Card className="h-100">
              <Card.Header className="bg-warning text-white">
                <h5 className="mb-0">Database & Logs</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  <Button variant="outline-primary" href="/admin/database/query">
                    <FiDatabase className="me-2" />
                    Database Query
                  </Button>
                  <Button variant="outline-success" href="/admin/logs">
                    <FiActivity className="me-2" />
                    System Logs
                  </Button>
                  <Button variant="outline-warning" href="/admin/database/migrate">
                    <FiDatabase className="me-2" />
                    Run Migrations
                  </Button>
                  <Button variant="outline-info" href="/admin/logs/errors">
                    <FiActivity className="me-2" />
                    Error Logs
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} className="mb-4">
            <Card className="h-100">
              <Card.Header className="bg-info text-white">
                <h5 className="mb-0">Security & Monitoring</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  <Button variant="outline-primary" href="/admin/security">
                    <FiShield className="me-2" />
                    Security Settings
                  </Button>
                  <Button variant="outline-success" href="/admin/monitoring">
                    <FiMonitor className="me-2" />
                    Performance Monitor
                  </Button>
                  <Button variant="outline-warning" href="/admin/security/audit">
                    <FiShield className="me-2" />
                    Security Audit
                  </Button>
                  <Button variant="outline-info" href="/admin/api/keys">
                    <FiSettings className="me-2" />
                    API Keys
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} className="mb-4">
            <Card className="h-100">
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">Development Tools</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  <Button variant="outline-primary" href="/admin/dev/deploy">
                    <FiCode className="me-2" />
                    Deploy Code
                  </Button>
                  <Button variant="outline-success" href="/admin/dev/test">
                    <FiCode className="me-2" />
                    Run Tests
                  </Button>
                  <Button variant="outline-warning" href="/admin/dev/cache">
                    <FiSettings className="me-2" />
                    Clear Cache
                  </Button>
                  <Button variant="outline-info" href="/admin/dev/queue">
                    <FiActivity className="me-2" />
                    Queue Management
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Logs */}
        <Row>
          <Col>
            <Card>
              <Card.Header className="bg-dark text-white">
                <h5 className="mb-0">Recent System Logs</h5>
              </Card.Header>
              <Card.Body>
                {recentLogs.map((log, index) => (
                  <Alert 
                    key={index} 
                    variant={log.level === 'ERROR' ? 'danger' : log.level === 'WARN' ? 'warning' : 'info'}
                    className="mb-2"
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <Badge bg={log.level === 'ERROR' ? 'danger' : log.level === 'WARN' ? 'warning' : 'info'}>
                          {log.level}
                        </Badge>
                        <span className="ms-2">{log.message}</span>
                      </div>
                      <small className="text-muted">{log.time}</small>
                    </div>
                  </Alert>
                ))}
                <div className="text-center mt-3">
                  <Button variant="outline-primary" href="/admin/logs">
                    View All Logs
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </ProtectedRoute>
  );
}

export default DevAdmin;
