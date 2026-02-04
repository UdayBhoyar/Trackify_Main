using System.ComponentModel.DataAnnotations;

namespace Trackify.Api.Dtos;

public record RegisterRequest(
    [Required, StringLength(100, MinimumLength = 2)] string Name,
    [Required, EmailAddress] string Email,
    [Required, StringLength(100, MinimumLength = 6)] string Password
);

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password
);

public record AuthResponse(string Token, UserResponse User);

public record UserResponse(string Id, string Name, string Email, string Role);

public record UpdateProfileRequest(
    [Required, StringLength(100, MinimumLength = 2)] string Name,
    [Required, EmailAddress] string Email,
    [StringLength(100, MinimumLength = 6)] string? Password
);
