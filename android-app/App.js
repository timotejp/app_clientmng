import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NetInfo from '@react-native-netinfo/netinfo';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import TasksScreen from './src/screens/TasksScreen';
import CreateTaskScreen from './src/screens/CreateTaskScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Services
import { ApiService } from './src/services/ApiService';
import { StorageService } from './src/services/StorageService';

// Theme
import { slovenianTheme } from './src/theme/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TaskStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="TasksList" 
      component={TasksScreen}
      options={{ title: 'Nalogi' }}
    />
    <Stack.Screen 
      name="CreateTask" 
      component={CreateTaskScreen}
      options={{ title: 'Nov nalog' }}
    />
    <Stack.Screen 
      name="TaskDetail" 
      component={TaskDetailScreen}
      options={{ title: 'Podrobnosti naloga' }}
    />
  </Stack.Navigator>
);

const App = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [apiService] = useState(new ApiService());
  const [storageService] = useState(new StorageService());

  useEffect(() => {
    // Initialize services
    initializeServices();
    
    // Monitor network connection
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  const initializeServices = async () => {
    try {
      // Load server URL from storage
      const serverUrl = await storageService.getServerUrl();
      if (serverUrl) {
        apiService.setBaseUrl(serverUrl);
      }
    } catch (error) {
      console.error('Napaka pri inicializaciji storitev:', error);
    }
  };

  return (
    <PaperProvider theme={slovenianTheme}>
      <StatusBar 
        backgroundColor={slovenianTheme.colors.primary} 
        barStyle="light-content" 
      />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = 'home';
              } else if (route.name === 'Tasks') {
                iconName = 'assignment';
              } else if (route.name === 'Settings') {
                iconName = 'settings';
              }

              return <Icon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: slovenianTheme.colors.primary,
            tabBarInactiveTintColor: slovenianTheme.colors.textSecondary,
            tabBarStyle: {
              backgroundColor: slovenianTheme.colors.white,
              borderTopColor: slovenianTheme.colors.border,
            },
            headerStyle: {
              backgroundColor: slovenianTheme.colors.primary,
            },
            headerTintColor: slovenianTheme.colors.white,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ 
              title: 'Domov',
              tabBarLabel: 'Domov'
            }}
          />
          <Tab.Screen 
            name="Tasks" 
            component={TaskStack}
            options={{ 
              title: 'Nalogi',
              tabBarLabel: 'Nalogi',
              headerShown: false
            }}
          />
          <Tab.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ 
              title: 'Nastavitve',
              tabBarLabel: 'Nastavitve'
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
