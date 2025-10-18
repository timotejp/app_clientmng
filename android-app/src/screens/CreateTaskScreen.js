import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  Text,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Chip,
  ActivityIndicator,
  FAB,
} from 'react-native-paper';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import DatePicker from 'react-native-date-picker';
import { useTheme } from 'react-native-paper';
import { ApiService } from '../services/ApiService';
import { StorageService } from '../services/StorageService';
import NetInfo from 'react-native-netinfo';

const CreateTaskScreen = ({ navigation }) => {
  const theme = useTheme();
  const [apiService] = useState(new ApiService());
  const [storageService] = useState(new StorageService());
  
  const [formData, setFormData] = useState({
    stranka_id: '',
    oprema_id: '',
    naslov: '',
    opis: '',
    datum_načrtovanega_vzdrževanja: new Date(),
    prioriteta: 'srednja',
    rezervni_deli: '',
    opombe: ''
  });
  
  const [stranke, setStranke] = useState([]);
  const [oprema, setOprema] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

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
      const [strankeData, opremaData] = await Promise.all([
        apiService.getStranke(),
        apiService.getOprema()
      ]);
      setStranke(strankeData);
      setOprema(opremaData);
    } catch (error) {
      console.error('Napaka pri nalaganju podatkov:', error);
      Alert.alert('Napaka', 'Napaka pri nalaganju podatkov');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImagePicker = () => {
    Alert.alert(
      'Dodaj sliko',
      'Izberite način dodajanja slike',
      [
        { text: 'Prekliči', style: 'cancel' },
        { text: 'Kamera', onPress: () => openCamera() },
        { text: 'Galerija', onPress: () => openImageLibrary() }
      ]
    );
  };

  const openCamera = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchCamera(options, (response) => {
      if (response.assets && response.assets[0]) {
        setImages(prev => [...prev, response.assets[0]]);
      }
    });
  };

  const openImageLibrary = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
      selectionLimit: 5 - images.length,
    };

    launchImageLibrary(options, (response) => {
      if (response.assets) {
        setImages(prev => [...prev, ...response.assets]);
      }
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.naslov.trim()) {
      Alert.alert('Napaka', 'Naslov naloga je obvezen');
      return false;
    }
    if (!formData.stranka_id) {
      Alert.alert('Napaka', 'Izberite stranko');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isConnected) {
        // Online mode - save to server
        const result = await apiService.createNalog(formData);
        
        if (images.length > 0) {
          await apiService.uploadSlike(result.id, images);
        }
        
        Alert.alert('Uspeh', 'Nalog je bil uspešno ustvarjen', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        // Offline mode - save locally
        await storageService.saveOfflineTask(formData);
        
        if (images.length > 0) {
          for (const image of images) {
            await storageService.saveOfflineImage(Date.now(), image.uri);
          }
        }
        
        Alert.alert('Uspeh', 'Nalog je bil shranjen offline in bo sinhroniziran, ko se povežete z internetom', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Napaka pri shranjevanju naloga:', error);
      Alert.alert('Napaka', 'Napaka pri shranjevanju naloga');
    } finally {
      setLoading(false);
    }
  };

  const filteredOprema = oprema.filter(item => item.stranka_id === formData.stranka_id);

  if (loading && stranke.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Nalaganje podatkov...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Osnovni podatki</Title>
            
            <TextInput
              label="Naslov naloga *"
              value={formData.naslov}
              onChangeText={(text) => handleInputChange('naslov', text)}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Opis"
              value={formData.opis}
              onChangeText={(text) => handleInputChange('opis', text)}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                Načrtovani datum: {formData.datum_načrtovanega_vzdrževanja.toLocaleDateString('sl-SI')}
              </Text>
            </TouchableOpacity>

            <View style={styles.priorityContainer}>
              <Text style={styles.priorityLabel}>Prioriteta:</Text>
              <View style={styles.priorityChips}>
                {['nizka', 'srednja', 'visoka'].map((priority) => (
                  <Chip
                    key={priority}
                    selected={formData.prioriteta === priority}
                    onPress={() => handleInputChange('prioriteta', priority)}
                    style={styles.priorityChip}
                  >
                    {priority}
                  </Chip>
                ))}
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Stranka in oprema</Title>
            
            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownLabel}>Stranka *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipContainer}>
                  {stranke.map((stranka) => (
                    <Chip
                      key={stranka.id}
                      selected={formData.stranka_id === stranka.id}
                      onPress={() => {
                        handleInputChange('stranka_id', stranka.id);
                        handleInputChange('oprema_id', ''); // Reset oprema selection
                      }}
                      style={styles.chip}
                    >
                      {stranka.ime} {stranka.priimek}
                    </Chip>
                  ))}
                </View>
              </ScrollView>
            </View>

            {formData.stranka_id && (
              <View style={styles.dropdownContainer}>
                <Text style={styles.dropdownLabel}>Oprema</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipContainer}>
                    {filteredOprema.map((item) => (
                      <Chip
                        key={item.id}
                        selected={formData.oprema_id === item.id}
                        onPress={() => handleInputChange('oprema_id', item.id)}
                        style={styles.chip}
                      >
                        {item.tip_opreme} - {item.znamka}
                      </Chip>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Dodatne informacije</Title>
            
            <TextInput
              label="Rezervni deli"
              value={formData.rezervni_deli}
              onChangeText={(text) => handleInputChange('rezervni_deli', text)}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={2}
            />

            <TextInput
              label="Opombe"
              value={formData.opombe}
              onChangeText={(text) => handleInputChange('opombe', text)}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Slike</Title>
            <Paragraph>Dodajte slike opreme ali problema</Paragraph>
            
            <View style={styles.imagesContainer}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri: image.uri }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {images.length < 5 && (
              <Button
                mode="outlined"
                onPress={handleImagePicker}
                style={styles.addImageButton}
                icon="camera"
              >
                Dodaj sliko ({images.length}/5)
              </Button>
            )}
          </Card.Content>
        </Card>

        <View style={styles.submitContainer}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
          >
            {isConnected ? 'Ustvari nalog' : 'Shrani offline'}
          </Button>
        </View>
      </ScrollView>

      <DatePicker
        modal
        open={showDatePicker}
        date={formData.datum_načrtovanega_vzdrževanja}
        mode="date"
        onConfirm={(date) => {
          setShowDatePicker(false);
          handleInputChange('datum_načrtovanega_vzdrževanja', date);
        }}
        onCancel={() => {
          setShowDatePicker(false);
        }}
        title="Izberite datum vzdrževanja"
        confirmText="Potrdi"
        cancelText="Prekliči"
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
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  input: {
    marginBottom: 16,
  },
  dateButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#212121',
  },
  priorityContainer: {
    marginBottom: 16,
  },
  priorityLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#212121',
  },
  priorityChips: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityChip: {
    marginRight: 8,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#212121',
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    marginRight: 8,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#F44336',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addImageButton: {
    marginTop: 8,
  },
  submitContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  submitButton: {
    paddingVertical: 8,
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
});

export default CreateTaskScreen;
