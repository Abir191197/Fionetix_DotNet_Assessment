using EmployeeRegistry.API.DTOs;
using EmployeeRegistry.API.Models;

namespace EmployeeRegistry.API.Extensions;

public static class MappingExtensions
{
    // Employee → EmployeeListResponse
    public static EmployeeListResponse ToListResponse(this Employee e)
    {
        return new EmployeeListResponse
        {
            Id = e.Id,
            Name = e.Name,
            NID = e.NID,
            Phone = e.Phone,
            Department = e.Department,
            BasicSalary = e.BasicSalary
        };
    }

    // Employee → EmployeeDetailResponse (includes family)
    public static EmployeeDetailResponse ToDetailResponse(this Employee e)
    {
        return new EmployeeDetailResponse
        {
            Id = e.Id,
            Name = e.Name,
            NID = e.NID,
            Phone = e.Phone,
            Department = e.Department,
            BasicSalary = e.BasicSalary,
            Spouse = e.Spouse != null ? new SpouseDto
            {
                Name = e.Spouse.Name,
                NID = e.Spouse.NID
            } : null,
            Children = e.Children.Select(c => new ChildDto
            {
                Name = c.Name,
                DateOfBirth = c.DateOfBirth
            }).ToList()
        };
    }

    // CreateEmployeeRequest → Employee
    public static Employee ToEntity(this CreateEmployeeRequest dto)
    {
        var employee = new Employee
        {
            Name = dto.Name,
            NID = dto.NID,
            Phone = dto.Phone,
            Department = dto.Department,
            BasicSalary = dto.BasicSalary,
            Children = dto.Children.Select(c => new Child
            {
                Name = c.Name,
                DateOfBirth = c.DateOfBirth
            }).ToList()
        };

        if (dto.Spouse != null)
        {
            employee.Spouse = new Spouse
            {
                Name = dto.Spouse.Name,
                NID = dto.Spouse.NID
            };
        }

        return employee;
    }
}
