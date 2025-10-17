import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import ClientModal from '../components/ClientModal';

const ClientsContainer = styled.div`
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

const ClientsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const ClientCard = styled.div`
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

const ClientHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ClientName = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const ClientActions = styled.div`
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

const ClientInfo = styled.div`
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

const Clients = ({ apiService }) => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('ime');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterAndSortClients();
  }, [clients, searchTerm, sortBy]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await apiService.getStranke();
      setClients(data);
    } catch (error) {
      console.error('Napaka pri nalaganju strank:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortClients = () => {
    let filtered = clients.filter(client => {
      const fullName = `${client.ime} ${client.priimek}`.toLowerCase();
      const search = searchTerm.toLowerCase();
      return fullName.includes(search) || 
             client.email?.toLowerCase().includes(search) ||
             client.telefon?.includes(search);
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'ime':
          return a.ime.localeCompare(b.ime);
        case 'priimek':
          return a.priimek.localeCompare(b.priimek);
        case 'email':
          return (a.email || '').localeCompare(b.email || '');
        case 'datum':
          return new Date(b.datum_dodajanja) - new Date(a.datum_dodajanja);
        default:
          return 0;
      }
    });

    setFilteredClients(filtered);
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setShowModal(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm('Ali ste prepričani, da želite izbrisati to stranko?')) {
      try {
        await apiService.deleteStranka(clientId);
        await loadClients();
      } catch (error) {
        console.error('Napaka pri brisanju stranke:', error);
        alert('Napaka pri brisanju stranke');
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingClient(null);
  };

  const handleModalSave = async (clientData) => {
    try {
      if (editingClient) {
        await apiService.updateStranka(editingClient.id, clientData);
      } else {
        await apiService.createStranka(clientData);
      }
      await loadClients();
      setShowModal(false);
      setEditingClient(null);
    } catch (error) {
      console.error('Napaka pri shranjevanju stranke:', error);
      alert('Napaka pri shranjevanju stranke');
    }
  };

  if (loading) {
    return (
      <ClientsContainer>
        <LoadingState>Nalaganje strank...</LoadingState>
      </ClientsContainer>
    );
  }

  return (
    <ClientsContainer>
      <Header>
        <Title>Stranke</Title>
        <AddButton onClick={handleAddClient}>
          <FaPlus />
          Dodaj stranko
        </AddButton>
      </Header>

      <FiltersContainer>
        <SearchInput
          type="text"
          placeholder="Išči stranke..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="ime">Razvrsti po imenu</option>
          <option value="priimek">Razvrsti po priimku</option>
          <option value="email">Razvrsti po e-pošti</option>
          <option value="datum">Razvrsti po datumu dodajanja</option>
        </FilterSelect>
      </FiltersContainer>

      <ClientsGrid>
        {filteredClients.length > 0 ? (
          filteredClients.map(client => (
            <ClientCard key={client.id}>
              <ClientHeader>
                <ClientName>{client.ime} {client.priimek}</ClientName>
                <ClientActions>
                  <ActionButton
                    onClick={() => handleEditClient(client)}
                    title="Uredi stranko"
                  >
                    <FaEdit />
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleDeleteClient(client.id)}
                    color="#F44336"
                    title="Izbriši stranko"
                  >
                    <FaTrash />
                  </ActionButton>
                </ClientActions>
              </ClientHeader>

              <ClientInfo>
                {client.email && (
                  <InfoItem>
                    <InfoIcon>
                      <FaEnvelope />
                    </InfoIcon>
                    {client.email}
                  </InfoItem>
                )}
                {client.telefon && (
                  <InfoItem>
                    <InfoIcon>
                      <FaPhone />
                    </InfoIcon>
                    {client.telefon}
                  </InfoItem>
                )}
                {client.naslov && (
                  <InfoItem>
                    <InfoIcon>
                      <FaMapMarkerAlt />
                    </InfoIcon>
                    {client.naslov}
                  </InfoItem>
                )}
                {client.opombe && (
                  <InfoItem>
                    <InfoIcon>
                      <FaUser />
                    </InfoIcon>
                    {client.opombe}
                  </InfoItem>
                )}
              </ClientInfo>
            </ClientCard>
          ))
        ) : (
          <EmptyState>
            {searchTerm ? 'Ni strank, ki ustrezajo iskanju' : 'Ni dodanih strank'}
          </EmptyState>
        )}
      </ClientsGrid>

      {showModal && (
        <ClientModal
          client={editingClient}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </ClientsContainer>
  );
};

export default Clients;
