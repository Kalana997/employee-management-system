using System.ComponentModel.DataAnnotations;

namespace EmployeeManagementAPI.Models
{
    public class Employee
    {
        public int Id { get; set; }

        [Required]
        [StringLength(50, MinimumLength = 3)]
        [RegularExpression("^[A-Za-z ]+$")]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [RegularExpression("^[0-9]{10}$")]
        public string Phone { get; set; }

        [Required]
        [RegularExpression("^[A-Za-z ]+$")]
        public string Department { get; set; }

        [Required]
        [Range(1000, 1000000)]
        public decimal Salary { get; set; }

        public string? Photo { get; set; }
    }
}