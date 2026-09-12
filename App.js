import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, Alert, SafeAreaView 
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

// Available Classes List for Dropdown
const CLASS_OPTIONS = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12 IP', 'Class 12 CS'];

// Initial Databases
const INITIAL_STUDENTS = [
  { regNo: '1001', pass: 'aims123', name: 'Rahul Sharma', class: 'Class 8', feesStatus: 'Pending', feesAmount: '1500' },
  { regNo: '1002', pass: 'aims456', name: 'Priya Verma', class: 'Class 12 IP', feesStatus: 'Received', feesAmount: '0' }
];

const INITIAL_COURSE_CONTENT = [
  { id: '1', targetClass: 'Class 8', subject: 'Maths', chapter: 'Ch 1: Fractions', pdf: 'Class8_Fractions.pdf', pdfUrl: null },
  { id: '2', targetClass: 'Class 12 IP', subject: 'IP (Python)', chapter: 'Ch 1: Pandas', pdf: 'Class12_IP_Pandas.pdf', pdfUrl: null },
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
  const [selectedRegClass, setSelectedRegClass] = useState('Class 8');
  const [amount, setAmount] = useState('');

  // Upload Content Form State
  const [selectedUploadClass, setSelectedUploadClass] = useState('Class 8');
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfFileUrl, setPdfFileUrl] = useState(null);

  // File Picker (From Device Gallery/Storage)
  const handlePickFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPdfFileName(file.name);
      setPdfFileUrl(URL.createObjectURL(file));
      Alert.alert('File Selected', `${file.name} ready to upload!`);
    }
  };

  // 1. Register Student Class-Wise
  const handleAddStudent = () => {
    if (!name || !regNo || !pass) {
      Alert.alert('Error', 'Please fill Name, Reg No, and Password!');
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
      class: selectedRegClass, 
      feesStatus: 'Pending', 
      feesAmount: amount || '0' 
    };

    setStudents([...students, newStudent]);
    Alert.alert('Success', `${name} registered for ${selectedRegClass}!`);
    setName(''); setRegNo(''); setPass(''); setAmount('');
  };

  // 2. Delete Student
  const handleDeleteStudent = (regNoToDelete, studentName) => {
    const updatedList = students.filter(s => s.regNo !== regNoToDelete);
    setStudents(updatedList);
    Alert.alert('Deleted', `${studentName} removed successfully.`);
  };

  // 3. Upload Material
  const handleUploadContent = () => {
    if (!subject || !chapter || !pdfFileName) {
      Alert.alert('Error', 'Please select a PDF file and fill all fields!');
      return;
    }
    const newContent = {
      id: Date.now().toString(),
      targetClass: selectedUploadClass,
      subject: subject,
      chapter: chapter,
      pdf: pdfFileName,
      pdfUrl: pdfFileUrl
    };
    setCourseContent([newContent, ...courseContent]);
    Alert.alert('Success', `Material uploaded for ${selectedUploadClass}!`);
    setSubject(''); setChapter(''); setPdfFileName(''); setPdfFileUrl(null);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Admin Control Center</Text>

      {/* 1. Register Student with Dropdown */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>1. Register New Student (Class-Wise)</Text>
        <TextInput style={styles.input} placeholder="Student Full Name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Registration Number (e.g. 1003)" value={regNo} onChangeText={setRegNo} />
        <TextInput style={styles.input} placeholder="Assign Password" value={pass} onChangeText={setPass} />
        
        {/* Class Selection Dropdown */}
        <Text style={styles.label}>Select Class:</Text>
        <View style={styles.dropdownContainer}>
          {CLASS_OPTIONS.map((cls) => (
            <TouchableOpacity 
              key={cls} 
              style={[styles.chip, selectedRegClass === cls && styles.chipSelected]} 
              onPress={() => setSelectedRegClass(cls)}
            >
              <Text style={[styles.chipText, selectedRegClass === cls && styles.chipTextSelected]}>{cls}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput style={styles.input} placeholder="Fees Amount (₹)" value={amount} onChangeText={setAmount} keyboardType="numeric" />
        <TouchableOpacity style={styles.btnPrimary} onPress={handleAddStudent}>
          <Text style={styles.btnText}>REGISTER STUDENT</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Registered Students List */}
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

      {/* 3. Upload Material with Gallery/File Picker */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>3. Upload PDF/Notes Class-Wise</Text>
        
        <Text style={styles.label}>Select Target Class:</Text>
        <View style={styles.dropdownContainer}>
          {CLASS_OPTIONS.map((cls) => (
            <TouchableOpacity 
              key={cls} 
              style={[styles.chip, selectedUploadClass === cls && styles.chipSelected]} 
              onPress={() => setSelectedUploadClass(cls)}
            >
              <Text style={[styles.chipText, selectedUploadClass === cls && styles.chipTextSelected]}>{cls}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput style={styles.input} placeholder="Subject (e.g. Maths / IP)" value={subject} onChangeText={setSubject} />
        <TextInput style={styles.input} placeholder="Chapter Name" value={chapter} onChangeText={setChapter} />

        {/* Gallery / File Picker Input */}
        <Text style={styles.label}>Choose PDF / Document File:</Text>
        <input 
          type="file" 
          accept="application/pdf,image/*" 
          onChange={handlePickFile} 
          style={{ marginBottom: 15, padding: 8, backgroundColor: '#f0f0f0', borderRadius: 6, width: '100%' }} 
        />
        {pdfFileName ? <Text style={styles.fileSelectedText}>Selected: {pdfFileName}</Text> : null}

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

        <Text style={styles.sectionHeader}>{student.class} Study Material</Text>
        
        {studentContent.length === 0 ? (
          <View style={styles.card}>
            <Text style={{textAlign: 'center', color: '#777'}}>Is class ke liye koi material uploaded nahi hai.</Text>
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

  const handleDownload = () => {
    if (chapter.pdfUrl) {
      window.open(chapter.pdfUrl, '_blank');
    } else {
      Alert.alert('Demo File', `Opening sample file: ${chapter.pdf}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>{chapter.chapter}</Text>
      <Text style={styles.subTitle}>Subject: {chapter.subject} ({chapter.targetClass})</Text>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>Download Class Notes / Docs:</Text>
        <TouchableOpacity style={styles.pdfBtn} onPress={handleDownload}>
          <Text style={styles.pdfBtnText}>📥 View / Download File ({chapter.pdf})</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.goBack()}>
        <Text style={styles.btnText}>BACK TO DASHBOARD</Text>
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
        <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'Study Portal' }} />
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
  label: { fontSize: 12, fontWeight: 'bold', color: '#333', marginBottom: 6 },
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
  
  studentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  studentName: { fontSize: 13, fontWeight: 'bold', color: '#333' },
  studentSub: { fontSize: 11, color: '#666' },
  btnDelete: { backgroundColor: '#d32f2f', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 5 },
  btnDeleteText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  dropdownContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, backgroundColor: '#e0e0e0', marginRight: 6, marginBottom: 6 },
  chipSelected: { backgroundColor: '#1a237e' },
  chipText: { fontSize: 11, color: '#333' },
  chipTextSelected: { color: '#fff', fontWeight: 'bold' },
  fileSelectedText: { fontSize: 11, color: 'green', fontWeight: 'bold', marginBottom: 8 }
});
