import { LogoutOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Layout, Space, Tag, Typography } from 'antd';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import store from './store';
import { logout } from './store/slices/authSlice';

import EmployeeDetailPage from './pages/EmployeeDetailPage';
import EmployeeFormPage from './pages/EmployeeFormPage';
import EmployeeListPage from './pages/EmployeeListPage';
import LoginPage from './pages/LoginPage';

const { Header, Content } = Layout;
const { Text } = Typography;

// Protected route wrapper
function ProtectedRoute() {
  const { token } = useSelector((state) => state.auth);
  if (!token) return <Navigate to="/login" replace />;
  return <AppLayout />;
}

// Admin-only route
function AdminRoute() {
  const { user } = useSelector((state) => state.auth);
  if (user?.role !== 'Admin') return <Navigate to="/" replace />;
  return <Outlet />;
}

// App layout with header
function AppLayout() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const menuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => dispatch(logout()),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        <Space>
          <TeamOutlined style={{ color: '#fff', fontSize: 24 }} />
          <Text strong style={{ color: '#fff', fontSize: 18 }}>Employee Registry</Text>
        </Space>

        <Space>
          <Tag color={user?.role === 'Admin' ? 'gold' : 'blue'}>{user?.role}</Tag>
          <Dropdown menu={{ items: menuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer', color: '#fff' }}>
              <Avatar icon={<UserOutlined />} style={{ background: 'rgba(255,255,255,0.3)' }} />
              <Text style={{ color: '#fff' }}>{user?.username}</Text>
            </Space>
          </Dropdown>
        </Space>
      </Header>

      <Content style={{ minHeight: 'calc(100vh - 64px)' }}>
        <Outlet />
      </Content>
    </Layout>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route index element={<EmployeeListPage />} />
            <Route path="/employees/:id" element={<EmployeeDetailPage />} />

            <Route element={<AdminRoute />}>
              <Route path="/employees/new" element={<EmployeeFormPage />} />
              <Route path="/employees/:id/edit" element={<EmployeeFormPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
