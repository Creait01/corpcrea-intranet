/**
 * Corpocrea Odoo API Service
 * 
 * Servicio para conectar la intranet con los endpoints REST de Odoo.
 * Todas las llamadas pasan por el proxy del servidor Express para evitar CORS.
 * Configuración almacenada en localStorage para persistencia.
 */

// =============================================
// Tipos de respuesta de la API
// =============================================

export interface OdooEmployeeInfo {
  id: number;
  name: string;
  identification_id: string;
  work_email: string;
  personal_email?: string;
  job_title: string;
  department: string;
  company: string;
  photo_url: string;
}

export interface OdooSocialBenefits {
  employee_id: number;
  employee_name: string;
  has_contract: boolean;
  contract_name: string;
  total_available: number;
  social_benefits_generated: number;
  accrued_social_benefits: number;
  advances_of_social_benefits: number;
  benefit_interest: number;
  days_per_year_accumulated: number;
  earnings_generated_total_available: number;
  accumulated_social_benefits: number;
  prestaciones_detail?: {
    year: number;
    month: number;
    monto_total: number;
    monto_acumulado: number;
    monto_interes_acumulado: number;
    dias_acumulados: number;
    dias_adicionales_acumulados: number;
  };
  acumulado_prestaciones?: number;
  acumulado_intereses?: number;
}

export interface OdooVacationDays {
  employee_id: number;
  employee_name: string;
  has_contract: boolean;
  years_of_seniority: number;
  months_of_seniority: number;
  base_vacation_days: number;
  additional_days: number;
  total_entitled_days: number;
  days_taken: number;
  days_available: number;
  vacations_advances_granted: number;
  allocated_leave_days?: number;
  history?: Array<{
    year: number;
    days_taken: number;
  }>;
}

export interface OdooLoan {
  source: string;
  id: number;
  name: string;
  type: string;
  amount: number;
  paid_amount?: number;
  remaining?: number;
  installment_amount?: number;
  interest_rate?: number;
  state: string;
  state_label?: string;
  start_date?: string;
  end_date?: string;
  period?: string;
  term?: number;
  fees?: number;
  fee_amount?: number;
  date?: string;
  tenure?: number;
}

export interface OdooLoansData {
  employee_id: number;
  employee_name: string;
  total_loans: number;
  loans: OdooLoan[];
}

export interface OdooDashboardData {
  employee: OdooEmployeeInfo;
  social_benefits: {
    total_available: number;
    social_benefits_generated: number;
    accrued_social_benefits: number;
    advances_of_social_benefits: number;
    benefit_interest: number;
    days_per_year_accumulated: number;
    earnings_generated_total_available: number;
  };
  vacation: {
    years_of_seniority: number;
    months_of_seniority: number;
    base_vacation_days: number;
    additional_days: number;
    total_entitled_days: number;
    days_taken: number;
    days_available: number;
  };
  loans: {
    total: number;
    items: OdooLoan[];
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  employee?: OdooEmployeeInfo;
  error?: string;
}

// =============================================
// Servicio API (a través de proxy server-side)
// =============================================

class OdooApiService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = localStorage.getItem('odoo_url') || '';
    this.apiKey = localStorage.getItem('odoo_api_key') || '';
  }

  /**
   * Configura la URL base y API key de Odoo
   */
  setConfig(url: string, apiKey: string) {
    this.baseUrl = url.replace(/\/+$/, '');
    this.apiKey = apiKey;
    localStorage.setItem('odoo_url', this.baseUrl);
    localStorage.setItem('odoo_api_key', this.apiKey);
  }

  /**
   * Obtiene la configuración actual
   */
  getConfig() {
    return {
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
      isConfigured: Boolean(this.baseUrl),
    };
  }

  /**
   * Realiza una petición a Odoo a través del proxy del servidor Express.
   * Esto evita problemas de CORS.
   */
  private async post<T>(endpoint: string, data: Record<string, unknown>): Promise<ApiResponse<T>> {
    if (!this.baseUrl) {
      return { success: false, error: 'Odoo no está configurado. Ingrese la URL del servidor.' };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const response = await fetch('/api/odoo/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          odooUrl: this.baseUrl,
          apiKey: this.apiKey,
          endpoint,
          data,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json();
      return result;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return { success: false, error: 'Tiempo de espera agotado. Verifique la conexión con Odoo.' };
      }
      return { 
        success: false, 
        error: `Error de conexión: ${error.message || 'No se pudo conectar con el servidor Odoo'}` 
      };
    }
  }

  // ---- Endpoints ----

  async verifyEmployee(identificationId: string): Promise<ApiResponse<undefined> & { employee?: OdooEmployeeInfo }> {
    return this.post('/api/corpocrea/verify_employee', {
      identification_id: identificationId,
    });
  }

  async getSocialBenefits(identificationId: string): Promise<ApiResponse<OdooSocialBenefits>> {
    return this.post('/api/corpocrea/social_benefits', {
      identification_id: identificationId,
    });
  }

  async getVacationDays(identificationId: string): Promise<ApiResponse<OdooVacationDays>> {
    return this.post('/api/corpocrea/vacation_days', {
      identification_id: identificationId,
    });
  }

  async getActiveLoans(identificationId: string): Promise<ApiResponse<OdooLoansData>> {
    return this.post('/api/corpocrea/active_loans', {
      identification_id: identificationId,
    });
  }

  async getEmployeeDashboard(identificationId: string): Promise<ApiResponse<OdooDashboardData>> {
    return this.post('/api/corpocrea/employee_dashboard', {
      identification_id: identificationId,
    });
  }

  /**
   * Verifica la conectividad con el servidor Odoo (a través del proxy)
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.baseUrl) {
      return { success: false, message: 'URL de Odoo no configurada' };
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('/api/odoo/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ odooUrl: this.baseUrl }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await response.json();
    } catch (error: any) {
      return { success: false, message: `Error: ${error.message}` };
    }
  }
}

export const odooApi = new OdooApiService();
