import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, Alert, SafeAreaView 
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

// Initial Students Database
const INITIAL_STUDENTS = [
  { regNo: '1001', pass: 'aims123', name: 'Rahul Sharma', class: 'Class 8', feesStatus: 'Pending', feesAmount: '1500' },
  { regNo: '1002', pass: 'aims456', name: 'Priya Verma', class: 'Class 12 IP', feesStatus: 'Received', feesAmount: '0' }
];

// Initial Course Materials Database
const INITIAL_COURSE_CONTENT = [
  { id: '1', targetClass: 'Class 8', subject: 'Maths', chapter: 'Ch 1: Fractions & Decimals', pdf: 'Class8_Fractions.pdf' },
  { id: '2', targetClass: 'Class 8', subject: 'English 2', chapter: 'Ch 1: Nouns & Pronouns', pdf: 'Class8_English.pdf' },
  { id: '3', targetClass: 'Class 12 IP', subject: 'IP (Python)', chapter: 'Ch 1: Pandas DataFrames', pdf: 'Class12_IP_Pandas.pdf' },
  { id: '4', targetClass: 'Class 12 IP', subject: 'IP (SQL)', chapter: 'Ch 2: SQL Queries', pdf: 'Class12_IP_SQL.pdf' },
];

// --- LOGIN SCREEN ---
function LoginScreen({ navigation, route }) {
  const { students } = route.params;
  const [regNo, setRegNo] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (regNo.trim().toLowerCase() === 'admin' && password.trim() === 'admin123') {
      navigation.navigate('AdminPanel');
      return;
    }
    const user = students.find(s => s.regNo === regNo.trim() && s.pass === password.trim());
    if (user) {
      navigation.navigate('Dashboard', { student: user });
    } else {
      Alert.alert('Error', 'Invalid Registration Number or Password!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>AIMS TUTORIAL</Text>
      <Text style={styles.subTitle}>Student & Admin Portal</Text>

      <TextInput style={styles.input} placeholder="Registration No / Admin ID" value={regNo} onChangeText={setRegNo} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

      <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin}>
        <Text style={styles.btnText}>LOGIN</Text>
      </TouchableOpacity>
    </View>
  );
}

