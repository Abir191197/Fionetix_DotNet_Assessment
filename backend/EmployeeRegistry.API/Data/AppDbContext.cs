using Microsoft.EntityFrameworkCore;
using EmployeeRegistry.API.Models;

namespace EmployeeRegistry.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Spouse> Spouses => Set<Spouse>();
    public DbSet<Child> Children => Set<Child>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Employee configuration
        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.NID).IsRequired().HasMaxLength(17);
            entity.HasIndex(e => e.NID).IsUnique(); // Unique NID at DB level
            entity.Property(e => e.Phone).IsRequired().HasMaxLength(15);
            entity.Property(e => e.Department).IsRequired().HasMaxLength(100);
            entity.Property(e => e.BasicSalary).HasColumnType("decimal(18,2)");
        });

        // Spouse — One-to-One with Employee
        modelBuilder.Entity<Spouse>(entity =>
        {
            entity.HasKey(s => s.Id);
            entity.Property(s => s.Name).IsRequired().HasMaxLength(100);
            entity.Property(s => s.NID).HasMaxLength(17);
            entity.HasOne(s => s.Employee)
                  .WithOne(e => e.Spouse)
                  .HasForeignKey<Spouse>(s => s.EmployeeId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Child — One-to-Many with Employee
        modelBuilder.Entity<Child>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
            entity.HasOne(c => c.Employee)
                  .WithMany(e => e.Children)
                  .HasForeignKey(c => c.EmployeeId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Username).IsRequired().HasMaxLength(50);
            entity.HasIndex(u => u.Username).IsUnique();
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.Role).IsRequired().HasMaxLength(20);
        });
    }
}
