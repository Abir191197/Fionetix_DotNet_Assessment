using FluentValidation;
using EmployeeRegistry.API.DTOs;

namespace EmployeeRegistry.API.Validators;

public class CreateEmployeeValidator : AbstractValidator<CreateEmployeeRequest>
{
    public CreateEmployeeValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(100).WithMessage("Name cannot exceed 100 characters.");

        RuleFor(x => x.NID)
            .NotEmpty().WithMessage("NID is required.")
            .Must(nid => nid.Length == 10 || nid.Length == 17)
            .WithMessage("NID must be exactly 10 or 17 digits.")
            .Matches(@"^\d+$").WithMessage("NID must contain only digits.");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone is required.")
            .Must(phone => phone.StartsWith("+880") || phone.StartsWith("01"))
            .WithMessage("Phone must start with +880 or 01 (Bangladesh format).")
            .Matches(@"^(\+880|01)\d{8,10}$").WithMessage("Invalid Bangladesh phone number format.");

        RuleFor(x => x.Department)
            .NotEmpty().WithMessage("Department is required.")
            .MaximumLength(100).WithMessage("Department cannot exceed 100 characters.");

        RuleFor(x => x.BasicSalary)
            .GreaterThan(0).WithMessage("Basic salary must be greater than 0.");

        When(x => x.Spouse != null, () =>
        {
            RuleFor(x => x.Spouse!.Name)
                .NotEmpty().WithMessage("Spouse name is required.");
            RuleFor(x => x.Spouse!.NID)
                .MaximumLength(17).WithMessage("Spouse NID cannot exceed 17 characters.")
                .Matches(@"^\d*$").When(x => !string.IsNullOrEmpty(x.Spouse?.NID))
                .WithMessage("Spouse NID must contain only digits.");
        });

        RuleForEach(x => x.Children).ChildRules(child =>
        {
            child.RuleFor(c => c.Name)
                .NotEmpty().WithMessage("Child name is required.");
            child.RuleFor(c => c.DateOfBirth)
                .LessThan(DateTime.UtcNow).WithMessage("Child date of birth must be in the past.");
        });
    }
}

public class UpdateEmployeeValidator : AbstractValidator<UpdateEmployeeRequest>
{
    public UpdateEmployeeValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(100).WithMessage("Name cannot exceed 100 characters.");

        RuleFor(x => x.NID)
            .NotEmpty().WithMessage("NID is required.")
            .Must(nid => nid.Length == 10 || nid.Length == 17)
            .WithMessage("NID must be exactly 10 or 17 digits.")
            .Matches(@"^\d+$").WithMessage("NID must contain only digits.");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone is required.")
            .Must(phone => phone.StartsWith("+880") || phone.StartsWith("01"))
            .WithMessage("Phone must start with +880 or 01 (Bangladesh format).")
            .Matches(@"^(\+880|01)\d{8,10}$").WithMessage("Invalid Bangladesh phone number format.");

        RuleFor(x => x.Department)
            .NotEmpty().WithMessage("Department is required.")
            .MaximumLength(100).WithMessage("Department cannot exceed 100 characters.");

        RuleFor(x => x.BasicSalary)
            .GreaterThan(0).WithMessage("Basic salary must be greater than 0.");

        When(x => x.Spouse != null, () =>
        {
            RuleFor(x => x.Spouse!.Name)
                .NotEmpty().WithMessage("Spouse name is required.");
            RuleFor(x => x.Spouse!.NID)
                .MaximumLength(17).WithMessage("Spouse NID cannot exceed 17 characters.")
                .Matches(@"^\d*$").When(x => !string.IsNullOrEmpty(x.Spouse?.NID))
                .WithMessage("Spouse NID must contain only digits.");
        });

        RuleForEach(x => x.Children).ChildRules(child =>
        {
            child.RuleFor(c => c.Name)
                .NotEmpty().WithMessage("Child name is required.");
            child.RuleFor(c => c.DateOfBirth)
                .LessThan(DateTime.UtcNow).WithMessage("Child date of birth must be in the past.");
        });
    }
}
