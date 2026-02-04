using System.ComponentModel.DataAnnotations;

namespace Trackify.Api.Dtos;

public record CategoryCreateDto(
    [Required, StringLength(100, MinimumLength = 1)] string Name,
    [Required, StringLength(10)] string Icon
);

public record CategoryUpdateDto(
    [Required, StringLength(100, MinimumLength = 1)] string Name,
    [Required, StringLength(10)] string Icon
);

public record CategoryResponse(
    string Id,
    string Name,
    string Icon,
    string UserId,
    DateTime CreatedAt
);
