namespace Trackify.Api.Services;

public class CurrentUser
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUser(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? UserId => _httpContextAccessor.HttpContext?.User.FindFirst("sub")?.Value;
    public string? Email => _httpContextAccessor.HttpContext?.User.FindFirst("email")?.Value;
    public string Role => _httpContextAccessor.HttpContext?.User.FindFirst("role")?.Value ?? "User";
    public bool IsAdmin => string.Equals(Role, "Admin", StringComparison.OrdinalIgnoreCase);
}
