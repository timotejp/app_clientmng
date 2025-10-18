import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  FAB,
} from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { ApiService } from '../services/ApiService';
import { StorageService } from '../services/StorageService';
import NetInfo from 'react-native-netinfo';

const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const [apiService] = useState(new ApiService());
  const [storageService] = useState(new StorageService());
  
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    offlineTasks: 0
  });
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    checkConnection();
  }, []);

  const checkConnection = () => {
    NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load offline tasks
      const offlineTasks = await storageService.getOfflineTasks();
      
      if (isConnected) {
        // Load online data
        const [tasks] = await Promise.all([
          apiService.getNalogi()
        ]);
        
        const pendingTasks = tasks.filter(task => 
          task.status === 'načrtovan' || task.status === 'v_teku'
        ).length;
        
        const completedTasks = tasks.filter(task => 
          task.status === 'izveden'
        ).length;

        setStats({
          totalTasks: tasks.length,
          pendingTasks,
          completedTasks,
          offlineTasks: offlineTasks.length
        });
      } else {
        // Show only offline data
        setStats({
          totalTasks: offlineTasks.length,
          pendingTasks: offlineTasks.length,
          completedTasks: 0,
          offlineTasks: offlineTasks.length
        });
      }
    } catch (error) {
      console.error('Napaka pri nalaganju podatkov:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = () => {
    navigation.navigate('Tasks', { screen: 'CreateTask' });
  };

  const handleViewTasks = () => {
    navigation.navigate('Tasks');
  };

  const handleSync = async () => {
    if (!isConnected) {
      Alert.alert('Napaka', 'Ni internetne povezave');
      return;
    }

    try {
      const offlineTasks = await storageService.getOfflineTasks();
      
      for (const task of offlineTasks) {
        try {
          await apiService.createNalog(task);
        } catch (error) {
          console.error('Napaka pri sinhronizaciji naloga:', error);
        }
      }
      
      await storageService.clearOfflineTasks();
      await loadData();
      
      Alert.alert('Uspeh', 'Sinhronizacija je bila uspešna');
    } catch (error) {
      console.error('Napaka pri sinhronizaciji:', error);
      Alert.alert('Napaka', 'Napaka pri sinhronizaciji');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Nalaganje...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <Title>Dobrodošli v sistemu vzdrževanja</Title>
            <Paragraph>
              {isConnected ? 
                'Povezani ste s strežnikom' : 
                'Delujete v offline načinu'
              }
            </Paragraph>
          </Card.Content>
        </Card>

        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Title style={styles.statNumber}>{stats.totalTasks}</Title>
              <Paragraph>Skupaj nalogov</Paragraph>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Title style={styles.statNumber}>{stats.pendingTasks}</Title>
              <Paragraph>Čakajočih</Paragraph>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Title style={styles.statNumber}>{stats.completedTasks}</Title>
              <Paragraph>Izvedenih</Paragraph>
            </Card.Content>
          </Card>

          {stats.offlineTasks > 0 && (
            <Card style={[styles.statCard, { backgroundColor: theme.colors.warning + '20' }]}>
              <Card.Content>
                <Title style={styles.statNumber}>{stats.offlineTasks}</Title>
                <Paragraph>Offline nalogov</Paragraph>
              </Card.Content>
            </Card>
          )}
        </View>

        <Card style={styles.actionsCard}>
          <Card.Content>
            <Title>Hitri dostop</Title>
            
            <Button
              mode="contained"
              onPress={handleCreateTask}
              style={styles.actionButton}
              icon="plus"
            >
              Nov nalog
            </Button>

            <Button
              mode="outlined"
              onPress={handleViewTasks}
              style={styles.actionButton}
              icon="list"
            >
              Pregled nalogov
            </Button>

            {stats.offlineTasks > 0 && isConnected && (
              <Button
                mode="contained"
                onPress={handleSync}
                style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
                icon="sync"
              >
                Sinhroniziraj ({stats.offlineTasks})
              </Button>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Title>Informacije</Title>
            <Paragraph>
              • Ustvarite nove naloge tudi brez internetne povezave{'\n'}
              • Dodajte slike opreme ali problemov{'\n'}
              • Sinhronizirajte podatke, ko se povežete z internetom{'\n'}
              • Vse podatke so varno shranjene
            </Paragraph>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleCreateTask}
        label="Nov nalog"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  welcomeCard: {
    marginBottom: 16,
    elevation: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    elevation: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  actionsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  actionButton: {
    marginBottom: 8,
  },
  infoCard: {
    marginBottom: 16,
    elevation: 2,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen;
