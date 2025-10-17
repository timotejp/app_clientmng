import axios from 'axios';

export class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:3001/api';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  setBaseUrl(url) {
    this.baseURL = `${url}/api`;
    this.client.defaults.baseURL = this.baseURL;
  }

  // Stranke (Clients)
  async getStranke() {
    try {
      const response = await this.client.get('/stranke');
      return response.data;
    } catch (error) {
      console.error('Napaka pri pridobivanju strank:', error);
      throw error;
    }
  }

  async createStranka(stranka) {
    try {
      const response = await this.client.post('/stranke', stranka);
      return response.data;
    } catch (error) {
      console.error('Napaka pri ustvarjanju stranke:', error);
      throw error;
    }
  }

  async updateStranka(id, stranka) {
    try {
      const response = await this.client.put(`/stranke/${id}`, stranka);
      return response.data;
    } catch (error) {
      console.error('Napaka pri posodabljanju stranke:', error);
      throw error;
    }
  }

  async deleteStranka(id) {
    try {
      const response = await this.client.delete(`/stranke/${id}`);
      return response.data;
    } catch (error) {
      console.error('Napaka pri brisanju stranke:', error);
      throw error;
    }
  }

  // Oprema (Devices)
  async getOprema(strankaId = null) {
    try {
      const params = strankaId ? { stranka_id: strankaId } : {};
      const response = await this.client.get('/oprema', { params });
      return response.data;
    } catch (error) {
      console.error('Napaka pri pridobivanju opreme:', error);
      throw error;
    }
  }

  async createOprema(oprema) {
    try {
      const response = await this.client.post('/oprema', oprema);
      return response.data;
    } catch (error) {
      console.error('Napaka pri ustvarjanju opreme:', error);
      throw error;
    }
  }

  async updateOprema(id, oprema) {
    try {
      const response = await this.client.put(`/oprema/${id}`, oprema);
      return response.data;
    } catch (error) {
      console.error('Napaka pri posodabljanju opreme:', error);
      throw error;
    }
  }

  async deleteOprema(id) {
    try {
      const response = await this.client.delete(`/oprema/${id}`);
      return response.data;
    } catch (error) {
      console.error('Napaka pri brisanju opreme:', error);
      throw error;
    }
  }

  // Vzdrževalni nalogi (Maintenance Tasks)
  async getNalogi(filters = {}) {
    try {
      const response = await this.client.get('/nalogi', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Napaka pri pridobivanju nalogov:', error);
      throw error;
    }
  }

  async createNalog(nalog) {
    try {
      const response = await this.client.post('/nalogi', nalog);
      return response.data;
    } catch (error) {
      console.error('Napaka pri ustvarjanju naloga:', error);
      throw error;
    }
  }

  async updateNalog(id, nalog) {
    try {
      const response = await this.client.put(`/nalogi/${id}`, nalog);
      return response.data;
    } catch (error) {
      console.error('Napaka pri posodabljanju naloga:', error);
      throw error;
    }
  }

  async deleteNalog(id) {
    try {
      const response = await this.client.delete(`/nalogi/${id}`);
      return response.data;
    } catch (error) {
      console.error('Napaka pri brisanju naloga:', error);
      throw error;
    }
  }

  // Slike (Images)
  async uploadSlike(nalogId, files) {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('slike', file);
      });

      const response = await this.client.post(`/nalogi/${nalogId}/slike`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Napaka pri nalaganju slik:', error);
      throw error;
    }
  }

  async getSlike(nalogId) {
    try {
      const response = await this.client.get(`/nalogi/${nalogId}/slike`);
      return response.data;
    } catch (error) {
      console.error('Napaka pri pridobivanju slik:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      console.error('Napaka pri preverjanju stanja strežnika:', error);
      throw error;
    }
  }
}
