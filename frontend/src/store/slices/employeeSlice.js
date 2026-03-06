import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { employeesApi } from '../../api';

const initialState = {
  list: [],
  currentEmployee: null,
  loading: false,
  error: null,
  searchTerm: '',
};

export const fetchEmployees = createAsyncThunk('employees/fetchAll', async (search = '', { rejectWithValue }) => {
  try {
    const response = await employeesApi.getAll(search);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch employees');
  }
});

export const fetchEmployeeById = createAsyncThunk('employees/fetchById', async (id, { rejectWithValue }) => {
  try {
    const response = await employeesApi.getById(id);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch employee');
  }
});

export const createEmployee = createAsyncThunk('employees/create', async (data, { rejectWithValue }) => {
  try {
    const response = await employeesApi.create(data);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.errors || err.response?.data?.message || 'Failed to create employee');
  }
});

export const updateEmployee = createAsyncThunk('employees/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await employeesApi.update(id, data);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.errors || err.response?.data?.message || 'Failed to update employee');
  }
});

export const deleteEmployee = createAsyncThunk('employees/delete', async (id, { rejectWithValue }) => {
  try {
    await employeesApi.delete(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete employee');
  }
});

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    clearCurrentEmployee: (state) => {
      state.currentEmployee = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchEmployees.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchEmployees.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchEmployees.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Fetch by ID
      .addCase(fetchEmployeeById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => { state.loading = false; state.currentEmployee = action.payload; })
      .addCase(fetchEmployeeById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Create
      .addCase(createEmployee.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createEmployee.fulfilled, (state, action) => { state.loading = false; state.list.push(action.payload); })
      .addCase(createEmployee.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Update
      .addCase(updateEmployee.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.list.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
        state.currentEmployee = action.payload;
      })
      .addCase(updateEmployee.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Delete
      .addCase(deleteEmployee.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((e) => e.id !== action.payload);
      })
      .addCase(deleteEmployee.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { setSearchTerm, clearCurrentEmployee, clearError } = employeeSlice.actions;
export default employeeSlice.reducer;
