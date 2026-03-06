import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined, FilePdfOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Input,
  message,
  Popconfirm,
  Row,
  Space,
  Table,
  Tag, Typography,
} from 'antd';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { reportsApi } from '../api';
import { deleteEmployee, fetchEmployees, setSearchTerm } from '../store/slices/employeeSlice';

const { Title } = Typography;

export default function EmployeeListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, loading, searchTerm } = useSelector((state) => state.employees);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'Admin';

  const [localSearch, setLocalSearch] = useState(searchTerm);

  // Fetch employees when Redux searchTerm changes
  useEffect(() => {
    dispatch(fetchEmployees(searchTerm));
  }, [dispatch, searchTerm]);

  // Debounce: wait 400ms after user stops typing, then update Redux searchTerm
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setSearchTerm(localSearch));
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, dispatch]);

  const handleDelete = async (id) => {
    const result = await dispatch(deleteEmployee(id));
    if (deleteEmployee.fulfilled.match(result)) {
      message.success('Employee deleted successfully');
    } else {
      message.error('Failed to delete employee');
    }
  };

  // Export filtered list to PDF
  const handleExportPdf = async () => {
    try {
      const res = await reportsApi.getEmployeesReport(localSearch);
      const employees = res.data;
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text('Employee Registry Report', 14, 22);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
      if (localSearch) doc.text(`Filter: "${localSearch}"`, 14, 36);

      autoTable(doc, {
        startY: localSearch ? 42 : 36,
        head: [['Name', 'NID', 'Phone', 'Department', 'Basic Salary']],
        body: employees.map((e) => [
          e.name, e.nid, e.phone, e.department, `৳${e.basicSalary.toLocaleString()}`,
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [102, 126, 234] },
      });

      doc.save('employee-report.pdf');
      message.success('PDF exported successfully');
    } catch {
      message.error('Failed to export PDF');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'NID',
      dataIndex: 'nid',
      key: 'nid',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (dept) => <Tag color="blue">{dept}</Tag>,
    },
    {
      title: 'Basic Salary',
      dataIndex: 'basicSalary',
      key: 'basicSalary',
      render: (salary) => `৳${salary?.toLocaleString()}`,
      sorter: (a, b) => a.basicSalary - b.basicSalary,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/employees/${record.id}`)}
          />
          {isAdmin && (
            <>
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => navigate(`/employees/${record.id}/edit`)}
              />
              <Popconfirm
                title="Delete this employee?"
                description="This action cannot be undone."
                onConfirm={() => handleDelete(record.id)}
                okText="Delete"
                okType="danger"
              >
                <Button type="link" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>Employees</Title>
        </Col>
        <Col>
          <Space>
            <Button
              icon={<FilePdfOutlined />}
              onClick={handleExportPdf}
              style={{ borderColor: '#667eea', color: '#667eea' }}
            >
              Export PDF
            </Button>
            {isAdmin && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/employees/new')}
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
              >
                Add Employee
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Input
          placeholder="Search by Name, NID, or Department..."
          prefix={<SearchOutlined />}
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          allowClear
          size="large"
          style={{ borderRadius: 8 }}
        />
      </Card>

      <Card style={{ borderRadius: 12 }}>
        <Table
          columns={columns}
          dataSource={list}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} employees` }}
        />
      </Card>
    </div>
  );
}
