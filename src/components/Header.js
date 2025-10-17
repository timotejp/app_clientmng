import React, { useState, useEffect } from 'styled-components';
import styled from 'styled-components';
import { FaBars, FaBell, FaSync, FaWifi, FaWifiSlash } from 'react-icons/fa';

const HeaderContainer = styled.header`
  background-color: ${props => props.theme.colors.white};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  padding: 0 ${props => props.theme.spacing.lg};
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: ${props => props.theme.shadows.sm};
  z-index: 100;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  margin-right: ${props => props.theme.spacing.md};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.lightGray};
  }
`;

const PageTitle = styled.h1`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
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
`;

const SyncButton = styled.button`
  background: none;
  border: none;
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.lightGray};
    transform: rotate(180deg);
  }
`;

const NotificationButton = styled.button`
  background: none;
  border: none;
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  position: relative;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.lightGray};
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 2px;
  right: 2px;
  background-color: ${props => props.theme.colors.error};
  color: ${props => props.theme.colors.white};
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const pageTitles = {
  dashboard: 'Nadzorna plošča',
  stranke: 'Stranke',
  oprema: 'Oprema',
  vzdrzevanje: 'Vzdrževanje',
  porocila: 'Poročila',
  nastavitve: 'Nastavitve'
};

const Header = ({ onToggleSidebar, currentPage }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    // Check server connection status
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/health');
        setIsConnected(response.ok);
      } catch (error) {
        setIsConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSync = () => {
    // Trigger synchronization with Android app
    console.log('Sinhronizacija z Android aplikacijo...');
  };

  const handleNotifications = () => {
    // Show notifications panel
    console.log('Prikaz obvestil...');
  };

  return (
    <HeaderContainer>
      <LeftSection>
        <MenuButton onClick={onToggleSidebar}>
          <FaBars />
        </MenuButton>
        <PageTitle>{pageTitles[currentPage] || 'Sistem za upravljanje vzdrževanja'}</PageTitle>
      </LeftSection>

      <RightSection>
        <StatusIndicator connected={isConnected}>
          {isConnected ? <FaWifi /> : <FaWifiSlash />}
          {isConnected ? 'Povezan' : 'Ni povezave'}
        </StatusIndicator>

        <SyncButton onClick={handleSync} title="Sinhroniziraj z Android">
          <FaSync />
        </SyncButton>

        <NotificationButton onClick={handleNotifications} title="Obvestila">
          <FaBell />
          {notificationCount > 0 && (
            <NotificationBadge>{notificationCount}</NotificationBadge>
          )}
        </NotificationButton>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;
