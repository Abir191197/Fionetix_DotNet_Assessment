using System.Security.Cryptography;
using System.Text;
using EmployeeRegistry.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EmployeeRegistry.API.Data;

public static class SeedData
{
    public static void Initialize(AppDbContext context)
    {
        // Ensure database is created and migrations applied
        context.Database.Migrate();

        // Don't seed if data already exists
        if (context.Employees.Any()) return;

        // Seed users
        var users = new List<User>
        {
            new User { Username = "admin", PasswordHash = HashPassword("admin123"), Role = "Admin" },
            new User { Username = "viewer", PasswordHash = HashPassword("viewer123"), Role = "Viewer" }
        };
        context.Users.AddRange(users);

        // Seed 10 employees with realistic Bangladeshi names
        var employees = new List<Employee>
        {
            new Employee
            {
                Name = "Md. Hasan Ahmed",
                NID = "1234567890",
                Phone = "+8801712345678",
                Department = "Engineering",
                BasicSalary = 75000,
                Spouse = new Spouse { Name = "Fatema Akter", NID = "1234567891" },
                Children = new List<Child>
                {
                    new Child { Name = "Arif Ahmed", DateOfBirth = new DateTime(2015, 3, 10, 0, 0, 0, DateTimeKind.Utc) },
                    new Child { Name = "Ayesha Ahmed", DateOfBirth = new DateTime(2018, 7, 22, 0, 0, 0, DateTimeKind.Utc) }
                }
            },
            new Employee
            {
                Name = "Moushumi Rahman",
                NID = "2345678901",
                Phone = "01812345678",
                Department = "Human Resources",
                BasicSalary = 65000,
                Spouse = new Spouse { Name = "Kamal Rahman", NID = "2345678902" },
                Children = new List<Child>
                {
                    new Child { Name = "Tanvir Rahman", DateOfBirth = new DateTime(2016, 1, 15, 0, 0, 0, DateTimeKind.Utc) }
                }
            },
            new Employee
            {
                Name = "Tanvir Hossain",
                NID = "3456789012",
                Phone = "+8801912345678",
                Department = "Finance",
                BasicSalary = 80000,
                Spouse = new Spouse { Name = "Nusrat Jahan", NID = "3456789013" },
                Children = new List<Child>
                {
                    new Child { Name = "Rafid Hossain", DateOfBirth = new DateTime(2014, 5, 8, 0, 0, 0, DateTimeKind.Utc) },
                    new Child { Name = "Raisa Hossain", DateOfBirth = new DateTime(2017, 11, 30, 0, 0, 0, DateTimeKind.Utc) }
                }
            },
            new Employee
            {
                Name = "Shamima Begum",
                NID = "45678901234567890",
                Phone = "+8801612345678",
                Department = "Marketing",
                BasicSalary = 60000,
                Children = new List<Child>
                {
                    new Child { Name = "Raihan Islam", DateOfBirth = new DateTime(2019, 2, 14, 0, 0, 0, DateTimeKind.Utc) }
                }
            },
            new Employee
            {
                Name = "Rafiqul Islam",
                NID = "56789012345678901",
                Phone = "01512345678",
                Department = "Engineering",
                BasicSalary = 90000,
                Spouse = new Spouse { Name = "Rehana Islam", NID = "5678901235" },
                Children = new List<Child>
                {
                    new Child { Name = "Sabbir Islam", DateOfBirth = new DateTime(2012, 8, 20, 0, 0, 0, DateTimeKind.Utc) },
                    new Child { Name = "Sabrina Islam", DateOfBirth = new DateTime(2015, 12, 5, 0, 0, 0, DateTimeKind.Utc) },
                    new Child { Name = "Saif Islam", DateOfBirth = new DateTime(2020, 4, 18, 0, 0, 0, DateTimeKind.Utc) }
                }
            },
            new Employee
            {
                Name = "Nasreen Akter",
                NID = "6789012345",
                Phone = "+8801312345678",
                Department = "Administration",
                BasicSalary = 55000,
                Spouse = new Spouse { Name = "Abdul Karim", NID = "6789012346" }
            },
            new Employee
            {
                Name = "Kamrul Hasan",
                NID = "7890123456",
                Phone = "01412345678",
                Department = "IT Support",
                BasicSalary = 50000,
                Spouse = new Spouse { Name = "Jesmin Akter", NID = "7890123457" },
                Children = new List<Child>
                {
                    new Child { Name = "Fahim Hasan", DateOfBirth = new DateTime(2017, 6, 25, 0, 0, 0, DateTimeKind.Utc) }
                }
            },
            new Employee
            {
                Name = "Sumaiya Khatun",
                NID = "89012345678901234",
                Phone = "+8801812345679",
                Department = "Finance",
                BasicSalary = 70000,
                Children = new List<Child>
                {
                    new Child { Name = "Nadia Khatun", DateOfBirth = new DateTime(2016, 9, 12, 0, 0, 0, DateTimeKind.Utc) }
                }
            },
            new Employee
            {
                Name = "Mizanur Rahman",
                NID = "9012345678",
                Phone = "01712345679",
                Department = "Engineering",
                BasicSalary = 85000,
                Spouse = new Spouse { Name = "Taslima Rahman", NID = "9012345679" },
                Children = new List<Child>
                {
                    new Child { Name = "Zarif Rahman", DateOfBirth = new DateTime(2013, 4, 2, 0, 0, 0, DateTimeKind.Utc) },
                    new Child { Name = "Zarin Rahman", DateOfBirth = new DateTime(2016, 10, 18, 0, 0, 0, DateTimeKind.Utc) }
                }
            },
            new Employee
            {
                Name = "Farhana Yesmin",
                NID = "0123456789",
                Phone = "+8801912345679",
                Department = "Marketing",
                BasicSalary = 62000,
                Spouse = new Spouse { Name = "Shafiqul Islam", NID = "0123456780" },
                Children = new List<Child>
                {
                    new Child { Name = "Alif Islam", DateOfBirth = new DateTime(2018, 1, 7, 0, 0, 0, DateTimeKind.Utc) }
                }
            }
        };

        context.Employees.AddRange(employees);
        context.SaveChanges();
    }

    public static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }

    public static bool VerifyPassword(string password, string hash)
    {
        return HashPassword(password) == hash;
    }
}
