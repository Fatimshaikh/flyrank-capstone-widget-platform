-- Submissions table: one row per visitor form submission
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    widget_id INTEGER NOT NULL REFERENCES widgets(id) ON DELETE CASCADE,
    tenant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}',
    ip_address VARCHAR(64),
    country VARCHAR(100),
    city VARCHAR(100),
    honeypot_triggered BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast lookups: dashboard queries filter by tenant, and often by widget too
CREATE INDEX IF NOT EXISTS idx_submissions_tenant_id ON submissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_submissions_widget_id ON submissions(widget_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);
