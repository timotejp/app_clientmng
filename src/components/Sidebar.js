import React from 'react';
import styled from 'styled-components';
import { 
  FaHome, 
  FaUsers, 
  FaCogs, 
  FaWrench, 
  FaChartBar, 
  FaCog,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

const SidebarContainer = styled.div`
  width: ${props => props.collapsed ? '60px' : '250px'};
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: ${props => props.theme.shadows.md};
  z-index: 1000;
`;

const SidebarHeader = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.primaryDark};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  white-space: nowrap;
  overflow: hidden;
`;

const LogoIcon = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
  margin-right: ${props => props.collapsed ? '0' : props.theme.spacing.sm};
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.white};
  cursor: pointer;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.primaryDark};
  }
`;

const Navigation = styled.nav`
  flex: 1;
  padding: ${props => props.theme.spacing.md} 0;
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  cursor: pointer;
  transition: background-color 0.2s ease;
  background-color: ${props => props.active ? props.theme.colors.primaryDark : 'transparent'};
  border-left: ${props => props.active ? `3px solid ${props.theme.colors.white}` : '3px solid transparent'};

  &:hover {
    background-color: ${props => props.theme.colors.primaryDark};
  }
`;

const NavIcon = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  margin-right: ${props => props.collapsed ? '0' : props.theme.spacing.md};
  min-width: 20px;
  display: flex;
  justify-content: center;
`;

const NavText = styled.span`
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  white-space: nowrap;
  overflow: hidden;
  opacity: ${props => props.collapsed ? '0' : '1'};
  transition: opacity 0.3s ease;
`;

const SidebarFooter = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.primaryDark};
  font-size: ${props => props.theme.typography.fontSize.sm};
  text-align: center;
  opacity: 0.8;
`;

const menuItems = [
  { id: 'dashboard', label: 'Nadzorna plošča', icon: FaHome },
  { id: 'stranke', label: 'Stranke', icon: FaUsers },
  { id: 'oprema', label: 'Oprema', icon: FaCogs },
  { id: 'vzdrzevanje', label: 'Vzdrževanje', icon: FaWrench },
  { id: 'porocila', label: 'Poročila', icon: FaChartBar },
  { id: 'nastavitve', label: 'Nastavitve', icon: FaCog }
];

const Sidebar = ({ collapsed, onPageChange, currentPage }) => {
  return (
    <SidebarContainer collapsed={collapsed}>
      <SidebarHeader>
        <Logo>
          <LogoIcon>🔧</LogoIcon>
          {!collapsed && <span>Vzdrževanje</span>}
        </Logo>
      </SidebarHeader>
      
      <Navigation>
        {menuItems.map(item => {
          const IconComponent = item.icon;
          return (
            <NavItem
              key={item.id}
              active={currentPage === item.id}
              onClick={() => onPageChange(item.id)}
            >
              <NavIcon>
                <IconComponent />
              </NavIcon>
              <NavText collapsed={collapsed}>
                {item.label}
              </NavText>
            </NavItem>
          );
        })}
      </Navigation>
      
      <SidebarFooter>
        {!collapsed && 'Sistem za upravljanje vzdrževanja v1.0'}
      </SidebarFooter>
    </SidebarContainer>
  );
};

export default Sidebar;
