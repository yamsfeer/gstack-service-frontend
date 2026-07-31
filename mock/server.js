// Minimal mock API server for development
// Runs on port 8000 and serves all backend API endpoints the app needs
const express = require('express');
const app = express();
const PORT = 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ========== User / Auth APIs ==========

// getUserInfo
app.get('/lanus/api/v1/user/0', (req, res) => {
  res.json({
    error_code: 0,
    data: {
      user: {
        username: 'admin',
        name: '管理员',
        email: 'admin@example.com',
        policies: [{ name: 'TicketFullAccess' }],
        isServiceAdmin: true
      }
    }
  });
});

// getAuthToken
app.get('/auth', (req, res) => {
  res.json({
    error_code: 0,
    data: { access_token: 'mock-token-123456' }
  });
});

// getUserTenant (tenant of user)
app.get('/tenant_management/api/v1/getTenantsOfuser', (req, res) => {
  res.json({
    error_code: 0,
    data: { tenant_list: [] }
  });
});

// getUserTenant (all tenants for admin)
app.get('/tenant_management/api/v1/getTenat', (req, res) => {
  res.json({
    error_code: 0,
    data: { tenat_list: [] }
  });
});

// logout
app.post('/lanus/api/v1/user/0', (req, res) => {
  if (req.query.cmd === 'Logout') {
    return res.json({ error_code: 0, error_msg: '已退出' });
  }
  res.json({ error_code: 0, data: {} });
});

// get user list
app.get('/lanus/api/v1/users', (req, res) => {
  res.json({ error_code: 0, data: { users: [], total: 0 } });
});

// get user by ids
app.post('/lanus/api/v1/users', (req, res) => {
  if (req.query.cmd === 'GetUserListById') {
    return res.json({ error_code: 0, data: { users: [] } });
  }
  if (req.query.cmd === 'GetUserListByUsername') {
    return res.json({ error_code: 0, data: { users: [] } });
  }
  res.json({ error_code: 0, data: { users: [], total: 0 } });
});

// get groups
app.get('/lanus/api/v1/groups', (req, res) => {
  res.json({ error_code: 0, data: { groups: [], total: 0 } });
});

app.post('/lanus/api/v1/groups', (req, res) => {
  res.json({ error_code: 0, data: { groups: [] } });
});

// ========== Ticket / Order APIs ==========

// get order types
app.get('/ticket/api/v1/ticket_types', (req, res) => {
  res.json({ error_code: 0, data: [] });
});

// get order list
app.get('/ticket/api/v1/tickets', (req, res) => {
  res.json({ error_code: 0, data: { tickets: [], total: 0 } });
});

// create order
app.post('/ticket/api/v1/tickets', (req, res) => {
  res.json({ error_code: 0, data: { id: 'mock-id' } });
});

// get order detail
app.get('/ticket/api/v1/ticket/:id', (req, res) => {
  res.json({ error_code: 0, data: {} });
});

// update order
app.put('/ticket/api/v1/ticket/:id', (req, res) => {
  res.json({ error_code: 0, data: {} });
});

// update state by action
app.post('/ticket/api/v1/ticket/:id', (req, res) => {
  if (req.query.cmd === 'UpdateStateByAction') {
    return res.json({ error_code: 0, data: {} });
  }
  res.json({ error_code: 0, data: {} });
});

// batch update state
app.post('/ticket/api/v1/tickets', (req, res) => {
  if (req.query.cmd === 'BatchUpdateStateByAction') {
    return res.json({ error_code: 0, data: {} });
  }
  res.json({ error_code: 0, data: {} });
});

// delete order
app.delete('/ticket/api/v1/ticket/:id', (req, res) => {
  res.json({ error_code: 0, data: {} });
});

// ========== Process Management APIs ==========
app.get('/ticket/api/v1/processes', (req, res) => {
  res.json({ error_code: 0, data: { processes: [], total: 0 } });
});

app.post('/ticket/api/v1/processes', (req, res) => {
  if (req.query.cmd === 'NameExists') {
    return res.json({ error_code: 0, data: { exists: false } });
  }
  res.json({ error_code: 0, data: {} });
});

app.get('/ticket/api/v1/process/:id', (req, res) => {
  res.json({ error_code: 0, data: {} });
});

app.put('/ticket/api/v1/process/:id', (req, res) => {
  res.json({ error_code: 0, data: {} });
});

app.delete('/ticket/api/v1/process/:id', (req, res) => {
  res.json({ error_code: 0, data: {} });
});

// ========== Asset APIs ==========

// LVS
app.all('/lvs/qa/api/v1/*', (req, res) => {
  res.json({ error_code: 0, data: {} });
});

// DNS
app.all('/dns_module/api/v1/dns*', (req, res) => {
  res.json({ error_code: 0, data: {} });
});

// VM / HyperV
app.all('/hyperv/local/api/v1/hyperv*', (req, res) => {
  res.json({ error_code: 0, data: {} });
});

// NAT
app.all('/nat/api/v1/*', (req, res) => {
  res.json({ error_code: 0, data: {} });
});

// Generic asset endpoints
app.all('/ticket/api/v1/asset/*', (req, res) => {
  res.json({ error_code: 0, data: {} });
});

// VM task endpoints
app.get('/ticket/api/v1/vms', (req, res) => {
  res.json({ error_code: 0, data: {} });
});

app.all('/ticket/api/v1/vm_collection_tasks*', (req, res) => {
  res.json({ error_code: 0, data: {} });
});

app.all('/ticket/api/v1/vm_collection_task*', (req, res) => {
  res.json({ error_code: 0, data: {} });
});

// ========== Catch-all for anything else ==========
app.all('*', (req, res) => {
  console.log(`[mock] unhandled: ${req.method} ${req.path}`);
  res.json({ error_code: 0, data: {} });
});

app.listen(PORT, () => {
  console.log(`Mock API server running at http://localhost:${PORT}`);
});
