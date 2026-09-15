import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, Alert, Platform 
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

// Helper for Web-safe alerts
const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
};

const ALL_CLASSES = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12 IP', 'Class 12 CS'
];

const MONTHS = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];

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

const INITIAL_STUDENTS = [
  { regNo: '1001', pass: 'aims123', name: 'Rahul Sharma', class: 'Class 10', parentName: 'Mr. Sharma', dob: '2010-05-15', joiningDate: '2026-04-01', feesAmount: '2000', feeStatus: 'Paid', paidMonths: ['April', 'May'], isUnlocked: true },
  { regNo: '1002', pass: 'aims456', name: 'Priya Verma', class: 'Class 12 IP', parentName: 'Mr. Verma', dob: '2008-08-20', joiningDate: '2026-04-01', feesAmount: '2500', feeStatus: 'Pending', paidMonths: [], isUnlocked: false }
];

// --- 1. LOGIN SCREEN ---
function LoginScreen({ navigation, route }) {
  const students = route.params?.students || INITIAL_STUDENTS;
  const [regNo, setRegNo] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const inputReg = regNo.trim();
    const inputPass = password.trim();

    if (inputReg.toLowerCase() === 'admin' && inputPass === 'admin123') {
      navigation.navigate('AdminDashboard');
      return;
    }

    const user = students.find(s => s.regNo === inputReg && s.pass === inputPass);
    if (user) {
      navigation.navigate('StudentPortal', { student: user });
    } else {
      showAlert('Error', 'Invalid Reg Number or Account deleted!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>AIMS TUTORIAL</Text>
      <Text style={styles.subTitle}>Coaching & Learning Management System</Text>
      <TextInput style={styles.input} placeholder="Registration No / Admin ID" value={regNo} onChangeText={setRegNo} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin}>
        <Text style={styles.btnText}>LOGIN</Text>
      </TouchableOpacity>
    </View>
  );
}

// --- ADMIN DASHBOARD ---
function AdminDashboardScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
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
    </ScrollView>
  );
}

// --- 2. REGISTER NEW STUDENT ---
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
      showAlert('Error', 'Name, Reg No, and Password are required!');
      return;
    }
    const newStudent = {
      regNo: regNo.trim(), pass: pass.trim(), name: name.trim(),
      class: selectedClass, parentName, dob, joiningDate, feesAmount: fees,
      feeStatus: 'Pending', paidMonths: [], isUnlocked: false
    };
    setStudents([...students, newStudent]);
    showAlert('Success', `${name} registered successfully for ${selectedClass}!`);
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

