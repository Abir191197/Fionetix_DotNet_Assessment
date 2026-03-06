namespace EmployeeRegistry.API.Models;

public class Employee
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string NID { get; set; } = string.Empty; // 10 or 17 digits
    public string Phone { get; set; } = string.Empty; // BD format: +880 or 01
    public string Department { get; set; } = string.Empty;
    public decimal BasicSalary { get; set; }

    // Navigation properties
    public Spouse? Spouse { get; set; }
    public List<Child> Children { get; set; } = new();
}
