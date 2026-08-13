using Microsoft.AspNetCore.Mvc;
using EmployeeManagementAPI.Data;
using EmployeeManagementAPI.Models;

namespace EmployeeManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EmployeeController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Employee
        [HttpGet]
        public IActionResult GetAllEmployees()
        {
            var employees = _context.Employees.ToList();
            return Ok(employees);
        }

        // GET: api/Employee/1
        [HttpGet("{id}")]
        public IActionResult GetEmployee(int id)
        {
            var employee = _context.Employees.Find(id);

            if (employee == null)
                return NotFound();

            return Ok(employee);
        }

        // POST: api/Employee
        [HttpPost]
        public IActionResult AddEmployee(Employee employee)
        {
            var emailExists = _context.Employees
                .Any(e => e.Email == employee.Email);

            if (emailExists)
                return Conflict(new { message = "Email already exists." });

            var phoneExists = _context.Employees
                .Any(e => e.Phone == employee.Phone);

            if (phoneExists)
                return Conflict(new { message = "Phone number already exists." });

            _context.Employees.Add(employee);
            _context.SaveChanges();

            return Ok(employee);
        }

        // PUT: api/Employee/1
        [HttpPut("{id}")]
        public IActionResult UpdateEmployee(int id, Employee employee)
        {
            if (id != employee.Id)
                return BadRequest();

            var existingEmployee = _context.Employees.Find(id);

            if (existingEmployee == null)
                return NotFound();

            var emailExists = _context.Employees
                .Any(e => e.Email == employee.Email && e.Id != id);

            if (emailExists)
                return Conflict(new { message = "Email already exists." });

            var phoneExists = _context.Employees
                .Any(e => e.Phone == employee.Phone && e.Id != id);

            if (phoneExists)
                return Conflict(new { message = "Phone number already exists." });

            existingEmployee.Name = employee.Name;
            existingEmployee.Email = employee.Email;
            existingEmployee.Phone = employee.Phone;
            existingEmployee.Department = employee.Department;
            existingEmployee.Salary = employee.Salary;
            existingEmployee.Photo = employee.Photo;

            _context.SaveChanges();

            return Ok(existingEmployee);
        }

        // DELETE: api/Employee/1
        [HttpDelete("{id}")]
        public IActionResult DeleteEmployee(int id)
        {
            var employee = _context.Employees.Find(id);

            if (employee == null)
                return NotFound();

            _context.Employees.Remove(employee);
            _context.SaveChanges();

            return Ok(new
            {
                message = "Employee deleted successfully."
            });
        }

        [HttpGet("check-email")]
        public IActionResult CheckEmail(string email, int? id = null)
        {
            var exists = _context.Employees
                .Any(e => e.Email == email && (!id.HasValue || e.Id != id.Value));

            return Ok(new { exists });
        }

        [HttpGet("check-phone")]
        public IActionResult CheckPhone(string phone, int? id = null)
        {
            var exists = _context.Employees
                .Any(e => e.Phone == phone && (!id.HasValue || e.Id != id.Value));

            return Ok(new { exists });
        }
    }
}