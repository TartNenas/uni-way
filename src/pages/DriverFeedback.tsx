import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert
} from 'react-native';

interface DriverFeedbackProps {
  driverName: string;
  carModel: string;
  plateNumber: string;
  driverRating: number;
  onSubmit: (rating: number, comment: string) => void;
  onCancel: () => void;
}

const DriverFeedback: React.FC<DriverFeedbackProps> = ({
  driverName,
  carModel,
  plateNumber,
  driverRating,
  onSubmit,
  onCancel
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (rating < 1) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    
    onSubmit(rating, comment);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Your Driver</Text>
        <View style={{width: 40}} />
      </View>

      <View style={styles.driverCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{driverName.charAt(0)}</Text>
        </View>
        
        <View style={styles.driverDetailsContainer}>
          <Text style={styles.driverName}>{driverName}</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingIcon}>⭐</Text>
              <Text style={styles.ratingText}>{driverRating}</Text>
            </View>
            <Text style={styles.carInfo}>{carModel} • {plateNumber}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How was your trip?</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              style={styles.starButton}
            >
              <Text style={[styles.star, star <= rating ? styles.starSelected : null]}>
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Your Comments</Text>
        <TextInput
          style={styles.commentInput}
          placeholder="Share your experience with this driver..."
          placeholderTextColor="#888"
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Submit Feedback</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 24,
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#3498db',
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  driverCard: {
    margin: 16,
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
  },
  driverDetailsContainer: {
    flex: 1,
  },
  driverName: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    fontSize: 16,
    marginRight: 4,
    color: '#FFD700',
  },
  ratingText: {
    color: '#fff',
    fontSize: 14,
  },
  carInfo: {
    color: '#aaa',
    fontSize: 14,
  },
  section: {
    margin: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  starButton: {
    padding: 8,
  },
  star: {
    fontSize: 44,
    color: '#444',
  },
  starSelected: {
    color: '#FFD700',
  },
  commentInput: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    textAlignVertical: 'top',
    minHeight: 120,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 16,
    marginTop: 30,
    marginBottom: 40,
  },
  cancelButton: {
    backgroundColor: '#2c3e50',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DriverFeedback; 