using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Trackify.Api.Dtos;
using Trackify.Api.Models;
using Trackify.Api.Services;

namespace Trackify.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class AdminController : ControllerBase
{
    private readonly MongoContext _context;

    public AdminController(MongoContext context)
    {
        _context = context;
    }

    [HttpGet("users")]
    public async Task<IEnumerable<UserResponse>> Users()
    {
        var users = await _context.Users.Find(Builders<User>.Filter.Empty).SortByDescending(u => u.CreatedAt).ToListAsync();
        return users.Select(u => new UserResponse(u.Id, u.Name, u.Email, u.Role));
    }

    [HttpGet("stats")]
    public async Task<AdminStatsResponse> Stats()
    {
        var users = await _context.Users.CountDocumentsAsync(_ => true);
        var categories = await _context.Categories.CountDocumentsAsync(_ => true);
        var expenses = await _context.Expenses.CountDocumentsAsync(_ => true);
        return new AdminStatsResponse(users, categories, expenses);
    }
}
