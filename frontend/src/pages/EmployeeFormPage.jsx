import {
    ArrowLeftOutlined,
    MinusCircleOutlined,
    PlusOutlined,
    SaveOutlined,
} from '@ant-design/icons';
import {
    Button, Card,
    Divider,
    Form, Input, InputNumber,
    message,
    Space,
    Spin,
    Typography,
} from 'antd';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
    clearCurrentEmployee,
    createEmployee,
    fetchEmployeeById,
    updateEmployee,
} from '../store/slices/employeeSlice';

const { Title } = Typography;

export default function EmployeeFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { currentEmployee, loading } = useSelector((state) => state.employees);

  useEffect(() => {
    if (isEdit) {
      dispatch(fetchEmployeeById(id));
    }
    return () => dispatch(clearCurrentEmployee());
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (isEdit && currentEmployee) {
      form.setFieldsValue({
        name: currentEmployee.name,
        nid: currentEmployee.nid,
        phone: currentEmployee.phone,
        department: currentEmployee.department,
        basicSalary: currentEmployee.basicSalary,
        spouse: currentEmployee.spouse || undefined,
        children: currentEmployee.children?.map((c) => ({
          name: c.name,
          dateOfBirth: c.dateOfBirth ? c.dateOfBirth.split('T')[0] : '',
        })) || [],
      });
    }
  }, [currentEmployee, form, isEdit]);

  const onFinish = async (values) => {
    // Format children dates
    const payload = {
      ...values,
      spouse: values.spouse?.name ? values.spouse : null,
      children: (values.children || []).map((c) => ({
        name: c.name,
        dateOfBirth: new Date(c.dateOfBirth).toISOString(),
      })),
    };

    let result;
    if (isEdit) {
      result = await dispatch(updateEmployee({ id: Number(id), data: payload }));
      if (updateEmployee.fulfilled.match(result)) {
        message.success('Employee updated successfully');
        navigate(`/employees/${id}`);
      } else {
        message.error(typeof result.payload === 'string' ? result.payload : 'Failed to update. Check your input.');
      }
    } else {
      result = await dispatch(createEmployee(payload));
      if (createEmployee.fulfilled.match(result)) {
        message.success('Employee created successfully');
        navigate('/');
      } else {
        message.error(typeof result.payload === 'string' ? result.payload : 'Failed to create. Check your input.');
      }
    }
  };

  if (isEdit && loading && !currentEmployee) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Back</Button>
      </Space>

      <Card style={{ borderRadius: 12 }}>
        <Title level={4}>{isEdit ? 'Edit Employee' : 'Add New Employee'}</Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          size="large"
          initialValues={{ children: [] }}
        >
          {/* Employee Info */}
          <Divider orientation="left">Employee Information</Divider>

          <Form.Item
            name="name"
            label="Full Name"
            rules={[
              { required: true, message: 'Name is required' },
              { max: 100, message: 'Name cannot exceed 100 characters' },
            ]}
          >
            <Input placeholder="e.g. Md. Hasan Ahmed" />
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="nid"
              label="NID"
              style={{ flex: 1 }}
              rules={[
                { required: true, message: 'NID is required' },
                { pattern: /^(\d{10}|\d{17})$/, message: 'NID must be 10 or 17 digits' },
              ]}
            >
              <Input placeholder="10 or 17 digits" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone"
              style={{ flex: 1 }}
              rules={[
                { required: true, message: 'Phone is required' },
                { pattern: /^(\+880|01)\d{8,10}$/, message: 'Must start with +880 or 01' },
              ]}
            >
              <Input placeholder="+8801XXXXXXXXX or 01XXXXXXXXX" />
            </Form.Item>
          </Space>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="department"
              label="Department"
              style={{ flex: 1 }}
              rules={[{ required: true, message: 'Department is required' }]}
            >
              <Input placeholder="e.g. Engineering" />
            </Form.Item>

            <Form.Item
              name="basicSalary"
              label="Basic Salary (BDT)"
              style={{ flex: 1 }}
              rules={[{ required: true, message: 'Salary is required' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={1}
                formatter={(value) => `৳ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/৳\s?|(,*)/g, '')}
                placeholder="e.g. 75000"
              />
            </Form.Item>
          </Space>

          {/* Spouse Info */}
          <Divider orientation="left">Spouse Information (Optional)</Divider>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item name={['spouse', 'name']} label="Spouse Name" style={{ flex: 1 }}>
              <Input placeholder="Spouse full name" />
            </Form.Item>
            <Form.Item name={['spouse', 'nid']} label="Spouse NID" style={{ flex: 1 }}>
              <Input placeholder="Spouse NID" />
            </Form.Item>
          </Space>

          {/* Children */}
          <Divider orientation="left">Children (Optional)</Divider>

          <Form.List name="children">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      rules={[{ required: true, message: 'Child name required' }]}
                    >
                      <Input placeholder="Child name" style={{ width: 250 }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'dateOfBirth']}
                      rules={[{ required: true, message: 'Date of birth required' }]}
                    >
                      <Input type="date" style={{ width: 180 }} />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ff4d4f' }} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Child
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          {/* Submit */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              size="large"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: 8,
                height: 48,
              }}
            >
              {isEdit ? 'Update Employee' : 'Create Employee'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
