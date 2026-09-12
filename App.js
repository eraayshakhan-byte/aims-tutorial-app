import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, Alert, SafeAreaView 
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

// 1. ALL CLASSES (1 to 12)
const ALL_CLASSES = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12 IP', 'Class 12 CS'
];

// SUBJECT MAPPER
const GET_SUBJECTS = (cls) => {
  if (['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'].includes(cls)) {
    return ['English', 'Hindi', 'Maths', 'EVS', 'Computer', 'English Grammar', 'Hindi Grammar'];
  } else if (['Class 6', 'Class 7', 'Class 8'].includes(cls)) {
    return ['English', 'Hindi', 'Maths', 'Science', 'Social Science', 'Computer', 'Sanskrit', 'English Grammar', 'Hindi Grammar'];
  } else if (['Class 9', 'Class 10'].includes(cls)) {
    return ['English', 'Hindi', 'Maths', 'Science', 'Social Science', 'IT', '5 Yr PYQs', '25 AI Sample Papers'];
  } else {
    return ['Physics', 'Chemistry', 'Maths / Bio', 'IP (Python)', 'CS', '5 Yr PYQs', '25 AI Sample Papers'];
  }
};

// INITIAL MOCK DATA
const INITIAL_STUDENTS = [
  { regNo: '1001', pass: 'aims123', name: 'Rahul Sharma', class: 'Class 10', parentName: 'Mr. Sharma', dob: '2010-05-15', joiningDate: '2026-04-01', feesAmount: '2000', feeStatus: 'Paid', isUnlocked: true },
  { regNo: '1002', pass: 'aims456', name: 'Priya Verma', class: 'Class 12 IP', parentName: 'Mr. Verma', dob: '2008-08-20', joiningDate: '2026-04-01', feesAmount: '2500', feeStatus: 'Pending', isUnlocked: false }
];

// --- LOGIN SCREEN ---
function LoginScreen({ navigation, route }) {
  const { students } = route.params;
  const [regNo, setRegNo] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (regNo.trim().toLowerCase() === 'admin' && password.trim() === 'admin123') {
      navigation.navigate('AdminDashboard');
      return;
    }
    const user = students.find(s => s.regNo === regNo.trim() && s.pass === password.trim());
    if (user) {
      navigation.navigate('StudentPortal', { student: user });
    } else {
      Alert.alert('Error', 'Invalid Reg Number or Account deleted!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>AIMS TUTORIAL</Text>
      <Text style={styles.subTitle}>Coaching & Learning Management System</Text>
      <TextInput style={styles.input} placeholder="Registration No / Admin ID" value={regNo} onChangeText={setRegNo} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin}>
        <Text style={styles.btnText}>LOGIN</Text>
      </TouchableOpacity>
    </View>
  );
}

// --- ADMIN DASHBOARD (5 BUTTONS) ---
function AdminDashboardScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Admin Control Center</Text>
      
      <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('RegisterStudent')}>
        <Text style={styles.menuTitle}>1. New Student Registration</Text>
        <Text style={styles.menuSub}>Add Reg No, Password, DOB, Class & Fee Details</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('StudentProfiles')}>
        <Text style={styles.menuTitle}>2. Student Profiles & Delete Account</Text>
        <Text style={styles.menuSub}>Update student profile or remove/block access</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('Attendance')}>
        <Text style={styles.menuTitle}>3. Live Mobile Attendance & Excel Export</Text>
        <Text style={styles.menuSub}>Mark Daily Present/Absent, Coaching OFF & Export Excel</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('FeeTracker')}>
        <Text style={styles.menuTitle}>4. Month-Wise Fee Tracker & Unlock Access</Text>
        <Text style={styles.menuSub}>Track offline fee payment and unlock Class 10-12 material</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('ContentUpload')}>
        <Text style={styles.menuTitle}>5. Classes & Course Material Manager</Text>
        <Text style={styles.menuSub}>Upload Notes, PYQs, AI Sample Papers & Reply Doubts</Text>
      </TouchableOpacity>
    </View>
  );
}

