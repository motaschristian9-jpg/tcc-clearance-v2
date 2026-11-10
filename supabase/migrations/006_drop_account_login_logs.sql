-- ==============================================================================
-- TCC Clearance System - Migration 006: Drop Obsolete Account Login Logs
-- Migration: 006_drop_account_login_logs.sql
-- ==============================================================================

-- Drop the redundant account_login_logs table and any associated policies/triggers
drop table if exists public.account_login_logs cascade;
