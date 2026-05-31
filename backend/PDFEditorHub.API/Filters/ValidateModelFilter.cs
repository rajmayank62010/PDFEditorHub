using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using PDFEditorHub.Application.DTOs;

namespace PDFEditorHub.API.Filters;

public class ValidateModelFilter : IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context)
    {
        if (!context.ModelState.IsValid)
        {
            var errors = context.ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            context.Result = new BadRequestObjectResult(
                ApiResponse<object>.Fail("Validation failed.", errors));
        }
    }

    public void OnActionExecuted(ActionExecutedContext context) { }
}
