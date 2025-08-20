import React, { useEffect, useState } from 'react';
import { View, Text, Button, TouchableOpacity, Image, ScrollView, Platform, Linking } from 'react-native';
import axios from 'axios';

const BACKEND = (process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000');

export default function HomePage() {
  const [portfolio, setPortfolio] = useState([]);
  const [catalogue, setCatalogue] = useState([]);
  const [contact, setContact] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [p, c, co] = await Promise.all([
        axios.get(`${BACKEND}/portfolio`),
        axios.get(`${BACKEND}/catalogue`),
        axios.get(`${BACKEND}/contact`)
      ]);
      setPortfolio(p.data);
      setCatalogue(c.data);
      setContact(co.data);
    } catch (e) {
      console.warn('Fetch failed', e.message);
    }
  }

  const contactWhatsApp = (serviceName) => {
    if (!contact) return;
    
    const phone = contact.whatsapp || contact.phone;
    const msg = encodeURIComponent(`Hello, I am interested in "${serviceName}". Please provide details/price.`);
    const url = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${msg}`;
    
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };

  const openMaps = () => {
    if (!contact) return;

    const url = contact.maps_url;
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };

  const openPortfolioItem = (item) => {
    const fullUrl = BACKEND + item.file_url;
    
    if (Platform.OS === 'web') {
      window.open(fullUrl, '_blank');
    } else {
      Linking.openURL(fullUrl);
    }
  };

  return (
    <ScrollView style={{ padding: 16, marginTop: Platform.OS === 'web' ? 24 : 0 }}>
      <Text style={{ 
        fontSize: Platform.OS === 'web' ? 28 : 24, 
        fontWeight: 'bold', 
        marginBottom: 12,
        textAlign: 'center'
      }}>
        Bhairaveshvara Welding Workshop
      </Text>
      
      {/* Contact Information */}
      <View style={{ 
        marginBottom: 20, 
        backgroundColor: '#f8f9fa', 
        padding: 16, 
        borderRadius: 12 
      }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
          📞 Contact Us
        </Text>
        {contact && (
          <View style={{ marginTop: 8 }}>
            <TouchableOpacity 
              onPress={() => Linking.openURL(`tel:${contact.phone}`)}
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                marginBottom: 8,
                padding: 8,
                backgroundColor: '#e3f2fd',
                borderRadius: 8
              }}
            >
              <Text style={{ fontSize: 16, marginLeft: 8 }}>📞 {contact.phone}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => Linking.openURL(contact.whatsapp)}
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                marginBottom: 8,
                padding: 8,
                backgroundColor: '#e8f5e8',
                borderRadius: 8
              }}
            >
              <Text style={{ fontSize: 16, marginLeft: 8 }}>💬 WhatsApp</Text>
            </TouchableOpacity>
            
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              marginBottom: 8,
              padding: 8,
              backgroundColor: '#fff3e0',
              borderRadius: 8
            }}>
              <Text style={{ fontSize: 16, marginLeft: 8 }}>📍 {contact.address}</Text>
            </View>
            
            <TouchableOpacity 
              onPress={openMaps}
              style={{ 
                backgroundColor: '#4285F4', 
                padding: 12, 
                borderRadius: 8, 
                marginTop: 8,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>🗺️ View on Google Maps</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Services Offered */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
          🔧 Services Offered
        </Text>
        {catalogue.map(item => (
          <View key={item.id} style={{ 
            paddingVertical: 16, 
            paddingHorizontal: 20, 
            backgroundColor: '#f8f9fa', 
            marginBottom: 12, 
            borderRadius: 12,
            borderLeftWidth: 4,
            borderLeftColor: '#007bff',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3
          }}>
            <Text style={{ fontWeight: '600', fontSize: 18, marginBottom: 8 }}>{item.name}</Text>
            <Text style={{ color: '#666', marginBottom: 12, lineHeight: 20 }}>{item.description}</Text>
            <TouchableOpacity 
              onPress={() => contactWhatsApp(item.name)}
              style={{
                backgroundColor: '#25D366',
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 8,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>💬 Enquire on WhatsApp</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Portfolio Gallery */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
          🖼️ Portfolio Gallery
        </Text>
        <View style={{ 
          flexDirection: Platform.OS === 'web' ? 'row' : 'column', 
          flexWrap: Platform.OS === 'web' ? 'wrap' : 'nowrap', 
          marginTop: 8 
        }}>
          {portfolio.map(item => (
            <TouchableOpacity 
              key={item.id} 
              onPress={() => openPortfolioItem(item)} 
              style={{ 
                width: Platform.OS === 'web' ? '48%' : '100%', 
                margin: Platform.OS === 'web' ? '1%' : '0 0 12 0',
                backgroundColor: '#f8f9fa',
                borderRadius: 12,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3
              }}
            >
              {item.file_type === 'image' ? (
                <Image 
                  source={{ uri: BACKEND + item.file_url }} 
                  style={{ 
                    width: '100%', 
                    height: Platform.OS === 'web' ? 150 : 200 
                  }} 
                  resizeMode="cover" 
                />
              ) : (
                <View style={{ 
                  width: '100%', 
                  height: Platform.OS === 'web' ? 150 : 200,
                  backgroundColor: '#e3f2fd',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Text style={{ fontSize: 48 }}>🎥</Text>
                  <Text style={{ color: '#666', marginTop: 8 }}>Video File</Text>
                </View>
              )}
              <View style={{ padding: 16 }}>
                <Text style={{ fontWeight: '600', marginBottom: 4, fontSize: 16 }}>{item.title}</Text>
                <Text style={{ color: '#666', fontSize: 14, lineHeight: 20 }}>{item.description}</Text>
                <Text style={{ 
                  color: '#007bff', 
                  fontSize: 12, 
                  marginTop: 8,
                  textAlign: 'center'
                }}>
                  Tap to view full size
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        {portfolio.length === 0 && (
          <View style={{ 
            backgroundColor: '#f8f9fa', 
            padding: 40, 
            borderRadius: 12, 
            alignItems: 'center' 
          }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>📷</Text>
            <Text style={{ textAlign: 'center', color: '#999', fontStyle: 'italic', fontSize: 16 }}>
              No portfolio items yet. Check back soon!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
