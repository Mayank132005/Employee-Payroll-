
-- Create employees table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  department TEXT NOT NULL,
  designation TEXT NOT NULL,
  phone TEXT,
  joining_date DATE NOT NULL,
  basic_salary NUMERIC NOT NULL DEFAULT 0,
  employment_status TEXT NOT NULL DEFAULT 'active' CHECK (employment_status IN ('active', 'on_leave', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  days_present INTEGER NOT NULL DEFAULT 0,
  leaves INTEGER NOT NULL DEFAULT 0,
  overtime_hours NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, month, year)
);

-- Create salary/payroll table
CREATE TABLE public.salary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  basic NUMERIC NOT NULL DEFAULT 0,
  hra NUMERIC NOT NULL DEFAULT 0,
  bonus NUMERIC NOT NULL DEFAULT 0,
  overtime_pay NUMERIC NOT NULL DEFAULT 0,
  tax NUMERIC NOT NULL DEFAULT 0,
  provident_fund NUMERIC NOT NULL DEFAULT 0,
  insurance NUMERIC NOT NULL DEFAULT 0,
  loan_deduction NUMERIC NOT NULL DEFAULT 0,
  net_salary NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'finalized')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, month, year)
);

-- Create payroll settings table
CREATE TABLE public.payroll_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL DEFAULT 'Company',
  hra_percentage NUMERIC NOT NULL DEFAULT 40,
  pf_percentage NUMERIC NOT NULL DEFAULT 12,
  tax_rate NUMERIC NOT NULL DEFAULT 10,
  overtime_rate NUMERIC NOT NULL DEFAULT 50,
  insurance_amount NUMERIC NOT NULL DEFAULT 200,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_settings ENABLE ROW LEVEL SECURITY;

-- Allow all access for now (MVP - no auth yet)
CREATE POLICY "Allow all access to employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to salary" ON public.salary FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to payroll_settings" ON public.payroll_settings FOR ALL USING (true) WITH CHECK (true);

-- Auto-generate employee IDs
CREATE OR REPLACE FUNCTION public.generate_employee_id()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(employee_id FROM 4) AS INTEGER)), 0) + 1
  INTO next_num FROM public.employees;
  NEW.employee_id := 'EMP' || LPAD(next_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_employee_id
  BEFORE INSERT ON public.employees
  FOR EACH ROW
  WHEN (NEW.employee_id IS NULL OR NEW.employee_id = '')
  EXECUTE FUNCTION public.generate_employee_id();

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_salary_updated_at BEFORE UPDATE ON public.salary FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payroll_settings_updated_at BEFORE UPDATE ON public.payroll_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default payroll settings
INSERT INTO public.payroll_settings (company_name, hra_percentage, pf_percentage, tax_rate, overtime_rate, insurance_amount)
VALUES ('Acme Corp', 40, 12, 10, 50, 200);
