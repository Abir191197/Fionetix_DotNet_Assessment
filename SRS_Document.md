# SRS Document — Employee & Family Registry

## 1. System Scope

### What the System Does

- **Employee Management**: CRUD operations for employee profiles (Name, NID, Phone, Department, Basic Salary).
- **Family Data**: Each employee can have one **Spouse** (1-to-1) and multiple **Children** (1-to-Many).
- **Search**: A single global search bar that filters employees by Name, NID, or Department (case-insensitive, server-side).
- **PDF Export**:
  - **Table View PDF**: Exports the current filtered employee list as a PDF table.
  - **Individual CV PDF**: Exports a single employee's profile + family details as a formatted CV.
- **Role-Based Access**:
  - **Admin**: Full CRUD (Create, Read, Update, Delete).
  - **Viewer**: Read-only access (view employees, search, export).
- **Seed Data**: 10 realistic Bangladeshi employees are automatically seeded on first run.

### What the System Does NOT Do

- No user self-registration (users are pre-seeded or added directly to DB).
- No multi-tenancy or organization management.
- No file uploads (photos, documents).
- No salary calculations, payroll, or leave management.
- No email notifications or real-time updates.
- No audit trail or change history.

---

## 2. Entity Relationship Diagram (ERD)

```
┌──────────────────┐
│      User        │
├──────────────────┤
│ Id (PK)          │
│ Username (UQ)    │
│ PasswordHash     │
│ Role             │
└──────────────────┘

┌──────────────────┐       1:1       ┌──────────────────┐
│    Employee      │────────────────▶│     Spouse       │
├──────────────────┤                 ├──────────────────┤
│ Id (PK)          │                 │ Id (PK)          │
│ Name             │                 │ Name             │
│ NID (UQ)         │                 │ NID              │
│ Phone            │                 │ EmployeeId (FK)  │
│ Department       │                 └──────────────────┘
│ BasicSalary      │
└──────────────────┘
        │
        │  1:N
        ▼
┌──────────────────┐
│     Child        │
├──────────────────┤
│ Id (PK)          │
│ Name             │
│ DateOfBirth      │
│ EmployeeId (FK)  │
└──────────────────┘
```

**Relationships:**

- `Employee` ↔ `Spouse`: One-to-One (cascade delete)
- `Employee` ↔ `Child`: One-to-Many (cascade delete)
- `User`: Independent entity for authentication

---

## 3. Edge Cases

| Scenario                      | Handling                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Duplicate NID**             | Unique index at DB level (`HasIndex(e => e.NID).IsUnique()`). API returns `409 Conflict` with message. |
| **Invalid Phone**             | FluentValidation rejects phones not starting with `+880` or `01`. Regex: `^(\+880\|01)\d{8,10}$`       |
| **Invalid NID Length**        | Must be exactly 10 or 17 digits. Validated on both frontend and backend.                               |
| **Employee with no Spouse**   | Spouse is optional. `null` is accepted.                                                                |
| **Employee with no Children** | Children array can be empty.                                                                           |
| **Deleting Employee**         | Cascade delete removes associated Spouse and Children automatically.                                   |
| **NID update to existing**    | On update, uniqueness check excludes the current employee's own NID.                                   |
| **Empty search**              | Returns all employees (no filter applied).                                                             |
| **Unauthorized access**       | JWT validation returns `401`. Frontend redirects to login.                                             |
| **Viewer tries to edit**      | API returns `403 Forbidden`. Frontend hides edit/delete buttons for Viewers.                           |

---

## 4. Assumptions

1. **One Spouse per Employee**: An employee can have at most one spouse record.
2. **No age limit on Children**: Children's date of birth must be in the past, but no minimum/maximum age enforced.
3. **Departments are free-text**: No predefined list; users can enter any department name.
4. **Basic Salary is in BDT**: No currency conversion or multi-currency support.
5. **Users are pre-seeded**: No registration flow; admin and viewer accounts are created via seed data.
6. **NID format**: Only digits are accepted (10 or 17 characters). No checksum validation.
7. **Single database**: All data is stored in a single PostgreSQL database.
8. **No pagination on API**: All matching results are returned (suitable for the expected data volume).

---

## 5. Technology Stack

| Layer            | Technology                            |
| ---------------- | ------------------------------------- |
| Backend          | .NET 10, ASP.NET Core Web API         |
| ORM              | Entity Framework Core 10 (Npgsql)     |
| Database         | PostgreSQL 17                         |
| Validation       | FluentValidation                      |
| Auth             | JWT (HMAC-SHA256)                     |
| Frontend         | React 19, Vite                        |
| State Management | Redux Toolkit                         |
| UI Library       | Ant Design 5                          |
| PDF Export       | jsPDF + jsPDF-AutoTable (client-side) |
