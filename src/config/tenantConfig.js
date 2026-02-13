class TenantConfig {
  constructor() {
    this.config = null;
    this.loading = false;
    this.error = null;
  }

  async load() {
    if (this.config) return this.config;
    if (this.loading) {
      while (this.loading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.config;
    }

    this.loading = true;
    try {
      let domain = window.location.hostname;
      const isDev = domain === 'localhost' || domain === '127.0.0.1';
      const apiEndpoint = isDev ? 'http://localhost:4000/api' : 'https://backend.orcode.in/api';
      
      if (isDev) {
        domain = 'orcode.in';
      }
      
      const response = await fetch(`${apiEndpoint}/tenants/config?domain=${domain}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load tenant config: ${response.status}`);
      }
      
      this.config = await response.json();
      this.loading = false;
      return this.config;
    } catch (error) {
      this.error = error;
      this.loading = false;
      throw error;
    }
  }

  get() {
    return this.config;
  }

  getLogoUrl() {
    return this.config?.logoUrl || '';
  }

  getTenantName() {
    return this.config?.tenantName || 'Orcadehub LMS';
  }
}

export default new TenantConfig();
