import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';

const NotificationCard = ({type, message, dateTime}) => {
  const getIcon = () => {
    if (type === 'success') {
      return require('../assets/success-icon.png');
    } else if (type === 'error') {
      return require('../assets/error-icon.png');
    }
    return null;
  };

  const borderColor = type === 'success' ? '#4CAF50' : '#FF5252';

  return (
    <View style={styles.overlay}>
      <View style={[styles.card, {borderColor}]}>
        <Image source={getIcon()} style={styles.icon} />
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.dateTime}>{dateTime}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(217, 217, 217, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 20,
    width: 300,
  },
  icon: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  message: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
  },
  dateTime: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
});

export default NotificationCard;
