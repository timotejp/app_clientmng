import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaCog, FaThermometerHalf, FaFire, FaMobile, FaWind } from 'react-icons/fa';
import DeviceModal from '../components/DeviceModal';

const DevicesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Title = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xxl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const AddButton = styled.button`
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
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  max-width: 300px;
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

const FilterSelect = styled.select`
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

const DevicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const DeviceCard = styled.div`
  background-color: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  border: 1px solid ${props => props.theme.colors.border};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const DeviceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const DeviceName = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const DeviceActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.color || props.theme.colors.textSecondary};
  cursor: pointer;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.lightGray};
  }
`;

const DeviceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const InfoIcon = styled.div`
  color: ${props => props.theme.colors.primary};
  width: 16px;
  display: flex;
  justify-content: center;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.textSecondary};
  grid-column: 1 / -1;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.textSecondary};
  grid-column: 1 / -1;
`;

const getDeviceIcon = (tipOpreme) => {
  switch (tipOpreme?.toLowerCase()) {
    case 'klima':
    case 'ac':
      return <FaThermometerHalf />;
    case 'toplotna črpalka':
    case 'heatpump':
      return <FaWind />;
    case 'plinski gorilnik':
    case 'gas burner':
      return <FaFire />;
    case 'telefon':
    case 'phone':
      return <FaMobile />;
    default:
      return <FaCog />;
  }
};

const Devices = ({ apiService }) => {
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('tip_opreme');
  const [showModal, setShowModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSortDevices();
  }, [devices, searchTerm, sortBy]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [devicesData, clientsData] = await Promise.all([
        apiService.getOprema(),
        apiService.getStranke()
      ]);
      setDevices(devicesData);
      setClients(clientsData);
    } catch (error) {
      console.error('Napaka pri nalaganju podatkov:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortDevices = () => {
    let filtered = devices.filter(device => {
      const search = searchTerm.toLowerCase();
      return device.tip_opreme?.toLowerCase().includes(search) || 
             device.znamka?.toLowerCase().includes(search) ||
             device.model?.toLowerCase().includes(search) ||
             device.serijska_stevilka?.toLowerCase().includes(search);
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'tip_opreme':
          return a.tip_opreme.localeCompare(b.tip_opreme);
        case 'znamka':
          return a.znamka.localeCompare(b.znamka);
        case 'model':
          return a.model.localeCompare(b.model);
        case 'stranka':
          return (a.ime + ' ' + a.priimek).localeCompare(b.ime + ' ' + b.priimek);
        default:
          return 0;
      }
    });

    setFilteredDevices(filtered);
  };

  const handleAddDevice = () => {
    setEditingDevice(null);
    setShowModal(true);
  };

  const handleEditDevice = (device) => {
    setEditingDevice(device);
    setShowModal(true);
  };

  const handleDeleteDevice = async (deviceId) => {
    if (window.confirm('Ali ste prepričani, da želite izbrisati to opremo?')) {
      try {
        await apiService.deleteOprema(deviceId);
        await loadData();
      } catch (error) {
        console.error('Napaka pri brisanju opreme:', error);
        alert('Napaka pri brisanju opreme');
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingDevice(null);
  };

  const handleModalSave = async (deviceData) => {
    try {
      if (editingDevice) {
        await apiService.updateOprema(editingDevice.id, deviceData);
      } else {
        await apiService.createOprema(deviceData);
      }
      await loadData();
      setShowModal(false);
      setEditingDevice(null);
    } catch (error) {
      console.error('Napaka pri shranjevanju opreme:', error);
      alert('Napaka pri shranjevanju opreme');
    }
  };

  if (loading) {
    return (
      <DevicesContainer>
        <LoadingState>Nalaganje opreme...</LoadingState>
      </DevicesContainer>
    );
  }

  return (
    <DevicesContainer>
      <Header>
        <Title>Oprema</Title>
        <AddButton onClick={handleAddDevice}>
          <FaPlus />
          Dodaj opremo
        </AddButton>
      </Header>

      <FiltersContainer>
        <SearchInput
          type="text"
          placeholder="Išči opremo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="tip_opreme">Razvrsti po tipu</option>
          <option value="znamka">Razvrsti po znamki</option>
          <option value="model">Razvrsti po modelu</option>
          <option value="stranka">Razvrsti po stranki</option>
        </FilterSelect>
      </FiltersContainer>

      <DevicesGrid>
        {filteredDevices.length > 0 ? (
          filteredDevices.map(device => (
            <DeviceCard key={device.id}>
              <DeviceHeader>
                <DeviceName>
                  {getDeviceIcon(device.tip_opreme)}
                  {device.tip_opreme} - {device.znamka}
                </DeviceName>
                <DeviceActions>
                  <ActionButton
                    onClick={() => handleEditDevice(device)}
                    title="Uredi opremo"
                  >
                    <FaEdit />
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleDeleteDevice(device.id)}
                    color="#F44336"
                    title="Izbriši opremo"
                  >
                    <FaTrash />
                  </ActionButton>
                </DeviceActions>
              </DeviceHeader>

              <DeviceInfo>
                {device.model && (
                  <InfoItem>
                    <InfoIcon>
                      <FaCog />
                    </InfoIcon>
                    Model: {device.model}
                  </InfoItem>
                )}
                {device.serijska_stevilka && (
                  <InfoItem>
                    <InfoIcon>
                      <FaCog />
                    </InfoIcon>
                    Serijska številka: {device.serijska_stevilka}
                  </InfoItem>
                )}
                {device.ime && device.priimek && (
                  <InfoItem>
                    <InfoIcon>
                      <FaCog />
                    </InfoIcon>
                    Stranka: {device.ime} {device.priimek}
                  </InfoItem>
                )}
                {device.opombe && (
                  <InfoItem>
                    <InfoIcon>
                      <FaCog />
                    </InfoIcon>
                    {device.opombe}
                  </InfoItem>
                )}
              </DeviceInfo>
            </DeviceCard>
          ))
        ) : (
          <EmptyState>
            {searchTerm ? 'Ni opreme, ki ustrezajo iskanju' : 'Ni dodane opreme'}
          </EmptyState>
        )}
      </DevicesGrid>

      {showModal && (
        <DeviceModal
          device={editingDevice}
          clients={clients}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </DevicesContainer>
  );
};

export default Devices;
