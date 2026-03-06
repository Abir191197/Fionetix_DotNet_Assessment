import {
    ArrowLeftOutlined, EditOutlined, FilePdfOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    Button,
    Card,
    Descriptions,
    Empty, message,
    Space, Spin,
    Table,
    Tag,
    Typography
} from 'antd';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { reportsApi } from '../api';
import { clearCurrentEmployee, fetchEmployeeById } from '../store/slices/employeeSlice';

const { Title, Text } = Typography;

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentEmployee: emp, loading } = useSelector((state) => state.employees);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    dispatch(fetchEmployeeById(id));
    return () => dispatch(clearCurrentEmployee());
  }, [dispatch, id]);

  // Export individual CV as PDF
  const handleExportCv = async () => {
    try {
      const res = await reportsApi.getEmployeeCvReport(id);
      const data = res.data;
      const doc = new jsPDF();

      // Header
      doc.setFontSize(22);
      doc.setTextColor(102, 126, 234);
      doc.text('Employee CV', 14, 22);
      doc.setDrawColor(102, 126, 234);
      doc.line(14, 26, 196, 26);

      // Employee info
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(data.name, 14, 38);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const info = [
        `NID: ${data.nid}`,
        `Phone: ${data.phone}`,
        `Department: ${data.department}`,
        `Basic Salary: ৳${data.basicSalary.toLocaleString()}`,
      ];
      info.forEach((line, i) => doc.text(line, 14, 48 + i * 7));

      let yPos = 82;

      // Spouse section
      if (data.spouse) {
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Spouse Information', 14, yPos);
        yPos += 4;

        autoTable(doc, {
          startY: yPos,
          head: [['Name', 'NID']],
          body: [[data.spouse.name, data.spouse.nid || 'N/A']],
          styles: { fontSize: 10 },
          headStyles: { fillColor: [102, 126, 234] },
          margin: { left: 14 },
        });
        yPos = doc.lastAutoTable.finalY + 14;
      }

      // Children section
      if (data.children && data.children.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Children Information', 14, yPos);
        yPos += 4;

        autoTable(doc, {
          startY: yPos,
          head: [['Name', 'Date of Birth']],
          body: data.children.map((c) => [
            c.name,
            new Date(c.dateOfBirth).toLocaleDateString('en-GB'),
          ]),
          styles: { fontSize: 10 },
          headStyles: { fillColor: [102, 126, 234] },
          margin: { left: 14 },
        });
      }

      // Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, pageHeight - 10);

      doc.save(`${data.name.replace(/\s+/g, '_')}_CV.pdf`);
      message.success('CV exported successfully');
    } catch {
      message.error('Failed to export CV');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!emp) {
    return <Empty description="Employee not found" />;
  }

  const childColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Date of Birth',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      render: (dob) => new Date(dob).toLocaleDateString('en-GB'),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>Back</Button>
        {isAdmin && (
          <Button icon={<EditOutlined />} onClick={() => navigate(`/employees/${id}/edit`)}>Edit</Button>
        )}
        <Button
          icon={<FilePdfOutlined />}
          onClick={handleExportCv}
          style={{ borderColor: '#667eea', color: '#667eea' }}
        >
          Export CV PDF
        </Button>
      </Space>

      <Card
        style={{ borderRadius: 12, marginBottom: 24 }}
        title={
          <Space>
            <UserOutlined style={{ color: '#667eea', fontSize: 20 }} />
            <Title level={4} style={{ margin: 0 }}>{emp.name}</Title>
          </Space>
        }
      >
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="NID">{emp.nid}</Descriptions.Item>
          <Descriptions.Item label="Phone">{emp.phone}</Descriptions.Item>
          <Descriptions.Item label="Department">
            <Tag color="blue">{emp.department}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Basic Salary">
            ৳{emp.basicSalary?.toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {emp.spouse && (
        <Card
          style={{ borderRadius: 12, marginBottom: 24 }}
          title={<Space><TeamOutlined style={{ color: '#764ba2' }} /><Text strong>Spouse</Text></Space>}
        >
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Name">{emp.spouse.name}</Descriptions.Item>
            <Descriptions.Item label="NID">{emp.spouse.nid || 'N/A'}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {emp.children && emp.children.length > 0 && (
        <Card
          style={{ borderRadius: 12 }}
          title={<Space><TeamOutlined style={{ color: '#764ba2' }} /><Text strong>Children ({emp.children.length})</Text></Space>}
        >
          <Table
            columns={childColumns}
            dataSource={emp.children}
            rowKey={(_, idx) => idx}
            pagination={false}
            size="small"
          />
        </Card>
      )}
    </div>
  );
}
