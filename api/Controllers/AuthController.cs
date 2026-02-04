using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trackify.Api.Dtos;
using Trackify.Api.Services;

namespace Trackify.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly CurrentUser _currentUser;

    public AuthController(AuthService authService, CurrentUser currentUser)
    {
        _authService = authService;
        _currentUser = currentUser;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        if (result == null)
        {
            return Conflict("Email is already registered.");
        }

        return Ok(result);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        if (result == null)
        {
            return Unauthorized("Invalid credentials.");
        }

        return Ok(result);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        if (_currentUser.UserId is null)
        {
            return Unauthorized();
        }

        var user = await _authService.GetByIdAsync(_currentUser.UserId);
        if (user == null)
        {
            return Unauthorized();
        }

        return Ok(new UserResponse(user.Id, user.Name, user.Email, user.Role));
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile(UpdateProfileRequest request)
    {
        if (_currentUser.UserId is null)
        {
            return Unauthorized();
        }

        var result = await _authService.UpdateProfileAsync(_currentUser.UserId, request);
        if (result == null)
        {
            return Conflict("Email is already taken or user not found.");
        }

        return Ok(result);
    }
}
