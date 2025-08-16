import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, ScrollView, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

const BACKEND = (process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000');

export default function AdminPanel() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [file, setFile] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState('portfolio');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [portfolio, setPortfolio] = useState([]);
  const [catalogue, setCatalogue] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  async function fetchData() {
    try {
      const [p, c] = await Promise.all([
        axios.get(`${BACKEND}/portfolio`),
        axios.get(`${BACKEND}/catalogue`)
      ]);
      setPortfolio(p.data);
      setCatalogue(c.data);
    } catch (e) {
      console.warn('Fetch failed', e.message);
    }
  }

  // Request permissions for mobile
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload files.');
        return false;
      }
    }
    return true;
  };

  // Mobile file picker
  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setFile({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type === 'video' ? 'video' : 'image',
          size: asset.fileSize || 0
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image/video');
    }
  };

  // Web file picker (fallback)
  const webPickFile = (evt) => {
    const f = evt?.target?.files?.[0];
    if (f) {
      setFile({
        uri: URL.createObjectURL(f),
        name: f.name,
        type: f.type,
        size: f.size,
        file: f // Keep original file for web
      });
    }
  };

  const authenticate = () => {
    if (username === 'admin' && password === 'changeme') {
      setIsAuthenticated(true);
      Alert.alert('Success', 'Authentication successful!');
    } else {
      Alert.alert('Error', 'Invalid credentials');
    }
  };

  const upload = async () => {
    if (!title || !file) {
      Alert.alert('Error', 'Please provide title and file');
      return;
    }

    try {
      let formData;
      
      if (Platform.OS === 'web' && file.file) {
        // Web upload
        formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        formData.append('title', title);
        formData.append('description', desc);
        formData.append('category', category);
        formData.append('file', file.file);
      } else {
        // Mobile upload - convert file to blob
        const response = await fetch(file.uri);
        const blob = await response.blob();
        
        formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        formData.append('title', title);
        formData.append('description', desc);
        formData.append('category', category);
        formData.append('file', blob, file.name);
      }

      const res = await axios.post(`${BACKEND}/admin/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      Alert.alert('Success', 'File uploaded successfully!');
      setTitle('');
      setDesc('');
      setFile(null);
      fetchData();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Upload failed: ' + (e.response?.data?.detail || e.message));
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setTitle('');
    setDesc('');
    setFile(null);
    setCategory('portfolio');
  };

  if (!isAuthenticated) {
    return (
      <ScrollView style={{ padding: 16, marginTop: 24 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' }}>
          Admin Panel
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 20, textAlign: 'center', color: '#666' }}>
          Please authenticate to access the admin panel
        </Text>
        
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '600', marginBottom: 8 }}>Username:</Text>
          <TextInput
            placeholder="Admin username"
            value={username}
            onChangeText={setUsername}
            style={{ 
              borderWidth: 1, 
              borderColor: '#ddd',
              padding: 12, 
              borderRadius: 8,
              fontSize: 16
            }}
          />
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontWeight: '600', marginBottom: 8 }}>Password:</Text>
          <TextInput
            placeholder="Admin password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{ 
              borderWidth: 1, 
              borderColor: '#ddd',
              padding: 12, 
              borderRadius: 8,
              fontSize: 16
            }}
          />
        </View>

        <Button 
          title="🔐 Login" 
          onPress={authenticate}
          color="#007bff"
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ padding: 16, marginTop: 24 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold' }}>Admin Panel</Text>
        <Button title="🚪 Logout" onPress={logout} color="#dc3545" />
      </View>

      {/* Upload Form */}
      <View style={{ 
        backgroundColor: '#f8f9fa', 
        padding: 20, 
        borderRadius: 12, 
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#e9ecef'
      }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Upload New Content</Text>
        
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '600', marginBottom: 8 }}>Category:</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button 
              title="Portfolio" 
              onPress={() => setCategory('portfolio')}
              color={category === 'portfolio' ? '#28a745' : '#6c757d'}
            />
            <Button 
              title="Catalogue" 
              onPress={() => setCategory('catalogue')}
              color={category === 'catalogue' ? '#28a745' : '#6c757d'}
            />
          </View>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '600', marginBottom: 8 }}>Title:</Text>
          <TextInput
            placeholder="Enter title"
            value={title}
            onChangeText={setTitle}
            style={{ 
              borderWidth: 1, 
              borderColor: '#ddd',
              padding: 12, 
              borderRadius: 8,
              fontSize: 16
            }}
          />
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '600', marginBottom: 8 }}>Description:</Text>
          <TextInput
            placeholder="Enter description (optional)"
            value={desc}
            onChangeText={setDesc}
            multiline
            numberOfLines={3}
            style={{ 
              borderWidth: 1, 
              borderColor: '#ddd',
              padding: 12, 
              borderRadius: 8,
              fontSize: 16,
              textAlignVertical: 'top'
            }}
          />
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontWeight: '600', marginBottom: 8 }}>File (Image/Video):</Text>
          
          {/* Mobile File Picker */}
          {Platform.OS !== 'web' && (
            <Button 
              title="📱 Pick Image/Video" 
              onPress={pickImage}
              color="#007bff"
              style={{ marginBottom: 8 }}
            />
          )}
          
          {/* Web File Picker */}
          {Platform.OS === 'web' && (
            <input 
              type="file" 
              accept="image/*,video/*" 
              onChange={webPickFile} 
              style={{ 
                marginBottom: 8,
                padding: '8px 0'
              }} 
            />
          )}
          
          {file && (
            <View style={{ 
              backgroundColor: '#e8f5e8', 
              padding: 12, 
              borderRadius: 8, 
              marginTop: 8 
            }}>
              <Text style={{ color: '#28a745', fontWeight: '600' }}>
                ✓ File selected: {file.name}
              </Text>
              <Text style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
                Type: {file.type} | Size: {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Unknown'}
              </Text>
            </View>
          )}
        </View>

        <Button 
          title="📤 Upload Content" 
          onPress={upload}
          color="#28a745"
        />
      </View>

      {/* Content Overview */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Content Overview</Text>
        
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '600', marginBottom: 8 }}>Portfolio Items: {portfolio.length}</Text>
          <Text style={{ color: '#666' }}>Total showcase items uploaded</Text>
        </View>
        
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '600', marginBottom: 8 }}>Catalogue Services: {catalogue.length}</Text>
          <Text style={{ color: '#666' }}>Total services available</Text>
        </View>
      </View>

      {/* Recent Portfolio Items */}
      {portfolio.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Recent Portfolio Items</Text>
          {portfolio.slice(0, 3).map(item => (
            <View key={item.id} style={{ 
              padding: 12, 
              backgroundColor: '#f8f9fa', 
              marginBottom: 8, 
              borderRadius: 8,
              borderLeftWidth: 3,
              borderLeftColor: '#007bff'
            }}>
              <Text style={{ fontWeight: '600' }}>{item.title}</Text>
              <Text style={{ color: '#666', fontSize: 12 }}>{item.description}</Text>
              <Text style={{ color: '#007bff', fontSize: 12, marginTop: 4 }}>
                Type: {item.file_type} | Category: {item.category}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
