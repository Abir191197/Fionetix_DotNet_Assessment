using EmployeeRegistry.API.Data;
using EmployeeRegistry.API.DTOs;
using EmployeeRegistry.API.Extensions;
using EmployeeRegistry.API.Models;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeRegistry.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmployeesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IValidator<CreateEmployeeRequest> _createValidator;
    private readonly IValidator<UpdateEmployeeRequest> _updateValidator;

    public EmployeesController(
        AppDbContext context,
        IValidator<CreateEmployeeRequest> createValidator,
        IValidator<UpdateEmployeeRequest> updateValidator)
    {
        _context = context;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    // GET: api/employees?search=hasan
    [HttpGet]
    public async Task<ActionResult<List<EmployeeListResponse>>> GetAll([FromQuery] string? search)
    {
        var query = _context.Employees.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(e =>
                EF.Functions.ILike(e.Name, $"%{search}%") ||
                EF.Functions.ILike(e.NID, $"%{search}%") ||
                EF.Functions.ILike(e.Department, $"%{search}%"));
        }

        var employees = await query
            .OrderBy(e => e.Name)
            .ToListAsync();

        return Ok(employees.Select(e => e.ToListResponse()));
    }

    // GET: api/employees/5
    [HttpGet("{id}")]
    public async Task<ActionResult<EmployeeDetailResponse>> GetById(int id)
    {
        var employee = await _context.Employees
            .Include(e => e.Spouse)
            .Include(e => e.Children)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee == null)
            return NotFound(new { message = $"Employee with ID {id} not found." });

        return Ok(employee.ToDetailResponse());
    }

    // POST: api/employees
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<EmployeeDetailResponse>> Create([FromBody] CreateEmployeeRequest request)
    {
        var validation = await _createValidator.ValidateAsync(request);
        if (!validation.IsValid)
            return BadRequest(new { errors = validation.Errors.Select(e => e.ErrorMessage) });

        // Check NID uniqueness
        if (await _context.Employees.AnyAsync(e => e.NID == request.NID))
            return Conflict(new { message = $"An employee with NID '{request.NID}' already exists." });

        var employee = request.ToEntity();
        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        // Reload with navigation properties
        await _context.Entry(employee).Reference(e => e.Spouse).LoadAsync();
        await _context.Entry(employee).Collection(e => e.Children).LoadAsync();

        return CreatedAtAction(nameof(GetById), new { id = employee.Id }, employee.ToDetailResponse());
    }

    // PUT: api/employees/5
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<EmployeeDetailResponse>> Update(int id, [FromBody] UpdateEmployeeRequest request)
    {
        var validation = await _updateValidator.ValidateAsync(request);
        if (!validation.IsValid)
            return BadRequest(new { errors = validation.Errors.Select(e => e.ErrorMessage) });

        var employee = await _context.Employees
            .Include(e => e.Spouse)
            .Include(e => e.Children)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee == null)
            return NotFound(new { message = $"Employee with ID {id} not found." });

        // Check NID uniqueness (excluding current employee)
        if (await _context.Employees.AnyAsync(e => e.NID == request.NID && e.Id != id))
            return Conflict(new { message = $"An employee with NID '{request.NID}' already exists." });

        // Update fields
        employee.Name = request.Name;
        employee.NID = request.NID;
        employee.Phone = request.Phone;
        employee.Department = request.Department;
        employee.BasicSalary = request.BasicSalary;

        // Update spouse
        if (request.Spouse != null)
        {
            if (employee.Spouse == null)
            {
                employee.Spouse = new Spouse
                {
                    Name = request.Spouse.Name,
                    NID = request.Spouse.NID,
                    EmployeeId = employee.Id
                };
            }
            else
            {
                employee.Spouse.Name = request.Spouse.Name;
                employee.Spouse.NID = request.Spouse.NID;
            }
        }
        else if (employee.Spouse != null)
        {
            _context.Spouses.Remove(employee.Spouse);
            employee.Spouse = null;
        }

        // Update children — replace all
        _context.Children.RemoveRange(employee.Children);
        employee.Children = request.Children.Select(c => new Child
        {
            Name = c.Name,
            DateOfBirth = c.DateOfBirth,
            EmployeeId = employee.Id
        }).ToList();

        await _context.SaveChangesAsync();

        return Ok(employee.ToDetailResponse());
    }

    // DELETE: api/employees/5
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null)
            return NotFound(new { message = $"Employee with ID {id} not found." });

        _context.Employees.Remove(employee);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