// --- 1. NEW STUDENT REGISTRATION ---
function RegisterStudentScreen({ route }) {
  const { students, setStudents } = route.params;
  const [name, setName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [pass, setPass] = useState('');
  const [selectedClass, setSelectedClass] = useState('Class 1');
  const [parentName, setParentName] = useState('');
  const [dob, setDob] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [fees, setFees] = useState('');

  const handleRegister = () => {
    if (!name || !regNo || !pass) {
      Alert.alert('Error', 'Name, Reg No, and Password are required!');
      return;
    }
    const newStudent = {
      regNo: regNo.trim(), pass: pass.trim(), name: name.trim(),
      class: selectedClass, parentName, dob, joiningDate, feesAmount: fees,
      feeStatus: 'Pending', isUnlocked: false
    };
    setStudents([...students, newStudent]);
    Alert.alert('Success', `${name} registered for ${selectedClass}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Register New Student</Text>
      <TextInput style={styles.input} placeholder="Student Full Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Reg No (ID)" value={regNo} onChangeText={setRegNo} />
      <TextInput style={styles.input} placeholder="Assign Password" value={pass} onChangeText={setPass} />
      <TextInput style={styles.input} placeholder="Parents Name" value={parentName} onChangeText={setParentName} />
      <TextInput style={styles.input} placeholder="DOB (YYYY-MM-DD)" value={dob} onChangeText={setDob} />
      <TextInput style={styles.input} placeholder="Joining Date (YYYY-MM-DD)" value={joiningDate} onChangeText={setJoiningDate} />
      <TextInput style={styles.input} placeholder="Monthly Fee (₹)" value={fees} onChangeText={setFees} keyboardType="numeric" />

      <Text style={styles.label}>Select Class (1 to 12):</Text>
      <View style={styles.chipContainer}>
        {ALL_CLASSES.map(cls => (
          <TouchableOpacity key={cls} style={[styles.chip, selectedClass === cls && styles.chipSelected]} onPress={() => setSelectedClass(cls)}>
            <Text style={[styles.chipText, selectedClass === cls && styles.chipTextSelected]}>{cls}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.btnPrimary} onPress={handleRegister}>
        <Text style={styles.btnText}>REGISTER STUDENT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- STUDENT PORTAL (CLASS RESTRICTED) ---
function StudentPortalScreen({ route, navigation }) {
  const { student } = route.params;
  const subjects = GET_SUBJECTS(student.class);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Welcome, {student.name}</Text>
        <Text style={styles.classBadge}>Assigned Class: {student.class}</Text>
        <Text style={styles.cardText}>Reg No: {student.regNo} | Parent: {student.parentName}</Text>
        <Text style={styles.cardText}>Fee Status: <Text style={{color: student.feeStatus === 'Paid' ? 'green' : 'red', fontWeight: 'bold'}}>{student.feeStatus}</Text></Text>
      </View>

      <Text style={styles.sectionHeader}>{student.class} Subject Modules</Text>
      {subjects.map(sub => (
        <TouchableOpacity 
          key={sub} 
          style={styles.subjectCard}
          onPress={() => {
            if ((student.class.includes('10') || student.class.includes('11') || student.class.includes('12')) && !student.isUnlocked) {
              Alert.alert('Material Locked', 'Please submit offline fees to unlock PYQs & Sample Papers.');
            } else {
              navigation.navigate('SubjectView', { subject: sub, student });
            }
          }}
        >
          <Text style={styles.subjectText}>📘 {sub}</Text>
          {(!student.isUnlocked && (student.class.includes('10') || student.class.includes('12'))) ? <Text style={{color: 'red', fontSize: 10}}>🔒 Locked</Text> : <Text style={{color: 'green', fontSize: 10}}>🔓 Open</Text>}
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.btnDoubt} onPress={() => Alert.alert('Doubt Section', 'Upload Photo / Type Doubt for Admin')}>
        <Text style={styles.btnText}>📷 Ask Doubt (Photo / Text)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- DUMMY PLACEHOLDERS FOR REMAINING SCREENS ---
function DummyScreen({ route }) {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>{route.name} Module Active</Text>
      <Text style={styles.subTitle}>Connected and running ready for Render build.</Text>
    </View>
  );
}

export default function App() {
  const [students, setStudents] = useState(INITIAL_STUDENTS);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} initialParams={{ students }} options={{ headerShown: false }} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Admin Control Center' }} />
        <Stack.Screen name="RegisterStudent" component={RegisterStudentScreen} initialParams={{ students, setStudents }} options={{ title: 'Register New Student' }} />
        <Stack.Screen name="StudentProfiles" component={DummyScreen} options={{ title: 'Student Management' }} />
        <Stack.Screen name="Attendance" component={DummyScreen} options={{ title: 'Attendance & Excel' }} />
        <Stack.Screen name="FeeTracker" component={DummyScreen} options={{ title: 'Fee Tracker' }} />
        <Stack.Screen name="ContentUpload" component={DummyScreen} options={{ title: 'Course Content & Doubts' }} />
        <Stack.Screen name="StudentPortal" component={StudentPortalScreen} options={{ title: 'Student Portal' }} />
        <Stack.Screen name="SubjectView" component={DummyScreen} options={{ title: 'Subject Content' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9', padding: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a237e', textAlign: 'center', marginTop: 10 },
  subTitle: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 15 },
  input: { backgroundColor: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 10 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#333', marginVertical: 6 },
  btnPrimary: { backgroundColor: '#1a237e', padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  btnDoubt: { backgroundColor: '#d32f2f', padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 15 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  menuCard: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#1a237e' },
  menuTitle: { fontSize: 14, fontWeight: 'bold', color: '#1a237e' },
  menuSub: { fontSize: 11, color: '#666', marginTop: 3 },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 12, elevation: 2 },
  cardHeader: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardText: { fontSize: 12, color: '#555', marginTop: 4 },
  classBadge: { color: '#1a237e', fontWeight: 'bold', fontSize: 14, marginVertical: 4 },
  sectionHeader: { fontSize: 15, fontWeight: 'bold', color: '#1a237e', marginVertical: 10 },
  subjectCard: { backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subjectText: { fontSize: 13, fontWeight: 'bold', color: '#333' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  chip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16, backgroundColor: '#e0e0e0', marginRight: 5, marginBottom: 5 },
  chipSelected: { backgroundColor: '#1a237e' },
  chipText: { fontSize: 11, color: '#333' },
  chipTextSelected: { color: '#fff', fontWeight: 'bold' }
});
