-- Widgets table: each widget belongs to exactly one tenant (user)
CREATE TABLE IF NOT EXISTS widgets (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('signup_form', 'cta_popover')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    fields JSONB NOT NULL DEFAULT '[]',
    button_text VARCHAR(100) NOT NULL DEFAULT 'Submit',
    display_options JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast "get all widgets for this tenant" queries (tenant isolation)
CREATE INDEX IF NOT EXISTS idx_widgets_tenant_id ON widgets(tenant_id);
