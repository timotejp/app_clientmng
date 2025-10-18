import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  Button,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { ApiService } from '../services/ApiService';
import { StorageService } from '../services/StorageService';

const TaskDetailScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const [apiService] = useState(new ApiService());
  const [storageService] = useState(new StorageService());
  
  const { taskId, task: initialTask } = route.params;
  const [task, setTask] = useState(initialTask);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(!initialTask);

  useEffect(() => {
    if (!initialTask) {
      loadTaskDetails();
    }
    loadImages();
  }, []);

  const loadTaskDetails = async () => {
    try {
      setLoading(true);
      // This would load task details from API
      // For now, we'll use the initial task data
    } catch (error) {
      console.error('Napaka pri nalaganju podrobnosti naloga:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadImages = async () => {
    try {
      if (taskId) {
        const taskImages = await apiService.getSlike(taskId);
        setImages(taskImages);
      }
    } catch (error) {
      console.error('Napaka pri nalaganju slik:', error);
    }
  };

  const handleEditTask = () => {
    navigation.navigate('CreateTask', { taskId, task });
  };

  const handleDeleteTask = () => {
    Alert.alert(
      'Izbriši nalog',
      'Ali ste prepričani, da želite izbrisati ta nalog?',
      [
        { text: 'Prekliči', style: 'cancel' },
        { text: 'Izbriši', style: 'destructive', onPress: confirmDelete }
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      if (task.offline) {
        // Delete offline task
        const offlineTasks = await storageService.getOfflineTasks();
        const updatedTasks = offlineTasks.filter(t => t.id !== task.id);
        await storageService.clearOfflineTasks();
        for (const t of updatedTasks) {
          await storageService.saveOfflineTask(t);
        }
      } else {
        // Delete online task
        await apiService.deleteNalog(task.id);
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Napaka pri brisanju naloga:', error);
      Alert.alert('Napaka', 'Napaka pri brisanju naloga');
    }
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Nalaganje podrobnosti...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Title style={styles.taskTitle}>{task.naslov}</Title>
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
            <Paragraph style={styles.description}>
              {task.opis}
            </Paragraph>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Title>Podatki o nalogu</Title>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Stranka:</Text>
            <Text style={styles.infoValue}>{task.ime} {task.priimek}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Oprema:</Text>
            <Text style={styles.infoValue}>
              {task.tip_opreme} - {task.znamka} {task.model}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Načrtovani datum:</Text>
            <Text style={styles.infoValue}>
              {formatDate(task.datum_načrtovanega_vzdrževanja)}
            </Text>
          </View>

          {task.datum_izvedbe && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Datum izvedbe:</Text>
              <Text style={styles.infoValue}>
                {formatDate(task.datum_izvedbe)}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ustvarjen:</Text>
            <Text style={styles.infoValue}>
              {formatDate(task.datum_ustvarjanja)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {task.rezervni_deli && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <Title>Rezervni deli</Title>
            <Paragraph>{task.rezervni_deli}</Paragraph>
          </Card.Content>
        </Card>
      )}

      {task.opombe && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <Title>Opombe</Title>
            <Paragraph>{task.opombe}</Paragraph>
          </Card.Content>
        </Card>
      )}

      {images.length > 0 && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <Title>Slike</Title>
            <View style={styles.imagesContainer}>
              {images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image.pot }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          onPress={handleEditTask}
          style={styles.actionButton}
          icon="pencil"
        >
          Uredi nalog
        </Button>

        <Button
          mode="outlined"
          onPress={handleDeleteTask}
          style={[styles.actionButton, { borderColor: theme.colors.error }]}
          textColor={theme.colors.error}
          icon="delete"
        >
          Izbriši nalog
        </Button>
      </View>
    </ScrollView>
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
  headerCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    flex: 1,
    marginRight: 8,
    fontSize: 20,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  chip: {
    height: 28,
  },
  chipText: {
    fontSize: 12,
    color: 'white',
  },
  description: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 24,
  },
  infoCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#757575',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#212121',
    flex: 2,
    textAlign: 'right',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  actionsContainer: {
    padding: 16,
    gap: 8,
  },
  actionButton: {
    marginBottom: 8,
  },
});

export default TaskDetailScreen;
