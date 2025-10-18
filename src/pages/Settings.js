import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaCog, FaServer, FaBell, FaSync, FaSave, FaWifi, FaWifiSlash } from 'react-icons/fa';

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
  max-width: 800px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Title = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xxl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const SettingsSection = styled.div`
  background-color: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const SectionTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Label = styled.label`
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  background-color: ${props => props.theme.colors.white};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary}20;
  }
`;

const Select = styled.select`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  background-color: ${props => props.theme.colors.white};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Button = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.primaryDark};
  }

  &:disabled {
    background-color: ${props => props.theme.colors.gray};
    cursor: not-allowed;
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.connected ? props.theme.colors.success : props.theme.colors.error};
  color: ${props => props.theme.colors.white};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  cursor: pointer;
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.text};
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const Settings = ({ apiService }) => {
  const [settings, setSettings] = useState({
    serverUrl: 'http://localhost:3001',
    autoSync: true,
    syncInterval: 30,
    notifications: true,
    emailNotifications: false,
    theme: 'light'
  });
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    checkConnection();
  }, []);

  const loadSettings = () => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('maintenance-manager-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const saveSettings = () => {
    localStorage.setItem('maintenance-manager-settings', JSON.stringify(settings));
    alert('Nastavitve so bile shranjene');
  };

  const checkConnection = async () => {
    try {
      const response = await fetch(`${settings.serverUrl}/api/health`);
      setIsConnected(response.ok);
    } catch (error) {
      setIsConnected(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${settings.serverUrl}/api/health`);
      setIsConnected(response.ok);
      if (response.ok) {
        alert('Povezava s strežnikom je uspešna!');
      } else {
        alert('Napaka pri povezavi s strežnikom');
      }
    } catch (error) {
      setIsConnected(false);
      alert('Napaka pri povezavi s strežnikom');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsContainer>
      <Header>
        <FaCog />
        <Title>Nastavitve</Title>
      </Header>

      <SettingsSection>
        <SectionTitle>
          <FaServer />
          Povezava s strežnikom
        </SectionTitle>
        
        <StatusIndicator connected={isConnected}>
          {isConnected ? <FaWifi /> : <FaWifiSlash />}
          {isConnected ? 'Povezan s strežnikom' : 'Ni povezave s strežnikom'}
        </StatusIndicator>

        <FormGroup>
          <Label htmlFor="serverUrl">URL strežnika</Label>
          <Input
            type="text"
            id="serverUrl"
            value={settings.serverUrl}
            onChange={(e) => handleInputChange('serverUrl', e.target.value)}
            placeholder="http://your-server:3001"
          />
        </FormGroup>

        <Button onClick={handleTestConnection} disabled={loading}>
          {loading ? 'Testiranje...' : 'Testiraj povezavo'}
        </Button>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>
          <FaSync />
          Sinhronizacija
        </SectionTitle>

        <CheckboxGroup>
          <CheckboxItem>
            <Checkbox
              type="checkbox"
              checked={settings.autoSync}
              onChange={(e) => handleInputChange('autoSync', e.target.checked)}
            />
            Avtomatska sinhronizacija
          </CheckboxItem>
        </CheckboxGroup>

        <FormGroup>
          <Label htmlFor="syncInterval">Interval sinhronizacije (sekunde)</Label>
          <Select
            id="syncInterval"
            value={settings.syncInterval}
            onChange={(e) => handleInputChange('syncInterval', parseInt(e.target.value))}
          >
            <option value={10}>10 sekund</option>
            <option value={30}>30 sekund</option>
            <option value={60}>1 minuta</option>
            <option value={300}>5 minut</option>
            <option value={600}>10 minut</option>
          </Select>
        </FormGroup>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>
          <FaBell />
          Obvestila
        </SectionTitle>

        <CheckboxGroup>
          <CheckboxItem>
            <Checkbox
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => handleInputChange('notifications', e.target.checked)}
            />
            Omogoči obvestila
          </CheckboxItem>
          <CheckboxItem>
            <Checkbox
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
            />
            E-poštna obvestila
          </CheckboxItem>
        </CheckboxGroup>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>
          <FaCog />
          Splošne nastavitve
        </SectionTitle>

        <FormGroup>
          <Label htmlFor="theme">Tema</Label>
          <Select
            id="theme"
            value={settings.theme}
            onChange={(e) => handleInputChange('theme', e.target.value)}
          >
            <option value="light">Svetla</option>
            <option value="dark">Temna</option>
            <option value="auto">Avtomatska</option>
          </Select>
        </FormGroup>
      </SettingsSection>

      <Button onClick={saveSettings}>
        <FaSave />
        Shrani nastavitve
      </Button>
    </SettingsContainer>
  );
};

export default Settings;
