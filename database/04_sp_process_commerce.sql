USE CommerceDb;
GO
CREATE OR ALTER PROCEDURE dbo.sp_process_commerce
    @processdate DATE
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    -- 1) Detectar registros inválidos del día y armar el motivo
    SELECT c.id,
           motivo = CONCAT_WS(N'; ',
               CASE WHEN LTRIM(RTRIM(ISNULL(c.pc_nomcomred, N''))) = N''
                    THEN N'El nombre del comercio (nomcomred) se encuentra vacío' END,
               CASE WHEN LTRIM(RTRIM(ISNULL(c.pc_numdoc, ''))) = ''
                    THEN N'El número (numdoc) se encuentra vacío' END,
               CASE WHEN LTRIM(RTRIM(c.pc_numdoc)) COLLATE Latin1_General_BIN2 LIKE '%[A-Za-z]%'
                    THEN N'El número (numdoc) contiene letras' END,
               CASE WHEN LTRIM(RTRIM(c.pc_numdoc)) COLLATE Latin1_General_BIN2 LIKE '%[^A-Za-z0-9]%'
                    THEN N'El número (numdoc) contiene caracteres especiales' END)
    INTO #invalid
    FROM dbo.commerce c
    WHERE c.pc_processdate = @processdate
      AND (   LTRIM(RTRIM(ISNULL(c.pc_nomcomred, N''))) = N''
           OR LTRIM(RTRIM(ISNULL(c.pc_numdoc, '')))     = ''
           OR LTRIM(RTRIM(c.pc_numdoc)) COLLATE Latin1_General_BIN2 LIKE '%[^0-9]%');

    DECLARE @count INT;

    BEGIN TRAN;
        -- 2) Mover a cuarentena
        INSERT INTO dbo.commerce_quarantine
            (commerce_id, pc_codcomercio, pc_nomcomred, pc_tipdoc, pc_numdoc,
             pc_direccion, pc_telefono, pc_email, pc_processdate, motivo)
        SELECT c.id, c.pc_codcomercio, c.pc_nomcomred, c.pc_tipdoc, c.pc_numdoc,
               c.pc_direccion, c.pc_telefono, c.pc_email, c.pc_processdate, i.motivo
        FROM dbo.commerce c
        JOIN #invalid i ON i.id = c.id;

        SET @count = @@ROWCOUNT;

        -- 3) Eliminar de commerce
        DELETE c FROM dbo.commerce c JOIN #invalid i ON i.id = c.id;
    COMMIT;

    SELECT @count AS quarantined;   -- registros insertados en commerce_quarantine
END
GO
