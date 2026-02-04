using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trackify.Api.Dtos;
using Trackify.Api.Services;

namespace Trackify.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly CategoryService _categories;
    private readonly CurrentUser _currentUser;

    public CategoriesController(CategoryService categories, CurrentUser currentUser)
    {
        _categories = categories;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string? userId)
    {
        if (_currentUser.UserId is null)
        {
            return Unauthorized();
        }

        var targetUserId = _currentUser.IsAdmin && !string.IsNullOrWhiteSpace(userId) ? userId : _currentUser.UserId;
        var categories = await _categories.GetAsync(targetUserId!, _currentUser.IsAdmin);
        return Ok(categories);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CategoryCreateDto dto)
    {
        if (_currentUser.UserId is null)
        {
            return Unauthorized();
        }

        var created = await _categories.CreateAsync(_currentUser.UserId, dto);
        return CreatedAtAction(nameof(Get), new { id = created?.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, CategoryUpdateDto dto)
    {
        if (_currentUser.UserId is null)
        {
            return Unauthorized();
        }

        var updated = await _categories.UpdateAsync(id, _currentUser.UserId, _currentUser.IsAdmin, dto);
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

        var deleted = await _categories.DeleteAsync(id, _currentUser.UserId, _currentUser.IsAdmin);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
