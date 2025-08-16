import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';

export default function Navigation({ currentPage, onPageChange }) {
  return (
    <View style={styles.navbar}>
      <View style={styles.navContainer}>
        <Text style={styles.brand}>🏭 Welding Workshop</Text>
        <View style={styles.navLinks}>
          <TouchableOpacity 
            style={[styles.navLink, currentPage === 'home' && styles.activeNavLink]} 
            onPress={() => onPageChange('home')}
          >
            <Text style={[styles.navText, currentPage === 'home' && styles.activeNavText]}>
              {Platform.OS === 'web' ? '🏠 Home' : '🏠'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navLink, currentPage === 'admin' && styles.activeNavLink]} 
            onPress={() => onPageChange('admin')}
          >
            <Text style={[styles.navText, currentPage === 'admin' && styles.activeNavText]}>
              {Platform.OS === 'web' ? '⚙️ Admin' : '⚙️'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    backgroundColor: '#2c3e50',
    paddingVertical: Platform.OS === 'web' ? 12 : 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  brand: {
    color: 'white',
    fontSize: Platform.OS === 'web' ? 20 : 18,
    fontWeight: 'bold',
  },
  navLinks: {
    flexDirection: 'row',
    gap: Platform.OS === 'web' ? 16 : 20,
  },
  navLink: {
    paddingVertical: Platform.OS === 'web' ? 8 : 12,
    paddingHorizontal: Platform.OS === 'web' ? 16 : 20,
    borderRadius: 6,
    backgroundColor: 'transparent',
    minWidth: Platform.OS === 'web' ? 'auto' : 50,
    alignItems: 'center',
  },
  activeNavLink: {
    backgroundColor: '#3498db',
  },
  navText: {
    color: '#bdc3c7',
    fontSize: Platform.OS === 'web' ? 16 : 18,
    fontWeight: '500',
  },
  activeNavText: {
    color: 'white',
  },
});
