import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  ActivityIndicator,
  Searchbar,
  FAB,
} from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { ApiService } from '../services/ApiService';
import { StorageService } from '../services/StorageService';
import NetInfo from 'react-native-netinfo';

const TasksScreen = ({ navigation }) => {
  const theme = useTheme();
  const [apiService] = useState(new ApiService());
  const [storageService] = useState(new StorageService());
  
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    loadTasks();
    checkConnection();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchQuery]);

  const checkConnection = () => {
    NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      
      if (isConnected) {
        // Load online tasks
        const onlineTasks = await apiService.getNalogi();
        setTasks(onlineTasks);
      } else {
        // Load offline tasks
        const offlineTasks = await storageService.getOfflineTasks();
        setTasks(offlineTasks);
      }
    } catch (error) {
      console.error('Napaka pri nalaganju nalogov:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    if (!searchQuery) {
      setFilteredTasks(tasks);
      return;
    }

    const filtered = tasks.filter(task => {
      const query = searchQuery.toLowerCase();
      return (
        task.naslov?.toLowerCase().includes(query) ||
        task.opis?.toLowerCase().includes(query) ||
        task.ime?.toLowerCase().includes(query) ||
        task.priimek?.toLowerCase().includes(query)
      );
    });

    setFilteredTasks(filtered);
  };

  const handleTaskPress = (task) => {
    navigation.navigate('TaskDetail', { taskId: task.id, task });
  };

  const handleCreateTask = () => {
    navigation.navigate('CreateTask');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'izveden':
        return theme.colors.success;
      case 'v_teku':
        return theme.colors.warning;
      case 'načrtovan':
        return theme.colors.info;
      default:
        return theme.colors.gray;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'visoka':
        return theme.colors.error;
      case 'srednja':
        return theme.colors.warning;
      case 'nizka':
        return theme.colors.success;
      default:
        return theme.colors.gray;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Ni datuma';
    return new Date(dateString).toLocaleDateString('sl-SI');
  };

  const renderTask = ({ item: task }) => (
    <TouchableOpacity onPress={() => handleTaskPress(task)}>
      <Card style={styles.taskCard}>
        <Card.Content>
          <View style={styles.taskHeader}>
            <Title style={styles.taskTitle} numberOfLines={2}>
              {task.naslov}
            </Title>
            <View style={styles.chipContainer}>
              <Chip
                style={[styles.chip, { backgroundColor: getStatusColor(task.status) }]}
                textStyle={styles.chipText}
              >
                {task.status}
              </Chip>
              <Chip
                style={[styles.chip, { backgroundColor: getPriorityColor(task.prioriteta) }]}
                textStyle={styles.chipText}
              >
                {task.prioriteta}
              </Chip>
            </View>
          </View>

          {task.opis && (
            <Paragraph style={styles.taskDescription} numberOfLines={2}>
              {task.opis}
            </Paragraph>
          )}

          <View style={styles.taskInfo}>
            <Text style={styles.infoText}>
              Stranka: {task.ime} {task.priimek}
            </Text>
            <Text style={styles.infoText}>
              Datum: {formatDate(task.datum_načrtovanega_vzdrževanja)}
            </Text>
            {task.tip_opreme && (
              <Text style={styles.infoText}>
                Oprema: {task.tip_opreme}
              </Text>
            )}
          </View>

          {task.offline && (
            <Chip
              style={[styles.offlineChip, { backgroundColor: theme.colors.warning }]}
              textStyle={styles.chipText}
            >
              Offline
            </Chip>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Nalaganje nalogov...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Išči naloge..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      {filteredTasks.length > 0 ? (
        <FlatList
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery ? 'Ni nalogov, ki ustrezajo iskanju' : 'Ni nalogov'}
          </Text>
          <TouchableOpacity onPress={handleCreateTask}>
            <Text style={styles.createTaskText}>Ustvari prvi nalog</Text>
          </TouchableOpacity>
        </View>
      )}

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
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  taskCard: {
    marginBottom: 16,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    flex: 1,
    marginRight: 8,
    fontSize: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  chip: {
    height: 24,
  },
  chipText: {
    fontSize: 10,
    color: 'white',
  },
  taskDescription: {
    marginBottom: 8,
    color: '#757575',
  },
  taskInfo: {
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 2,
  },
  offlineChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 16,
  },
  createTaskText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default TasksScreen;
