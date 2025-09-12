// Vapi API helper functions for medical assistant

const VAPI_BASE_URL = 'https://api.vapi.ai';

export class VapiClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${VAPI_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Vapi API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Start an outbound call using workflows
  async startCall(params: {
    phoneNumber: string;
    workflowId?: string;
    variableValues?: Record<string, any>;
    metadata?: {
      patientId?: string;
      callType?: string;
      patientName?: string;
    };
  }) {
    const callData: any = {
      customer: {
        number: params.phoneNumber
      },
      phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID
    };

    // Use workflow (required for this implementation)
    if (params.workflowId || process.env.VAPI_WORKFLOW_ID) {
      callData.workflowId = params.workflowId || process.env.VAPI_WORKFLOW_ID;
      if (params.variableValues) {
        callData.workflowOverrides = {
          variableValues: params.variableValues
        };
      }
    } else {
      throw new Error('VAPI_WORKFLOW_ID is required');
    }

    if (params.metadata) {
      callData.metadata = params.metadata;
    }

    return this.request('/call', {
      method: 'POST',
      body: JSON.stringify(callData),
    });
  }

  // Get call details
  async getCall(callId: string) {
    return this.request(`/call/${callId}`);
  }

  // End a call
  async endCall(callId: string) {
    return this.request(`/call/${callId}/end`, {
      method: 'POST',
    });
  }

  // Get call transcript
  async getTranscript(callId: string) {
    return this.request(`/call/${callId}/transcript`);
  }

  // List calls with pagination
  async listCalls(params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    if (params?.status) searchParams.set('status', params.status);

    const query = searchParams.toString();
    return this.request(`/call${query ? `?${query}` : ''}`);
  }
}

// Default client instance
export const vapiClient = new VapiClient(process.env.VAPI_API_KEY || '');

// Helper function for starting calls with workflow variables
export async function startVapiCall(params: {
  toE164: string;
  variableValues?: Record<string, any>;
  hiddenVars?: Record<string, any>;
}) {
  try {
    if (!process.env.VAPI_API_KEY) {
      return { error: 'VAPI_API_KEY not configured' };
    }

    // Check for required environment variables
    if (!process.env.VAPI_WORKFLOW_ID) {
      return { error: 'VAPI_WORKFLOW_ID not configured' };
    }

    if (!process.env.VAPI_PHONE_NUMBER_ID) {
      return { error: 'VAPI_PHONE_NUMBER_ID not configured' };
    }

    // Map variables to match workflow structure - only pass patient-specific data
    const variableValues = {
      // Core patient identification (privacy-protected)
      patient_first_name: params.variableValues?.patient_name?.split(' ')[0] || 'Patient',
      security_question_text: params.variableValues?.security_question || 'What is your last name?',
      
      // Workflow state variables (no PII)
      verified: 'false', // Will be set by verifyIdentity tool
      delivery_window: '', // To be captured during call
      med_change: '', // To be captured during call
      last_shipment_issue: '', // To be captured during call
      issue_note: '', // To be captured during call
      
      // Hidden variables for internal use only (not exposed to agent)
      ...params.hiddenVars
    };

    console.log('Starting Vapi call with variables:', {
      ...variableValues,
      // Redact sensitive data from logs
      patient_first_name: '[REDACTED]',
      security_question_text: '[REDACTED]'
    });

    const result = await vapiClient.startCall({
      phoneNumber: params.toE164,
      workflowId: process.env.VAPI_WORKFLOW_ID,
      variableValues: variableValues,
      metadata: {
        patientId: params.hiddenVars?.patientId,
        callType: 'pharmacy_delivery',
        patientName: '[REDACTED]' // Don't expose full name in metadata
      }
    });

    return { data: result };
  } catch (error: any) {
    console.error('Vapi call error:', error);
    return { error: error.message };
  }
}
