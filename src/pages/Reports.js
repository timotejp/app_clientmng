import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaChartBar, FaUsers, FaCogs, FaWrench, FaCalendarAlt, FaDownload } from 'react-icons/fa';

const ReportsContainer = styled.div`
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

const ExportButton = styled.button`
  background-color: ${props => props.theme.colors.secondary};
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
    background-color: ${props => props.theme.colors.secondaryDark};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const StatCard = styled.div`
  background-color: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  border-left: 4px solid ${props => props.color || props.theme.colors.primary};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const StatIcon = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xxl};
  color: ${props => props.color || props.theme.colors.primary};
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xxxl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text};
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.textSecondary};
  margin-top: ${props => props.theme.spacing.sm};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.lg};

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background-color: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const ChartTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const ChartPlaceholder = styled.div`
  height: 200px;
  background-color: ${props => props.theme.colors.lightGray};
  border-radius: ${props => props.theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.md};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.textSecondary};
`;

const Reports = ({ apiService }) => {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalDevices: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      const [clients, devices, tasks] = await Promise.all([
        apiService.getStranke(),
        apiService.getOprema(),
        apiService.getNalogi()
      ]);

      const now = new Date();
      const completedTasks = tasks.filter(task => task.status === 'izveden').length;
      const pendingTasks = tasks.filter(task => task.status === 'načrtovan' || task.status === 'v_teku').length;
      const overdueTasks = tasks.filter(task => {
        const taskDate = new Date(task.datum_načrtovanega_vzdrževanja);
        return taskDate < now && task.status !== 'izveden';
      }).length;

      setStats({
        totalClients: clients.length,
        totalDevices: devices.length,
        totalTasks: tasks.length,
        completedTasks,
        pendingTasks,
        overdueTasks
      });

    } catch (error) {
      console.error('Napaka pri nalaganju podatkov za poročila:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Placeholder za export funkcionalnost
    alert('Export funkcionalnost bo dodana');
  };

  if (loading) {
    return (
      <ReportsContainer>
        <LoadingState>Nalaganje poročil...</LoadingState>
      </ReportsContainer>
    );
  }

  return (
    <ReportsContainer>
      <Header>
        <Title>Poročila in statistike</Title>
        <ExportButton onClick={handleExport}>
          <FaDownload />
          Izvozi poročilo
        </ExportButton>
      </Header>

      <StatsGrid>
        <StatCard color="#1976D2">
          <StatHeader>
            <StatIcon color="#1976D2">
              <FaUsers />
            </StatIcon>
            <StatValue>{stats.totalClients}</StatValue>
          </StatHeader>
          <StatLabel>Skupaj strank</StatLabel>
        </StatCard>

        <StatCard color="#4CAF50">
          <StatHeader>
            <StatIcon color="#4CAF50">
              <FaCogs />
            </StatIcon>
            <StatValue>{stats.totalDevices}</StatValue>
          </StatHeader>
          <StatLabel>Skupaj opreme</StatLabel>
        </StatCard>

        <StatCard color="#FF9800">
          <StatHeader>
            <StatIcon color="#FF9800">
              <FaWrench />
            </StatIcon>
            <StatValue>{stats.totalTasks}</StatValue>
          </StatHeader>
          <StatLabel>Skupaj nalogov</StatLabel>
        </StatCard>

        <StatCard color="#4CAF50">
          <StatHeader>
            <StatIcon color="#4CAF50">
              <FaWrench />
            </StatIcon>
            <StatValue>{stats.completedTasks}</StatValue>
          </StatHeader>
          <StatLabel>Izvedenih nalogov</StatLabel>
        </StatCard>

        <StatCard color="#2196F3">
          <StatHeader>
            <StatIcon color="#2196F3">
              <FaCalendarAlt />
            </StatIcon>
            <StatValue>{stats.pendingTasks}</StatValue>
          </StatHeader>
          <StatLabel>Čakajočih nalogov</StatLabel>
        </StatCard>

        <StatCard color="#F44336">
          <StatHeader>
            <StatIcon color="#F44336">
              <FaCalendarAlt />
            </StatIcon>
            <StatValue>{stats.overdueTasks}</StatValue>
          </StatHeader>
          <StatLabel>Zamujenih nalogov</StatLabel>
        </StatCard>
      </StatsGrid>

      <ChartsGrid>
        <ChartCard>
          <ChartTitle>
            <FaChartBar />
            Nalogi po statusu
          </ChartTitle>
          <ChartPlaceholder>
            Graf bo prikazan tukaj
          </ChartPlaceholder>
        </ChartCard>

        <ChartCard>
          <ChartTitle>
            <FaChartBar />
            Nalogi po mesecih
          </ChartTitle>
          <ChartPlaceholder>
            Graf bo prikazan tukaj
          </ChartPlaceholder>
        </ChartCard>

        <ChartCard>
          <ChartTitle>
            <FaChartBar />
            Oprema po tipih
          </ChartTitle>
          <ChartPlaceholder>
            Graf bo prikazan tukaj
          </ChartPlaceholder>
        </ChartCard>

        <ChartCard>
          <ChartTitle>
            <FaChartBar />
            Najbolj aktivne stranke
          </ChartTitle>
          <ChartPlaceholder>
            Graf bo prikazan tukaj
          </ChartPlaceholder>
        </ChartCard>
      </ChartsGrid>
    </ReportsContainer>
  );
};

export default Reports;
