import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUsers, FaCogs, FaWrench, FaExclamationTriangle, FaCalendarAlt } from 'react-icons/fa';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
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

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${props => props.theme.spacing.lg};

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background-color: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const CardTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const TaskItem = styled.div`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.priority === 'visoka' ? props.theme.colors.error + '10' : 
    props.priority === 'srednja' ? props.theme.colors.warning + '10' : props.theme.colors.success + '10'};
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const TaskTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
`;

const TaskDate = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const TaskClient = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
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
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.textSecondary};
`;

const Dashboard = ({ apiService }) => {
  const [stats, setStats] = useState({
    stranke: 0,
    oprema: 0,
    nalogi: 0,
    opozorila: 0
  });
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load statistics
      const [stranke, oprema, nalogi] = await Promise.all([
        apiService.getStranke(),
        apiService.getOprema(),
        apiService.getNalogi()
      ]);

      setStats({
        stranke: stranke.length,
        oprema: oprema.length,
        nalogi: nalogi.length,
        opozorila: nalogi.filter(nalog => 
          new Date(nalog.datum_načrtovanega_vzdrževanja) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        ).length
      });

      // Load upcoming tasks (next 7 days)
      const upcoming = nalogi.filter(nalog => {
        const taskDate = new Date(nalog.datum_načrtovanega_vzdrževanja);
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return taskDate >= now && taskDate <= weekFromNow && nalog.status === 'načrtovan';
      }).slice(0, 5);

      setUpcomingTasks(upcoming);

      // Load recent tasks
      const recent = nalogi
        .sort((a, b) => new Date(b.datum_ustvarjanja) - new Date(a.datum_ustvarjanja))
        .slice(0, 5);

      setRecentTasks(recent);

    } catch (error) {
      console.error('Napaka pri nalaganju podatkov:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('sl-SI');
  };

  if (loading) {
    return (
      <DashboardContainer>
        <div>Nalaganje...</div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <StatsGrid>
        <StatCard color="#1976D2">
          <StatHeader>
            <StatIcon color="#1976D2">
              <FaUsers />
            </StatIcon>
            <StatValue>{stats.stranke}</StatValue>
          </StatHeader>
          <StatLabel>Skupaj strank</StatLabel>
        </StatCard>

        <StatCard color="#4CAF50">
          <StatHeader>
            <StatIcon color="#4CAF50">
              <FaCogs />
            </StatIcon>
            <StatValue>{stats.oprema}</StatValue>
          </StatHeader>
          <StatLabel>Skupaj opreme</StatLabel>
        </StatCard>

        <StatCard color="#FF9800">
          <StatHeader>
            <StatIcon color="#FF9800">
              <FaWrench />
            </StatIcon>
            <StatValue>{stats.nalogi}</StatValue>
          </StatHeader>
          <StatLabel>Skupaj nalogov</StatLabel>
        </StatCard>

        <StatCard color="#F44336">
          <StatHeader>
            <StatIcon color="#F44336">
              <FaExclamationTriangle />
            </StatIcon>
            <StatValue>{stats.opozorila}</StatValue>
          </StatHeader>
          <StatLabel>Opozorila (7 dni)</StatLabel>
        </StatCard>
      </StatsGrid>

      <ContentGrid>
        <Card>
          <CardTitle>
            <FaCalendarAlt />
            Prihajajoča vzdrževanja
          </CardTitle>
          <TaskList>
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map(task => (
                <TaskItem key={task.id} priority={task.prioriteta}>
                  <TaskHeader>
                    <TaskTitle>{task.naslov}</TaskTitle>
                    <PriorityBadge priority={task.prioriteta}>
                      {task.prioriteta}
                    </PriorityBadge>
                  </TaskHeader>
                  <TaskDate>
                    {formatDate(task.datum_načrtovanega_vzdrževanja)}
                  </TaskDate>
                  <TaskClient>
                    {task.ime} {task.priimek} - {task.tip_opreme}
                  </TaskClient>
                </TaskItem>
              ))
            ) : (
              <EmptyState>
                Ni prihajajočih vzdrževanj v naslednjih 7 dneh
              </EmptyState>
            )}
          </TaskList>
        </Card>

        <Card>
          <CardTitle>
            <FaWrench />
            Zadnji nalogi
          </CardTitle>
          <TaskList>
            {recentTasks.length > 0 ? (
              recentTasks.map(task => (
                <TaskItem key={task.id} priority={task.prioriteta}>
                  <TaskHeader>
                    <TaskTitle>{task.naslov}</TaskTitle>
                    <TaskDate>
                      {formatDate(task.datum_ustvarjanja)}
                    </TaskDate>
                  </TaskHeader>
                  <TaskClient>
                    {task.ime} {task.priimek}
                  </TaskClient>
                </TaskItem>
              ))
            ) : (
              <EmptyState>
                Ni nedavnih nalogov
              </EmptyState>
            )}
          </TaskList>
        </Card>
      </ContentGrid>
    </DashboardContainer>
  );
};

export default Dashboard;