// --- ADMIN PANEL SCREEN ---
function AdminPanelScreen({ route }) {
  const { students, setStudents, courseContent, setCourseContent } = route.params;
  
  // Registration Form State
  const [name, setName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [pass, setPass] = useState('');
  const [cls, setCls] = useState('Class 8');
  const [amount, setAmount] = useState('');

  // Upload Content Form State
  const [targetClass, setTargetClass] = useState('Class 8');
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [pdfName, setPdfName] = useState('');

  // 1. Register Student Class-Wise
  const handleAddStudent = () => {
    if (!name || !regNo || !pass || !cls) {
      Alert.alert('Error', 'Please fill Name, Reg No, Password & Class!');
      return;
    }
    const exists = students.some(s => s.regNo === regNo.trim());
    if (exists) {
      Alert.alert('Error', 'This Registration Number already exists!');
      return;
    }

    const newStudent = { 
      regNo: regNo.trim(), 
      pass: pass.trim(), 
      name: name.trim(), 
      class: cls.trim(), 
      feesStatus: 'Pending', 
      feesAmount: amount || '0' 
    };

    setStudents([...students, newStudent]);
    Alert.alert('Success', `${name} registered for ${cls}!`);
    setName(''); setRegNo(''); setPass(''); setAmount('');
  };

  // 2. Delete Student Function
  const handleDeleteStudent = (regNoToDelete, studentName) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${studentName} (${regNoToDelete})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            const updatedList = students.filter(s => s.regNo !== regNoToDelete);
            setStudents(updatedList);
            Alert.alert('Deleted', `${studentName} removed successfully.`);
          }
        }
      ]
    );
  };

  // 3. Upload Material Class-Wise
  const handleUploadContent = () => {
    if (!subject || !chapter || !pdfName) {
      Alert.alert('Error', 'Please fill Chapter, Subject, and PDF details!');
      return;
    }
    const newContent = {
      id: Date.now().toString(),
      targetClass: targetClass.trim(),
      subject: subject,
      chapter: chapter,
      pdf: pdfName,
    };
    setCourseContent([newContent, ...courseContent]);
    Alert.alert('Success', `Material uploaded for ${targetClass}!`);
    setSubject(''); setChapter(''); setPdfName('');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Admin Control Center</Text>

      {/* Class-wise Student Registration */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>1. Register New Student (Class-Wise)</Text>
        <TextInput style={styles.input} placeholder="Student Full Name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Registration Number (e.g. 1003)" value={regNo} onChangeText={setRegNo} />
        <TextInput style={styles.input} placeholder="Assign Password" value={pass} onChangeText={setPass} />
        <TextInput style={styles.input} placeholder="Assign Class (e.g. Class 8 / Class 12 IP)" value={cls} onChangeText={setCls} />
        <TextInput style={styles.input} placeholder="Fees Amount (₹)" value={amount} onChangeText={setAmount} keyboardType="numeric" />
        <TouchableOpacity style={styles.btnPrimary} onPress={handleAddStudent}>
          <Text style={styles.btnText}>REGISTER STUDENT</Text>
        </TouchableOpacity>
      </View>

      {/* Student List & Delete Management */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>2. Registered Students ({students.length})</Text>
        {students.map((item) => (
          <View key={item.regNo} style={styles.studentRow}>
            <View style={{flex: 1}}>
              <Text style={styles.studentName}>{item.name} ({item.class})</Text>
              <Text style={styles.studentSub}>Reg: {item.regNo} | Pass: {item.pass}</Text>
            </View>
            <TouchableOpacity 
              style={styles.btnDelete} 
              onPress={() => handleDeleteStudent(item.regNo, item.name)}
            >
              <Text style={styles.btnDeleteText}>DELETE</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Upload Class Material */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>3. Upload PDF/Notes Class-Wise</Text>
        <TextInput style={styles.input} placeholder="Target Class (e.g. Class 8 / Class 12 IP)" value={targetClass} onChangeText={setTargetClass} />
        <TextInput style={styles.input} placeholder="Subject (e.g. Maths / IP)" value={subject} onChangeText={setSubject} />
        <TextInput style={styles.input} placeholder="Chapter Name" value={chapter} onChangeText={setChapter} />
        <TextInput style={styles.input} placeholder="PDF File Name" value={pdfName} onChangeText={setPdfName} />
        <TouchableOpacity style={styles.btnPrimary} onPress={handleUploadContent}>
          <Text style={styles.btnText}>UPLOAD MATERIAL</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// --- STUDENT DASHBOARD SCREEN ---
function DashboardScreen({ route, navigation }) {
  const { student, courseContent } = route.params;

  // Filter content matching student's class
  const studentContent = courseContent.filter(item => 
    item.targetClass.trim().toLowerCase() === student.class.trim().toLowerCase()
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Welcome, {student.name}</Text>
          <Text style={styles.classBadge}>Portal: {student.class}</Text>
          <Text style={styles.cardText}>Reg No: {student.regNo}</Text>
          <Text style={styles.cardText}>Fees Status: <Text style={{color: student.feesStatus === 'Received' ? 'green' : 'red', fontWeight: 'bold'}}>{student.feesStatus} (₹{student.feesAmount})</Text></Text>
        </View>

        <Text style={styles.sectionHeader}>{student.class} Study Material & Quizzes</Text>
        
        {studentContent.length === 0 ? (
          <View style={styles.card}>
            <Text style={{textAlign: 'center', color: '#777'}}>Aapki class ke liye abhi koi material uploaded nahi hai.</Text>
          </View>
        ) : (
          studentContent.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={{flex: 1}}>
                <Text style={styles.tag}>{item.subject}</Text>
                <Text style={styles.itemTitle}>{item.chapter}</Text>
                <Text style={styles.itemSub}>📄 File: {item.pdf}</Text>
              </View>
              <TouchableOpacity 
                style={styles.btnSmall} 
                onPress={() => navigation.navigate('Quiz', { chapter: item })}
              >
                <Text style={styles.btnSmallText}>Open</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- QUIZ & MATERIAL SCREEN ---
function QuizScreen({ route, navigation }) {
  const { chapter } = route.params;
  const [selected, setSelected] = useState(null);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>{chapter.chapter}</Text>
      <Text style={styles.subTitle}>Subject: {chapter.subject} ({chapter.targetClass})</Text>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>Download Class Notes / Docs:</Text>
        <TouchableOpacity style={styles.pdfBtn} onPress={() => Alert.alert('Opening File', chapter.pdf)}>
          <Text style={styles.pdfBtnText}>📥 Download {chapter.pdf}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>Q1. Topic Practice Question</Text>
        {['Option A', 'Option B', 'Option C'].map((opt, i) => (
          <TouchableOpacity 
            key={i} 
            style={[styles.optBtn, selected === i && styles.optSelected]} 
            onPress={() => setSelected(i)}
          >
            <Text>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.btnPrimary} onPress={() => { Alert.alert('Submitted', 'Test Completed!'); navigation.goBack(); }}>
        <Text style={styles.btnText}>SUBMIT TEST</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- MAIN NAVIGATION ---
export default function App() {
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [courseContent, setCourseContent] = useState(INITIAL_COURSE_CONTENT);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} initialParams={{ students }} options={{ headerShown: false }} />
        <Stack.Screen name="AdminPanel" component={AdminPanelScreen} initialParams={{ students, setStudents, courseContent, setCourseContent }} options={{ title: 'Admin Control Center' }} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} initialParams={{ courseContent }} options={{ title: 'AIMS Student Portal' }} />
        <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'Study & Test Portal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9', padding: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a237e', textAlign: 'center', marginTop: 10 },
  subTitle: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 15 },
  input: { backgroundColor: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 10 },
  btnPrimary: { backgroundColor: '#1a237e', padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 12, elevation: 2 },
  cardHeader: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  cardText: { fontSize: 13, color: '#555', marginTop: 3 },
  classBadge: { color: '#1a237e', fontWeight: 'bold', fontSize: 14, marginVertical: 4 },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#1a237e', marginVertical: 10 },
  itemCard: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  tag: { fontSize: 10, fontWeight: 'bold', color: '#d32f2f', textTransform: 'uppercase' },
  itemTitle: { fontSize: 13, fontWeight: 'bold', color: '#333', marginTop: 2 },
  itemSub: { fontSize: 11, color: '#666', marginTop: 2 },
  btnSmall: { backgroundColor: '#1a237e', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 5 },
  btnSmallText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  pdfBtn: { backgroundColor: '#e8eaf6', padding: 10, borderRadius: 6, marginTop: 8, alignItems: 'center' },
  pdfBtnText: { color: '#1a237e', fontWeight: 'bold', fontSize: 12 },
  optBtn: { padding: 10, backgroundColor: '#f0f0f0', borderRadius: 6, marginTop: 8 },
  optSelected: { backgroundColor: '#c5cae9', borderWidth: 1, borderColor: '#1a237e' },
  
  studentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  studentName: { fontSize: 13, fontWeight: 'bold', color: '#333' },
  studentSub: { fontSize: 11, color: '#666' },
  btnDelete: { backgroundColor: '#d32f2f', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 5 },
  btnDeleteText: { color: '#fff', fontSize: 10, fontWeight: 'bold' }
});