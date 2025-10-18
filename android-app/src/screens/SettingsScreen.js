import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  TextInput,
  Button,
  Switch,
  List,
  Divider,
} from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { StorageService } from '../services/StorageService';
import NetInfo from 'react-native-netinfo';

const SettingsScreen = () => {
  const theme = useTheme();
  const [storageService] = useState(new StorageService());
  
  const [settings, setSettings] = useState({
    serverUrl: 'http://localhost:3001',
    autoSync: true,
    notifications: true,
    theme: 'light'
  });
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    checkConnection();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await storageService.getSettings();
      if (savedSettings && Object.keys(savedSettings).length > 0) {
        setSettings(prev => ({ ...prev, ...savedSettings }));
      }
    } catch (error) {
      console.error('Napaka pri nalaganju nastavitev:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await storageService.saveSettings(settings);
      Alert.alert('Uspeh', 'Nastavitve so bile shranjene');
    } catch (error) {
      console.error('Napaka pri shranjevanju nastavitev:', error);
      Alert.alert('Napaka', 'Napaka pri shranjevanju nastavitev');
    }
  };

  const checkConnection = () => {
    NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
  };

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${settings.serverUrl}/api/health`);
      if (response.ok) {
        Alert.alert('Uspeh', 'Povezava s strežnikom je uspešna!');
        setIsConnected(true);
      } else {
        Alert.alert('Napaka', 'Napaka pri povezavi s strežnikom');
        setIsConnected(false);
      }
    } catch (error) {
      Alert.alert('Napaka', 'Napaka pri povezavi s strežnikom');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearCache = () => {
    Alert.alert(
      'Počisti predpomnilnik',
      'Ali ste prepričani, da želite počistiti predpomnilnik? To bo izbrisalo vse offline podatke.',
      [
        { text: 'Prekliči', style: 'cancel' },
        { text: 'Počisti', style: 'destructive', onPress: confirmClearCache }
      ]
    );
  };

  const confirmClearCache = async () => {
    try {
      await storageService.clearAllData();
      Alert.alert('Uspeh', 'Predpomnilnik je bil počiščen');
    } catch (error) {
      console.error('Napaka pri čiščenju predpomnilnika:', error);
      Alert.alert('Napaka', 'Napaka pri čiščenju predpomnilnika');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Povezava s strežnikom</Title>
          
          <View style={styles.connectionStatus}>
            <Text style={[
              styles.statusText,
              { color: isConnected ? theme.colors.success : theme.colors.error }
            ]}>
              {isConnected ? 'Povezan' : 'Ni povezave'}
            </Text>
          </View>

          <TextInput
            label="URL strežnika"
            value={settings.serverUrl}
            onChangeText={(text) => handleInputChange('serverUrl', text)}
            style={styles.input}
            mode="outlined"
            placeholder="http://your-server:3001"
          />

          <Button
            mode="outlined"
            onPress={handleTestConnection}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Testiraj povezavo
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Sinhronizacija</Title>
          
          <List.Item
            title="Avtomatska sinhronizacija"
            description="Sinhroniziraj podatke ob povezavi z internetom"
            right={() => (
              <Switch
                value={settings.autoSync}
                onValueChange={(value) => handleInputChange('autoSync', value)}
              />
            )}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Obvestila</Title>
          
          <List.Item
            title="Omogoči obvestila"
            description="Prejmi obvestila za nove naloge in opomnike"
            right={() => (
              <Switch
                value={settings.notifications}
                onValueChange={(value) => handleInputChange('notifications', value)}
              />
            )}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Podatki</Title>
          
          <List.Item
            title="Počisti predpomnilnik"
            description="Izbriši vse offline podatke"
            onPress={clearCache}
            right={() => <List.Icon icon="delete" />}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Informacije o aplikaciji</Title>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Verzija:</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Razvijalec:</Text>
            <Text style={styles.infoValue}>Maintenance Manager</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Licenca:</Text>
            <Text style={styles.infoValue}>MIT</Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.saveContainer}>
        <Button
          mode="contained"
          onPress={saveSettings}
          style={styles.saveButton}
        >
          Shrani nastavitve
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
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  connectionStatus: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#757575',
  },
  infoValue: {
    fontSize: 14,
    color: '#212121',
  },
  saveContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  saveButton: {
    paddingVertical: 8,
  },
});

export default SettingsScreen;
