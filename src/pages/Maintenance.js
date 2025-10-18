import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaWrench, FaCalendarAlt, FaUser, FaCog } from 'react-icons/fa';

const MaintenanceContainer = styled.div`
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
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
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

const TasksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const TaskCard = styled.div`
  background-color: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  border-left: 4px solid ${props => props.priority === 'visoka' ? props.theme.colors.error : 
    props.priority === 'srednja' ? props.theme.colors.warning : props.theme.colors.success};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const TaskTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const TaskActions = styled.div`
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

const TaskInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
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

const StatusBadge = styled.span`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  text-transform: uppercase;
  background-color: ${props => props.status === 'izveden' ? props.theme.colors.success : 
    props.status === 'v_teku' ? props.theme.colors.warning : props.theme.colors.info};
  color: ${props => props.theme.colors.white};
`;

const PriorityBadge = styled.span`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  text-transform: uppercase;
  background-color: ${props => props.priority === 'visoka' ? props.theme.colors.error : 
    props.priority === 'srednja' ? props.theme.colors.warning : props.theme.colors.success};
  color: ${props => props.theme.colors.white};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.textSecondary};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.textSecondary};
`;

const Maintenance = ({ apiService }) => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('datum_ustvarjanja');

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    filterAndSortTasks();
  }, [tasks, searchTerm, statusFilter, priorityFilter, sortBy]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await apiService.getNalogi();
      setTasks(data);
    } catch (error) {
      console.error('Napaka pri nalaganju nalogov:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTasks = () => {
    let filtered = tasks.filter(task => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = task.naslov?.toLowerCase().includes(search) ||
                           task.opis?.toLowerCase().includes(search) ||
                           (task.ime + ' ' + task.priimek).toLowerCase().includes(search);
      
      const matchesStatus = !statusFilter || task.status === statusFilter;
      const matchesPriority = !priorityFilter || task.prioriteta === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'datum_ustvarjanja':
          return new Date(b.datum_ustvarjanja) - new Date(a.datum_ustvarjanja);
        case 'datum_vzdrževanja':
          return new Date(a.datum_načrtovanega_vzdrževanja) - new Date(b.datum_načrtovanega_vzdrževanja);
        case 'stranka':
          return (a.ime + ' ' + a.priimek).localeCompare(b.ime + ' ' + b.priimek);
        case 'prioriteta':
          const priorityOrder = { visoka: 3, srednja: 2, nizka: 1 };
          return priorityOrder[b.prioriteta] - priorityOrder[a.prioriteta];
        default:
          return 0;
      }
    });

    setFilteredTasks(filtered);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Ali ste prepričani, da želite izbrisati ta nalog?')) {
      try {
        await apiService.deleteNalog(taskId);
        await loadTasks();
      } catch (error) {
        console.error('Napaka pri brisanju naloga:', error);
        alert('Napaka pri brisanju naloga');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('sl-SI');
  };

  if (loading) {
    return (
      <MaintenanceContainer>
        <LoadingState>Nalaganje nalogov...</LoadingState>
      </MaintenanceContainer>
    );
  }

  return (
    <MaintenanceContainer>
      <Header>
        <Title>Vzdrževalni nalogi</Title>
        <AddButton onClick={() => alert('Funkcionalnost bo dodana')}>
          <FaPlus />
          Nov nalog
        </AddButton>
      </Header>

      <FiltersContainer>
        <SearchInput
          type="text"
          placeholder="Išči naloge..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Vsi statusi</option>
          <option value="načrtovan">Načrtovan</option>
          <option value="v_teku">V teku</option>
          <option value="izveden">Izveden</option>
        </FilterSelect>
        <FilterSelect value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="">Vse prioritete</option>
          <option value="visoka">Visoka</option>
          <option value="srednja">Srednja</option>
          <option value="nizka">Nizka</option>
        </FilterSelect>
        <FilterSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="datum_ustvarjanja">Po datumu ustvarjanja</option>
          <option value="datum_vzdrževanja">Po datumu vzdrževanja</option>
          <option value="stranka">Po stranki</option>
          <option value="prioriteta">Po prioriteti</option>
        </FilterSelect>
      </FiltersContainer>

      <TasksList>
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <TaskCard key={task.id} priority={task.prioriteta}>
              <TaskHeader>
                <TaskTitle>
                  <FaWrench />
                  {task.naslov}
                </TaskTitle>
                <TaskActions>
                  <StatusBadge status={task.status}>
                    {task.status}
                  </StatusBadge>
                  <PriorityBadge priority={task.prioriteta}>
                    {task.prioriteta}
                  </PriorityBadge>
                  <ActionButton
                    onClick={() => alert('Urejanje bo dodano')}
                    title="Uredi nalog"
                  >
                    <FaEdit />
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleDeleteTask(task.id)}
                    color="#F44336"
                    title="Izbriši nalog"
                  >
                    <FaTrash />
                  </ActionButton>
                </TaskActions>
              </TaskHeader>

              <TaskInfo>
                <InfoItem>
                  <InfoIcon>
                    <FaUser />
                  </InfoIcon>
                  {task.ime} {task.priimek}
                </InfoItem>
                <InfoItem>
                  <InfoIcon>
                    <FaCog />
                  </InfoIcon>
                  {task.tip_opreme} - {task.znamka}
                </InfoItem>
                <InfoItem>
                  <InfoIcon>
                    <FaCalendarAlt />
                  </InfoIcon>
                  {formatDate(task.datum_načrtovanega_vzdrževanja)}
                </InfoItem>
                <InfoItem>
                  <InfoIcon>
                    <FaCalendarAlt />
                  </InfoIcon>
                  Ustvarjen: {formatDate(task.datum_ustvarjanja)}
                </InfoItem>
              </TaskInfo>

              {task.opis && (
                <div style={{ marginBottom: '12px', fontSize: '14px', color: '#757575' }}>
                  {task.opis}
                </div>
              )}

              {task.rezervni_deli && (
                <div style={{ fontSize: '14px', color: '#757575' }}>
                  <strong>Rezervni deli:</strong> {task.rezervni_deli}
                </div>
              )}
            </TaskCard>
          ))
        ) : (
          <EmptyState>
            {searchTerm || statusFilter || priorityFilter ? 
              'Ni nalogov, ki ustrezajo filtrom' : 
              'Ni ustvarjenih nalogov'
            }
          </EmptyState>
        )}
      </TasksList>
    </MaintenanceContainer>
  );
};

export default Maintenance;
