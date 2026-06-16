import { Tabs } from 'expo-router';
import { Home, Users, LayoutGrid, Settings } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function TabLayout() {
  const { config } = useAuthStore();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTransparent: true,
        headerBackground: () => (
          <BlurView tint="light" intensity={80} style={StyleSheet.absoluteFill} />
        ),
        headerTitleStyle: {
          fontWeight: '800',
          color: '#0f172a',
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          height: 64,
          borderRadius: 32,
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: 'transparent',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
        },
        tabBarBackground: () => (
          <View style={styles.blurContainer}>
            <BlurView tint="light" intensity={90} style={StyleSheet.absoluteFill} />
            <View style={styles.glassBorder} />
          </View>
        ),
        tabBarItemStyle: {
          paddingVertical: 10,
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#94a3b8',
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: config?.terminology.members || 'Members',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  glassBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  }
});
