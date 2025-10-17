import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { slovenianTheme } from './theme/theme';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Devices from './pages/Devices';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { ApiService } from './services/api';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    overflow: hidden;
  }

  button {
    font-family: inherit;
  }

  input, select, textarea {
    font-family: inherit;
  }
`;

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: ${props => props.theme.colors.background};
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: ${props => props.theme.colors.contentBackground};
`;

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [apiService] = useState(new ApiService());

  useEffect(() => {
    // Initialize API service with server URL
    const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';
    apiService.setBaseUrl(serverUrl);
  }, [apiService]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <ThemeProvider theme={slovenianTheme}>
      <GlobalStyle />
      <Router>
        <AppContainer>
          <Sidebar 
            collapsed={sidebarCollapsed} 
            onPageChange={handlePageChange}
            currentPage={currentPage}
          />
          <MainContent>
            <Header 
              onToggleSidebar={toggleSidebar}
              currentPage={currentPage}
            />
            <ContentArea>
              <Routes>
                <Route path="/" element={<Dashboard apiService={apiService} />} />
                <Route path="/stranke" element={<Clients apiService={apiService} />} />
                <Route path="/oprema" element={<Devices apiService={apiService} />} />
                <Route path="/vzdrzevanje" element={<Maintenance apiService={apiService} />} />
                <Route path="/porocila" element={<Reports apiService={apiService} />} />
                <Route path="/nastavitve" element={<Settings apiService={apiService} />} />
              </Routes>
            </ContentArea>
          </MainContent>
        </AppContainer>
      </Router>
    </ThemeProvider>
  );
}

export default App;
