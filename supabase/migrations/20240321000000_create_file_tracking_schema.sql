-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create files table
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    storage_bucket TEXT NOT NULL DEFAULT 'files',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    version INTEGER NOT NULL DEFAULT 1,
    parent_id UUID REFERENCES public.files(id),
    workflow_id UUID REFERENCES public.workflows(id),
    node_id TEXT,
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    processing_result JSONB,
    tags TEXT[]
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_files_created_by ON public.files(created_by);
CREATE INDEX IF NOT EXISTS idx_files_workflow_id ON public.files(workflow_id);
CREATE INDEX IF NOT EXISTS idx_files_storage_path ON public.files(storage_path);
CREATE INDEX IF NOT EXISTS idx_files_tags ON public.files USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_files_metadata ON public.files USING GIN(metadata);

-- Add RLS policies
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own files"
    ON public.files FOR SELECT
    USING (auth.uid() = created_by);

CREATE POLICY "Users can view public files"
    ON public.files FOR SELECT
    USING (is_public = true);

CREATE POLICY "Users can insert their own files"
    ON public.files FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own files"
    ON public.files FOR UPDATE
    USING (auth.uid() = created_by);

-- Create file versions table
CREATE TABLE IF NOT EXISTS public.file_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES public.files(id),
    version_number INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    size BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    change_description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(file_id, version_number)
);

-- Add indexes for file versions
CREATE INDEX IF NOT EXISTS idx_file_versions_file_id ON public.file_versions(file_id);
CREATE INDEX IF NOT EXISTS idx_file_versions_version_number ON public.file_versions(version_number);

-- Add RLS policies for file versions
ALTER TABLE public.file_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view versions of their files"
    ON public.file_versions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.files
        WHERE files.id = file_versions.file_id
        AND files.created_by = auth.uid()
    ));

CREATE POLICY "Users can insert versions for their files"
    ON public.file_versions FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.files
        WHERE files.id = file_versions.file_id
        AND files.created_by = auth.uid()
    ));

-- Create file permissions table
CREATE TABLE IF NOT EXISTS public.file_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES public.files(id),
    user_id UUID REFERENCES auth.users(id),
    permission_type TEXT NOT NULL CHECK (permission_type IN ('read', 'write', 'admin')),
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    granted_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMPTZ,
    UNIQUE(file_id, user_id, permission_type)
);

-- Add indexes for file permissions
CREATE INDEX IF NOT EXISTS idx_file_permissions_file_id ON public.file_permissions(file_id);
CREATE INDEX IF NOT EXISTS idx_file_permissions_user_id ON public.file_permissions(user_id);

-- Add RLS policies for file permissions
ALTER TABLE public.file_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own permissions"
    ON public.file_permissions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "File owners can manage permissions"
    ON public.file_permissions FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.files
        WHERE files.id = file_permissions.file_id
        AND files.created_by = auth.uid()
    ));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for files table
CREATE TRIGGER update_files_updated_at
    BEFORE UPDATE ON public.files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 