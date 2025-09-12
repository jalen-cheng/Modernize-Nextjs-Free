-- MedMe Assistant Database Schema
-- Run this in your Supabase SQL editor to create the required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_e164 TEXT NOT NULL,
    email TEXT,
    date_of_birth DATE,
    security_question TEXT DEFAULT 'What is your last name?',
    security_answer TEXT,
    medical_history TEXT,
    allergies TEXT[],
    medications TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create call_log table
CREATE TABLE IF NOT EXISTS call_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    call_job_id TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL,
    available_on_scheduled_date BOOLEAN,
    delivery_window TEXT,
    med_change TEXT,
    shipment_feedback JSONB,
    free_text_notes TEXT DEFAULT '',
    transcript JSONB,
    model_raw JSONB,
    meta JSONB
);

-- Enable Row Level Security (RLS)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Users can view all patients" ON patients
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert patients" ON patients
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update patients" ON patients
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete patients" ON patients
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view all call logs" ON call_log
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert call logs" ON call_log
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at);
CREATE INDEX IF NOT EXISTS idx_call_log_patient_id ON call_log(patient_id);
CREATE INDEX IF NOT EXISTS idx_call_log_status ON call_log(status);
CREATE INDEX IF NOT EXISTS idx_call_log_started_at ON call_log(started_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for patients table
CREATE TRIGGER update_patients_updated_at 
    BEFORE UPDATE ON patients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO patients (first_name, last_name, email, phone_e164, security_answer) VALUES
    ('John', 'Doe', 'john.doe@example.com', '+16136002893', 'Doe'),
    ('Jane', 'Smith', 'jane.smith@example.com', '+16136002893', 'Smith'),
    ('Bob', 'Johnson', 'bob.johnson@example.com', '+16136002893', 'Johnson')
ON CONFLICT DO NOTHING;
