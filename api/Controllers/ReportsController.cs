using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trackify.Api.Services;

namespace Trackify.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly ReportService _reports;
    private readonly CurrentUser _currentUser;

    public ReportsController(ReportService reports, CurrentUser currentUser)
    {
        _reports = reports;
        _currentUser = currentUser;
    }

    [HttpGet("monthly")]
    public async Task<IActionResult> Monthly([FromQuery] int year)
    {
        if (_currentUser.UserId is null)
        {
            return Unauthorized();
        }

        if (year <= 0)
        {
            year = DateTime.UtcNow.Year;
        }

        var data = await _reports.GetMonthlyTotalsAsync(_currentUser.UserId, _currentUser.IsAdmin, year);
        return Ok(data);
    }

    [HttpGet("by-category")]
    public async Task<IActionResult> ByCategory([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        if (_currentUser.UserId is null)
        {
            return Unauthorized();
        }

        var data = await _reports.GetCategoryTotalsAsync(_currentUser.UserId, _currentUser.IsAdmin, from, to);
        return Ok(data);
    }

    [HttpGet("daily-trend")]
    public async Task<IActionResult> DailyTrend([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        if (_currentUser.UserId is null)
        {
            return Unauthorized();
        }

        var data = await _reports.GetDailyTrendAsync(_currentUser.UserId, _currentUser.IsAdmin, from, to);
        return Ok(data);
    }

    [HttpGet("top-expenses")]
    public async Task<IActionResult> TopExpenses([FromQuery] int limit = 5)
    {
        if (_currentUser.UserId is null)
        {
            return Unauthorized();
        }

        var data = await _reports.GetTopExpensesAsync(_currentUser.UserId, _currentUser.IsAdmin, limit);
        return Ok(data);
    }
}