// --- 3. STUDENT PROFILES & DELETE ACCOUNT ---
function StudentProfilesScreen({ route }) {
  const { students, setStudents } = route.params;
  const [search, setSearch] = useState('');

  const handleDelete = (regNo) => {
    const updated = students.filter(s => s.regNo !== regNo);
    setStudents(updated);
    showAlert('Deleted', `Student account ${regNo} has been removed.`);
  };

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.regNo.includes(search));

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Student Profiles & Management</Text>
      <TextInput style={styles.input} placeholder="🔍 Search by Name or Reg No..." value={search} onChangeText={setSearch} />

      {filtered.map(st => (
        <View key={st.regNo} style={styles.card}>
          <Text style={styles.cardHeader}>{st.name} ({st.class})</Text>
          <Text style={styles.cardText}>Reg No: {st.regNo} | Password: {st.pass}</Text>
          <Text style={styles.cardText}>Parent: {st.parentName} | DOB: {st.dob}</Text>
          <Text style={styles.cardText}>Joined: {st.joiningDate} | Monthly Fee: ₹{st.feesAmount}</Text>
          
          <TouchableOpacity style={styles.btnDanger} onPress={() => handleDelete(st.regNo)}>
            <Text style={styles.btnText}>🗑️ Delete Student Account</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

// --- 4. ATTENDANCE & EXCEL EXPORT ---
function AttendanceScreen({ route }) {
  const { students } = route.params;
  const [attendance, setAttendance] = useState({});
  const [selectedClass, setSelectedClass] = useState('All');

  const markAttendance = (regNo, status) => {
    setAttendance(prev => ({ ...prev, [regNo]: status }));
  };

  const markAllCoachingOff = () => {
    const newAtt = {};
    students.forEach(s => { newAtt[s.regNo] = 'Coaching OFF'; });
    setAttendance(newAtt);
    showAlert('Notice', 'Coaching marked OFF for all students today!');
  };

  const exportExcel = () => {
    let csvContent = "RegNo,Name,Class,Status\n";
    students.forEach(s => {
      csvContent += `${s.regNo},${s.name},${s.class},${attendance[s.regNo] || 'Not Marked'}\n`;
    });

    if (Platform.OS === 'web') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Attendance_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
    } else {
      showAlert('Export Data', csvContent);
    }
  };

  const filtered = selectedClass === 'All' ? students : students.filter(s => s.class === selectedClass);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Daily Attendance Tracker</Text>

      <TouchableOpacity style={styles.btnDanger} onPress={markAllCoachingOff}>
        <Text style={styles.btnText}>📢 Mark Entire Coaching OFF Today</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnSuccess} onPress={exportExcel}>
        <Text style={styles.btnText}>📊 Export Attendance Excel/CSV</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Filter By Class:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 10}}>
        <TouchableOpacity style={[styles.chip, selectedClass === 'All' && styles.chipSelected]} onPress={() => setSelectedClass('All')}>
          <Text style={[styles.chipText, selectedClass === 'All' && styles.chipTextSelected]}>All</Text>
        </TouchableOpacity>
        {ALL_CLASSES.map(cls => (
          <TouchableOpacity key={cls} style={[styles.chip, selectedClass === cls && styles.chipSelected]} onPress={() => setSelectedClass(cls)}>
            <Text style={[styles.chipText, selectedClass === cls && styles.chipTextSelected]}>{cls}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filtered.map(st => (
        <View key={st.regNo} style={styles.card}>
          <Text style={styles.cardHeader}>{st.name} ({st.class})</Text>
          <Text style={styles.cardText}>Status: <Text style={{fontWeight:'bold'}}>{attendance[st.regNo] || 'Pending'}</Text></Text>
          
          <View style={{flexDirection: 'row', marginTop: 8, gap: 5}}>
            <TouchableOpacity style={[styles.btnAction, {backgroundColor: 'green'}]} onPress={() => markAttendance(st.regNo, 'Present')}>
              <Text style={styles.btnText}>Present</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnAction, {backgroundColor: 'red'}]} onPress={() => markAttendance(st.regNo, 'Absent')}>
              <Text style={styles.btnText}>Absent</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnAction, {backgroundColor: 'orange'}]} onPress={() => markAttendance(st.regNo, 'OFF')}>
              <Text style={styles.btnText}>OFF</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// --- 5. MONTH-WISE FEE TRACKER & UNLOCK ACCESS ---
function FeeTrackerScreen({ route }) {
  const { students, setStudents } = route.params;

  const toggleMonthFee = (regNo, month) => {
    const updated = students.map(s => {
      if (s.regNo === regNo) {
        const paid = s.paidMonths || [];
        const isPaid = paid.includes(month);
        const newPaid = isPaid ? paid.filter(m => m !== month) : [...paid, month];
        return { ...s, paidMonths: newPaid, feeStatus: newPaid.length > 0 ? 'Paid' : 'Pending' };
      }
      return s;
    });
    setStudents(updated);
  };

  const toggleUnlock = (regNo) => {
    const updated = students.map(s => {
      if (s.regNo === regNo) {
        return { ...s, isUnlocked: !s.isUnlocked };
      }
      return s;
    });
    setStudents(updated);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Month-Wise Fee & Unlock Tracker</Text>

      {students.map(st => (
        <View key={st.regNo} style={styles.card}>
          <Text style={styles.cardHeader}>{st.name} ({st.class}) - ₹{st.feesAmount}/mo</Text>
          <Text style={styles.cardText}>
            Access Status: {st.isUnlocked ? <Text style={{color:'green', fontWeight:'bold'}}>🔓 Material Unlocked</Text> : <Text style={{color:'red', fontWeight:'bold'}}>🔒 Material Locked</Text>}
          </Text>

          <TouchableOpacity 
            style={[styles.btnPrimary, {backgroundColor: st.isUnlocked ? '#d32f2f' : '#388e3c', marginVertical: 6}]} 
            onPress={() => toggleUnlock(st.regNo)}
          >
            <Text style={styles.btnText}>{st.isUnlocked ? 'Lock Class 10-12 Access' : '🔓 Unlock Full Access (PYQs & Papers)'}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Paid Months Tracker:</Text>
          <View style={styles.chipContainer}>
            {MONTHS.map(m => {
              const isPaid = (st.paidMonths || []).includes(m);
              return (
                <TouchableOpacity 
                  key={m} 
                  style={[styles.chip, isPaid && {backgroundColor: '#388e3c'}]} 
                  onPress={() => toggleMonthFee(st.regNo, m)}
                >
                  <Text style={[styles.chipText, isPaid && {color: '#fff', fontWeight: 'bold'}]}>{m} {isPaid ? '✓' : ''}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// --- 6. COURSE MATERIAL & DOUBTS MANAGER ---
function ContentUploadScreen() {
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [title, setTitle] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [materials, setMaterials] = useState([
    { id: '1', class: 'Class 10', title: 'Science Ch-1 Notes', link: 'https://example.com/notes.pdf' }
  ]);

  const handleUpload = () => {
    if (!title || !fileUrl) {
      showAlert('Error', 'Material Title and Drive/PDF URL are required!');
      return;
    }
    setMaterials([...materials, { id: Date.now().toString(), class: selectedClass, title, link: fileUrl }]);
    setTitle('');
    setFileUrl('');
    showAlert('Success', 'Study material uploaded successfully!');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Upload Course Content & Notes</Text>

      <Text style={styles.label}>Select Class to Upload For:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 10}}>
        {ALL_CLASSES.map(cls => (
          <TouchableOpacity key={cls} style={[styles.chip, selectedClass === cls && styles.chipSelected]} onPress={() => setSelectedClass(cls)}>
            <Text style={[styles.chipText, selectedClass === cls && styles.chipTextSelected]}>{cls}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TextInput style={styles.input} placeholder="Content Title (e.g., Maths Ch-2 PYQ)" value={title} onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="Drive PDF Link / Document URL" value={fileUrl} onChangeText={setFileUrl} />

      <TouchableOpacity style={styles.btnPrimary} onPress={handleUpload}>
        <Text style={styles.btnText}>📤 UPLOAD MATERIAL</Text>
      </TouchableOpacity>

      <Text style={styles.sectionHeader}>Uploaded Materials List</Text>
      {materials.map(m => (
        <View key={m.id} style={styles.card}>
          <Text style={styles.cardHeader}>[{m.class}] {m.title}</Text>
          <Text style={{color: '#1a237e', fontSize: 11, marginTop: 4}}>{m.link}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

// --- 7. STUDENT PORTAL ---
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
              showAlert('Material Locked', 'Please submit offline fees to unlock PYQs & Sample Papers.');
            } else {
              navigation.navigate('SubjectView', { subject: sub, student });
            }
          }}
        >
          <Text style={styles.subjectText}>📘 {sub}</Text>
          {(!student.isUnlocked && (student.class.includes('10') || student.class.includes('12'))) ? <Text style={{color: 'red', fontSize: 10}}>🔒 Locked</Text> : <Text style={{color: 'green', fontSize: 10}}>🔓 Open</Text>}
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.btnDoubt} onPress={() => showAlert('Doubt Section', 'Upload Photo / Type Doubt for Admin')}>
        <Text style={styles.btnText}>📷 Ask Doubt (Photo / Text)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function SubjectViewScreen({ route }) {
  const { subject, student } = route.params;
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>{subject} Materials</Text>
      <Text style={styles.subTitle}>Showing notes and PYQs for {student.class}</Text>
      <View style={styles.card}>
        <Text style={styles.cardHeader}>📄 Chapter 1 Notes.pdf</Text>
        <Text style={styles.cardText}>Uploaded by Admin</Text>
      </View>
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
        <Stack.Screen name="StudentProfiles" component={StudentProfilesScreen} initialParams={{ students, setStudents }} options={{ title: 'Student Management' }} />
        <Stack.Screen name="Attendance" component={AttendanceScreen} initialParams={{ students }} options={{ title: 'Attendance & Excel' }} />
        <Stack.Screen name="FeeTracker" component={FeeTrackerScreen} initialParams={{ students, setStudents }} options={{ title: 'Fee Tracker' }} />
        <Stack.Screen name="ContentUpload" component={ContentUploadScreen} options={{ title: 'Course Content & Doubts' }} />
        <Stack.Screen name="StudentPortal" component={StudentPortalScreen} options={{ title: 'Student Portal' }} />
        <Stack.Screen name="SubjectView" component={SubjectViewScreen} options={{ title: 'Subject Content' }} />
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
  btnPrimary: { backgroundColor: '#1a237e', padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 8 },
  btnDanger: { backgroundColor: '#d32f2f', padding: 10, borderRadius: 8, alignItems: 'center', marginVertical: 4 },
  btnSuccess: { backgroundColor: '#388e3c', padding: 10, borderRadius: 8, alignItems: 'center', marginVertical: 4 },
  btnAction: { flex: 1, padding: 8, borderRadius: 6, alignItems: 'center' },
  btnDoubt: { backgroundColor: '#d32f2f', padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 15 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  menuCard: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#1a237e' },
  menuTitle: { fontSize: 14, fontWeight: 'bold', color: '#1a237e' },
  menuSub: { fontSize: 11, color: '#666', marginTop: 3 },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 12, elevation: 2 },
  cardHeader: { fontSize: 15, fontWeight: 'bold', color: '#333' },
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
