USE CommerceDb;
GO
-- Requisito: agregar la columna "motivo" a commerce_quarantine
IF COL_LENGTH('dbo.commerce_quarantine', 'motivo') IS NULL
    ALTER TABLE dbo.commerce_quarantine ADD motivo NVARCHAR(500) NOT NULL
        CONSTRAINT DF_cq_motivo DEFAULT N'';
GO
