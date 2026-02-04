namespace Trackify.Api.Dtos;

public record CategoryCreateDto(string Name, string Icon);
public record CategoryUpdateDto(string Name, string Icon);
public record CategoryResponse(string Id, string Name, string Icon, string UserId, DateTime CreatedAt);
