/**
 * Corpocrea Odoo API Service
 * 
 * Servicio para conectar la intranet con los endpoints REST de Odoo.
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
// Servicio API
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
    this.baseUrl = url.replace(/\/+$/, ''); // Remove trailing slash
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
   * Realiza una petición POST a la API
   */
  private async post<T>(endpoint: string, data: Record<string, unknown>): Promise<ApiResponse<T>> {
    if (!this.baseUrl) {
      return { success: false, error: 'Odoo no está configurado. Ingrese la URL del servidor.' };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify(data),
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

  /**
   * Verifica si una persona es empleado por su cédula
   */
  async verifyEmployee(identificationId: string): Promise<ApiResponse<undefined> & { employee?: OdooEmployeeInfo }> {
    return this.post('/api/corpocrea/verify_employee', {
      identification_id: identificationId,
    });
  }

  /**
   * Obtiene las prestaciones sociales del empleado
   */
  async getSocialBenefits(identificationId: string): Promise<ApiResponse<OdooSocialBenefits>> {
    return this.post('/api/corpocrea/social_benefits', {
      identification_id: identificationId,
    });
  }

  /**
   * Obtiene los días de vacaciones del empleado
   */
  async getVacationDays(identificationId: string): Promise<ApiResponse<OdooVacationDays>> {
    return this.post('/api/corpocrea/vacation_days', {
      identification_id: identificationId,
    });
  }

  /**
   * Obtiene los préstamos activos del empleado
   */
  async getActiveLoans(identificationId: string): Promise<ApiResponse<OdooLoansData>> {
    return this.post('/api/corpocrea/active_loans', {
      identification_id: identificationId,
    });
  }

  /**
   * Obtiene toda la información del empleado en una sola llamada
   */
  async getEmployeeDashboard(identificationId: string): Promise<ApiResponse<OdooDashboardData>> {
    return this.post('/api/corpocrea/employee_dashboard', {
      identification_id: identificationId,
    });
  }

  /**
   * Verifica la conectividad con el servidor Odoo
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.baseUrl) {
      return { success: false, message: 'URL de Odoo no configurada' };
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.baseUrl}/web/webclient/version_info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: {} }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const version = data?.result?.server_version || 'desconocida';
        return { success: true, message: `Conectado a Odoo v${version}` };
      }
      return { success: false, message: `Error HTTP: ${response.status}` };
    } catch (error: any) {
      return { success: false, message: `Error: ${error.message}` };
    }
  }
}

// Singleton instance
export const odooApi = new OdooApiService();
