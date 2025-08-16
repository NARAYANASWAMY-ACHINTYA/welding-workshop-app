import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'admin':
        return <AdminPanel />;
      case 'home':
      default:
        return <HomePage />;
    }
  };

  return (
    <View style={styles.container}>
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <View style={styles.content}>
        {renderPage()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
});