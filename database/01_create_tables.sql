USE CommerceDb;
GO
-- Estructura inventada del CSV (todas las columnas llevan prefijo pc_)
IF OBJECT_ID('dbo.commerce') IS NULL
CREATE TABLE dbo.commerce (
    id              INT IDENTITY(1,1) CONSTRAINT PK_commerce PRIMARY KEY,
    pc_codcomercio  VARCHAR(20)   NOT NULL,
    pc_nomcomred    NVARCHAR(150) NULL,
    pc_tipdoc       VARCHAR(10)   NULL,
    pc_numdoc       VARCHAR(30)   NULL,
    pc_direccion    NVARCHAR(200) NULL,
    pc_telefono     VARCHAR(20)   NULL,
    pc_email        VARCHAR(120)  NULL,
    pc_processdate  DATE          NOT NULL
);
GO
IF OBJECT_ID('dbo.commerce_quarantine') IS NULL
CREATE TABLE dbo.commerce_quarantine (
    id              INT IDENTITY(1,1) CONSTRAINT PK_commerce_quarantine PRIMARY KEY,
    commerce_id     INT           NULL,          -- id original en commerce
    pc_codcomercio  VARCHAR(20)   NOT NULL,
    pc_nomcomred    NVARCHAR(150) NULL,
    pc_tipdoc       VARCHAR(10)   NULL,
    pc_numdoc       VARCHAR(30)   NULL,
    pc_direccion    NVARCHAR(200) NULL,
    pc_telefono     VARCHAR(20)   NULL,
    pc_email        VARCHAR(120)  NULL,
    pc_processdate  DATE          NOT NULL,
    created_at      DATETIME2     NOT NULL CONSTRAINT DF_cq_created DEFAULT SYSDATETIME()
);
GO
CREATE INDEX IX_commerce_processdate ON dbo.commerce (pc_processdate);
GO
