using EmployeeRegistry.API.Data;
using EmployeeRegistry.API.DTOs;
using EmployeeRegistry.API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeRegistry.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReportsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/reports/employees?search=hasan
    // Returns data for PDF table export (filtered list)
    [HttpGet("employees")]
    public async Task<ActionResult<List<EmployeeListResponse>>> GetEmployeesReport([FromQuery] string? search)
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

    // GET: api/reports/employees/5
    // Returns data for individual CV PDF export
    [HttpGet("employees/{id}")]
    public async Task<ActionResult<EmployeeDetailResponse>> GetEmployeeCvReport(int id)
    {
        var employee = await _context.Employees
            .Include(e => e.Spouse)
            .Include(e => e.Children)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee == null)
            return NotFound(new { message = $"Employee with ID {id} not found." });

        return Ok(employee.ToDetailResponse());
    }
}
