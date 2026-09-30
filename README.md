# Commerce App (Angular + .NET 8 + SQL Server)

Carga de `commerce_DDMMYYYY.csv`, procesamiento por `pc_processdate` y consulta de registros en cuarentena.

## Estructura
- `database/`: scripts SQL (ejecutar en orden 00 → 05).
- `backend/Commerce.Api`: Web API en .NET 8 (Controllers → Services → Repositories → Stored Procedures).
- `frontend/`: Angular 18 (standalone, lazy loading, signals).
- `sample/commerce_30092026.csv`: archivo de ejemplo con registros válidos e inválidos.

## Cómo ejecutar
1. **BD**: ejecuta en SSMS los scripts de `database/` en orden.
2. **API**: ajusta la cadena de conexión en `backend/Commerce.Api/appsettings.json`, luego:
   `cd backend/Commerce.Api && dotnet run` (Swagger en http://localhost:5000/swagger).
3. **Front**: `cd frontend && npm install && npx ng serve` (http://localhost:4200).

## Endpoints
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/commerce/upload` | Recibe `commerce_DDMMYYYY.csv` (400 si está vacío) y llama `sp_create_commerce` |
| POST | `/api/commerce/process` | Body `{ "processDate": "2026-09-30" }`; llama `sp_process_commerce` y devuelve la cantidad en cuarentena |
| GET | `/api/commerce/quarantine` | Lista `commerce_quarantine` con su `motivo` |

## Reglas de validación (sp_process_commerce)
- `pc_nomcomred` no puede estar vacío.
- `pc_numdoc` no puede estar vacío ni contener letras o caracteres especiales.
- Los registros inválidos se mueven a `commerce_quarantine` con su motivo y se eliminan de `commerce`.

## Prueba rápida
Carga `sample/commerce_30092026.csv` → procesa la fecha `2026-09-30` → deben quedar 4 registros en cuarentena (C003, C004, C005, C006). C008 tiene otra fecha y no se procesa.
