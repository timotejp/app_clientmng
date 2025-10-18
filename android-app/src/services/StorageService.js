import AsyncStorage from 'react-native-async-storage';

export class StorageService {
  constructor() {
    this.keys = {
      SERVER_URL: 'server_url',
      OFFLINE_TASKS: 'offline_tasks',
      OFFLINE_IMAGES: 'offline_images',
      SETTINGS: 'settings'
    };
  }

  // Server URL
  async setServerUrl(url) {
    try {
      await AsyncStorage.setItem(this.keys.SERVER_URL, url);
    } catch (error) {
      console.error('Napaka pri shranjevanju URL strežnika:', error);
      throw error;
    }
  }

  async getServerUrl() {
    try {
      return await AsyncStorage.getItem(this.keys.SERVER_URL);
    } catch (error) {
      console.error('Napaka pri pridobivanju URL strežnika:', error);
      return null;
    }
  }

  // Offline tasks
  async saveOfflineTask(task) {
    try {
      const existingTasks = await this.getOfflineTasks();
      const updatedTasks = [...existingTasks, { ...task, id: Date.now(), offline: true }];
      await AsyncStorage.setItem(this.keys.OFFLINE_TASKS, JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Napaka pri shranjevanju offline naloga:', error);
      throw error;
    }
  }

  async getOfflineTasks() {
    try {
      const tasks = await AsyncStorage.getItem(this.keys.OFFLINE_TASKS);
      return tasks ? JSON.parse(tasks) : [];
    } catch (error) {
      console.error('Napaka pri pridobivanju offline nalogov:', error);
      return [];
    }
  }

  async clearOfflineTasks() {
    try {
      await AsyncStorage.removeItem(this.keys.OFFLINE_TASKS);
    } catch (error) {
      console.error('Napaka pri brisanju offline nalogov:', error);
      throw error;
    }
  }

  // Offline images
  async saveOfflineImage(taskId, imageUri) {
    try {
      const existingImages = await this.getOfflineImages();
      const taskImages = existingImages[taskId] || [];
      taskImages.push(imageUri);
      existingImages[taskId] = taskImages;
      await AsyncStorage.setItem(this.keys.OFFLINE_IMAGES, JSON.stringify(existingImages));
    } catch (error) {
      console.error('Napaka pri shranjevanju offline slike:', error);
      throw error;
    }
  }

  async getOfflineImages() {
    try {
      const images = await AsyncStorage.getItem(this.keys.OFFLINE_IMAGES);
      return images ? JSON.parse(images) : {};
    } catch (error) {
      console.error('Napaka pri pridobivanju offline slik:', error);
      return {};
    }
  }

  async clearOfflineImages(taskId) {
    try {
      const existingImages = await this.getOfflineImages();
      delete existingImages[taskId];
      await AsyncStorage.setItem(this.keys.OFFLINE_IMAGES, JSON.stringify(existingImages));
    } catch (error) {
      console.error('Napaka pri brisanju offline slik:', error);
      throw error;
    }
  }

  // Settings
  async saveSettings(settings) {
    try {
      await AsyncStorage.setItem(this.keys.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Napaka pri shranjevanju nastavitev:', error);
      throw error;
    }
  }

  async getSettings() {
    try {
      const settings = await AsyncStorage.getItem(this.keys.SETTINGS);
      return settings ? JSON.parse(settings) : {};
    } catch (error) {
      console.error('Napaka pri pridobivanju nastavitev:', error);
      return {};
    }
  }

  // Clear all data
  async clearAllData() {
    try {
      await AsyncStorage.multiRemove([
        this.keys.SERVER_URL,
        this.keys.OFFLINE_TASKS,
        this.keys.OFFLINE_IMAGES,
        this.keys.SETTINGS
      ]);
    } catch (error) {
      console.error('Napaka pri brisanju vseh podatkov:', error);
      throw error;
    }
  }
}
