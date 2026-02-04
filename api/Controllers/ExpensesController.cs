using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trackify.Api.Dtos;
using Trackify.Api.Services;

namespace Trackify.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ExpensesController : ControllerBase
{
    private readonly ExpenseService _expenses;
    private readonly CurrentUser _currentUser;

    public ExpensesController(ExpenseService expenses, CurrentUser currentUser)
    {
        _expenses = expenses;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] ExpenseQuery query)
    {
        if (_currentUser.UserId is null)
        {
            return Unauthorized();
        }

        var result = await _expenses.QueryAsync(_currentUser.UserId, _currentUser.IsAdmin, query);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(ExpenseCreateDto dto)
    {
        if (_currentUser.UserId is null)
        {
            return Unauthorized();
        }

        var created = await _expenses.CreateAsync(_currentUser.UserId, _currentUser.IsAdmin, dto);
        if (created == null)
        {
            return BadRequest("Invalid category or payload.");
        }

        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, ExpenseUpdateDto dto)
    {
        if (_currentUser.UserId is null)
        {
            return Unauthorized();
        }

        var updated = await _expenses.UpdateAsync(id, _currentUser.UserId, _currentUser.IsAdmin, dto);
        if (!updated)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        if (_currentUser.UserId is null)
        {
            return Unauthorized();
        }

        var deleted = await _expenses.DeleteAsync(id, _currentUser.UserId, _currentUser.IsAdmin);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
