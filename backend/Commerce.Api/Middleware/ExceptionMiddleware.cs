using System.Net;

namespace Commerce.Api.Middleware;

/// <summary>Error de validación de negocio → HTTP 400.</summary>
public class BusinessException(string message) : Exception(message);

/// <summary>Manejo global de errores con respuestas consistentes.</summary>
public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try { await next(context); }
        catch (BusinessException ex)
        {
            await Write(context, HttpStatusCode.BadRequest, ex.Message);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error no controlado");
            await Write(context, HttpStatusCode.InternalServerError, "Ocurrió un error interno en el servidor.");
        }
    }

    private static Task Write(HttpContext ctx, HttpStatusCode status, string detail)
    {
        ctx.Response.StatusCode = (int)status;
        return ctx.Response.WriteAsJsonAsync(new { status = (int)status, title = status.ToString(), detail });
    }
}
