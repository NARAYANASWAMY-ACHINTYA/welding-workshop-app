import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, Image, TouchableOpacity, ScrollView } from 'react-native';
import axios from 'axios';
const BACKEND = (process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000');
export default function App() {
  const [portfolio, setPortfolio] = useState([]);
  const [catalogue, setCatalogue] = useState([]);
  const [contact, setContact] = useState(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [file, setFile] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  useEffect(() => { fetchData(); }, []);
  async function fetchData() {
    try {
      const [p, c, co] = await Promise.all([ axios.get(`${BACKEND}/portfolio`), axios.get(`${BACKEND}/catalogue`), axios.get(`${BACKEND}/contact`) ]);
      setPortfolio(p.data); setCatalogue(c.data); setContact(co.data);
    } catch (e) { console.warn('Fetch failed', e.message); }
  }
  const webPickFile = (evt) => { const f = evt?.target?.files?.[0]; setFile(f); };
  const upload = async () => {
    if (!title || !file) return alert('Provide title and file');
    const form = new FormData();
    form.append('username', username); form.append('password', password);
    form.append('title', title); form.append('description', desc); form.append('category', 'portfolio'); form.append('file', file);
    try { const res = await axios.post(`${BACKEND}/admin/upload`, form, { headers: { 'Content-Type': 'multipart/form-data' } }); alert('Uploaded'); setTitle(''); setDesc(''); setFile(null); fetchData(); }
    catch (e) { console.error(e); alert('Upload failed: ' + (e.response?.data?.detail || e.message)); }
  };
  const contactWhatsApp = (serviceName) => {
    if (!contact) return;
    const phone = contact.whatsapp || contact.phone;
    const msg = encodeURIComponent(`Hello, I am interested in "${serviceName}". Please provide details/price.`);
    const url = `https://wa.me/${phone.replace(/[^0-9]/g,'')}?text=${msg}`;
    window.open(url, '_blank');
  };
  return (
    <ScrollView style={{ padding: 16, marginTop: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 12 }}>Local Welding Workshop</Text>
      <View style={{ marginBottom: 20 }}><Text style={{ fontSize: 20 }}>Contact</Text>{contact && (<View style={{ marginTop: 8 }}><Text>Phone: {contact.phone}</Text><Text>Address: {contact.address}</Text></View>)}</View>
      <View style={{ marginBottom: 20 }}><Text style={{ fontSize: 20 }}>Services</Text>{catalogue.map(item => (<View key={item.id} style={{ paddingVertical: 8 }}><Text style={{ fontWeight: '600' }}>{item.name}</Text><Text>{item.desc}</Text><Button title="Enquire on WhatsApp" onPress={() => contactWhatsApp(item.name)} /></View>))}</View>
      <View style={{ marginBottom: 20 }}><Text style={{ fontSize: 20 }}>Portfolio</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>{portfolio.map(item => (<TouchableOpacity key={item.id} onPress={() => window.open(item.url, '_blank')} style={{ width: '48%', margin: '1%' }}>{item.type === 'image' ? (<Image source={{ uri: BACKEND + item.url }} style={{ width: '100%', height: 150 }} resizeMode="cover" />) : (<div style={{ width: '100%', height: 150 }}><video src={BACKEND + item.url} style={{ width: '100%', height: '100%' }} controls /></div>)}<Text style={{ fontWeight: '600' }}>{item.title}</Text><Text>{item.description}</Text></TouchableOpacity>))}</View></View>
      <View style={{ marginTop: 20 }}><Text style={{ fontSize: 20, marginBottom: 8 }}>Admin Upload</Text><TextInput placeholder="Admin username" value={username} onChangeText={setUsername} style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} /><TextInput placeholder="Admin password" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} /><TextInput placeholder="Title" value={title} onChangeText={setTitle} style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} /><TextInput placeholder="Description" value={desc} onChangeText={setDesc} style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} />{typeof document !== 'undefined' && (<input type="file" accept="image/*,video/*" onChange={webPickFile} style={{ marginBottom: 8 }} />)}<Button title="Upload (requires admin credentials)" onPress={upload} /></View>
    </ScrollView>
  );
}