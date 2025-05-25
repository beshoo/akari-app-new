import '../global.css';
import { Redirect, router, Stack, usePathname } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getSecureStore } from '@/composables/secure.store';
import { useEffect, useRef, useState, createContext } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { I18nManager, Image, Linking, Text, View, PermissionsAndroid } from 'react-native';
import { createNotifications, notify } from 'react-native-notificated';
import { useAuthStore } from '@/store/auth.store';
import { BottomSheetModalProvider, BottomSheetModal } from '@gorhom/bottom-sheet';
import NetInfo from '@react-native-community/netinfo';
import CustomBottomModalSheet from '@/components/CustomBottomModalSheet';
import images from '~/constants/images';
import * as SecureStore from 'expo-secure-store';
import CustomButton from '@/components/CustomButton.jsx';
import * as Application from 'expo-application';
import { useAdminStore } from '@/store/admin.store';
/* ======================= handle notifications ======================= */
import messaging from '@react-native-firebase/messaging';
import { useNotificationsStore } from '@/store/notifications.store';
import { useVersionsStore } from '@/store/versions.store';
/* ======================= handle notifications ======================= */
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FAB, MD3LightTheme as DefaultTheme, PaperProvider } from 'react-native-paper';

// Create notification permission context
export const NotificationPermissionContext = createContext({
  requestNotificationPermission: () => {},
  disableNotificationPermission: () => {},
  hasPermission: false,
});

const theme = {
  ...DefaultTheme,
  fonts: {
    titleLarge: { fontFamily: 'Cairo-Bold' },
    titleMedium: { fontFamily: 'Cairo-Bold' },
    titleSmall: { fontFamily: 'Cairo-Bold' },
    bodyLarge: { fontFamily: 'Cairo-Regular' },
    bodyMedium: { fontFamily: 'Cairo-Regular' },
    bodySmall: { fontFamily: 'Cairo-Regular' },
    labelLarge: { fontFamily: 'Cairo-Bold' },
    labelMedium: { fontFamily: 'Cairo-Bold' },
    labelSmall: { fontFamily: 'Cairo-Bold' },
  },
};

const { NotificationsProvider, useNotifications, ...events } = createNotifications({
  isNotch: true,
  defaultStylesSettings: {
    globalConfig: {
      titleFamily: 'Cairo-Bold',
      descriptionFamily: 'Cairo-Bold',
      titleSize: 14,
      descriptionSize: 10,
      borderType: 'accent',
      defaultIconType: 'monochromatic',
      multiline: 3,
    },
    successConfig: {
      accentColor: '#a47764',
    },
  },
});

// Disable RTL support
// I18nManager.allowRTL(true);
// I18nManager.forceRTL(true);

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: '(auth)',
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Cairo-Black': require('@/assets/fonts/Cairo-Black.ttf'),
    'Cairo-ExtraBold': require('@/assets/fonts/Cairo-ExtraBold.ttf'),
    'Cairo-ExtraLight': require('@/assets/fonts/Cairo-ExtraLight.ttf'),
    'Cairo-Light': require('@/assets/fonts/Cairo-Light.ttf'),
    'Cairo-Medium': require('@/assets/fonts/Cairo-Medium.ttf'),
    'Cairo-Regular': require('@/assets/fonts/Cairo-Regular.ttf'),
    'Cairo-SemiBold': require('@/assets/fonts/Cairo-SemiBold.ttf'),
    'Cairo-Bold': require('@/assets/fonts/Cairo-Bold.ttf'),
  });
  const hasToken = useRef(false);
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const token = await getSecureStore('token');
      setIsAuthenticated(!!token);
    };
    checkAuth();
  }, [pathname]);

  console.log(isAuthenticated, 'isAuthenticated', pathname);
  const { setNotificationCount } = useNotificationsStore();
  const { getAuthData } = useAuthStore();
  const { updateFirebase } = useAdminStore();

  useEffect(() => {
    const initialize = async () => {
      SplashScreen.hideAsync();
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
      const token = await getSecureStore('token');
      if (token) {
        hasToken.current = true;
        const response = await getAuthData();
        await SecureStore.setItemAsync('user', JSON.stringify(response));
      }
    };
    initialize();
  }, []);

  // ======================= handle notifications =======================

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
    return { enabled, authStatus }; // Return status
  };

  useEffect(() => {
    const handlePermissions = async () => {
      const { enabled, authStatus } = await requestUserPermission(); // Await the permission result
      if (enabled) {
        messaging()
          .getToken()
          .then((token) => {
            console.log('token ========================= 1====================== firebase token');
            console.log(token);
            if (token) {
              // Check if token exists before updating
              updateFirebase({ firebase: token, version: Application.nativeBuildVersion });
            }
            console.log('token ========================= 1====================== firebase token');
          });
      } else {
        console.log('no permission', authStatus);
      }
    };

    handlePermissions(); // Call the async function

    messaging()
      .getInitialNotification()
      .then(async (remoteMessage) => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification
          );

          // Add the same routing logic as onNotificationOpenedApp
          const data = remoteMessage.data;
          if (data?.notification_type == 'share') {
            router.push(`/(shares)/${data?.content}`);
          } else if (data?.notification_type == 'apartment') {
            router.push(`/(apartments)/${data?.content}`);
          } else if (data?.notification_type == 'url') {
            await Linking.openURL(data?.content as string);
          } else {
            router.push('/notifications');
          }
        }
      });

    messaging().onNotificationOpenedApp(async (remoteMessage) => {
      const data = remoteMessage.data;
      if (data?.notification_type == 'share') {
        router.push(`/(shares)/${data?.content}`);
      } else if (data?.notification_type == 'apartment') {
        router.push(`/(apartments)/${data?.content}`);
      } else if (data?.notification_type == 'url') {
        await Linking.openURL(data?.content as string);
      } else {
        router.push('/notifications');
      }
    });

    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Message handled in the background!', remoteMessage);
      const { data } = remoteMessage;
      if (data?.notification_type == 'share') {
        router.push(`/(shares)/${data?.content}`);
      } else if (data?.notification_type == 'apartment') {
        router.push(`/(apartments)/${data?.content}`);
      } else if (data?.notification_type == 'url') {
        await Linking.openURL(data?.content as string);
      } else {
        router.push('/notifications');
      }
    });

    const unscubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('onMessage ========================= 1======================', remoteMessage);
      const data = remoteMessage.data;
      notify('success', {
        params: {
          title: String(data?.title ?? 'لديك إشعار جديد'), // Ensure title is string
        },
      });
      setNotificationCount(1);
    });

    return unscubscribe;
  }, []);

  // ======================= handle notifications =======================
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [isConnected, setConnected] = useState(true);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: any) => {
      setConnected(state.isConnected);
      if (!state.isConnected) {
        if (bottomSheetModalRef.current) {
          bottomSheetModalRef.current.present();
        }
      } else {
        if (bottomSheetModalRef.current) {
          bottomSheetModalRef.current.dismiss();
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleReconnect = () => {
    console.log('handleReconnect');
    const unsubscribe = NetInfo.addEventListener((state: any) => {
      setConnected(state.isConnected);
      if (!state.isConnected) {
        if (bottomSheetModalRef.current) {
          bottomSheetModalRef.current.present();
        }
      } else {
        if (bottomSheetModalRef.current) {
          bottomSheetModalRef.current.dismiss();
        }
      }
    });

    return () => unsubscribe();
  };

  const updateVersionRef = useRef<BottomSheetModal>(null);
  const [serverAppVersion, setServerAppVersion] = useState(null);
  const { getVersion, setVersion, showAlertFunction } = useVersionsStore();
  const [showUpdate, setShowUpdate] = useState(false);

  // FAB State
  const [fabOpen, setFabOpen] = useState(false);
  const onStateChange = ({ open }: { open: boolean }) => setFabOpen(open);
  const insets = useSafeAreaInsets(); // Get safe area insets

  async function onFetchUpdateAsync() {
    console.log('onFetchUpdateAsync');
    const response = await getVersion();
    console.log('===================================');
    console.log(response, 'response');
    const currentBuildVersion = Number(Application.nativeBuildVersion) ?? 0; // Default to '0' if null
    console.log(currentBuildVersion, 'nativeBuildVersion');
    console.log('===================================');
    // setVersion(response.version);

    // Ensure updateVersionRef.current exists before calling methods
    if (updateVersionRef.current) {
      // Check if ref is not null
      if (Number(response.version) > currentBuildVersion) {
        updateVersionRef.current.present();
      } else if (Number(response.version) < currentBuildVersion) {
        setVersion(currentBuildVersion);
        updateVersionRef.current.dismiss();
      } else {
        updateVersionRef.current.dismiss();
      }
    }
  }

  useEffect(() => {
    onFetchUpdateAsync();
  }, [showUpdate]);

  // Function to request notification permission that can be called from any screen
  const requestNotificationPermission = async () => {
    try {
      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      setHasNotificationPermission(
        status === PermissionsAndroid.RESULTS.GRANTED
      );
      return status;
    } catch (error) {
      console.log('Error requesting notification permission:', error);
      return null;
    }
  };

  // Function to disable notification permissions
  const disableNotificationPermission = async () => {
    try {
      // For Android, we can't programmatically revoke permissions
      // We'll direct users to app settings instead
      await Linking.openSettings();
      // After returning from settings, check if permission was revoked
      const status = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      setHasNotificationPermission(status);
      return !status;
    } catch (error) {
      console.log('Error disabling notification permission:', error);
      return false;
    }
  };

  // Check initial permission status on first render
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const status = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        setHasNotificationPermission(status);
      } catch (error) {
        console.log('Error checking notification permission:', error);
      }
    };
    
    checkPermission();
  }, []);

  if (!fontsLoaded) {
    return <Redirect href="/(auth)/index" />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <NotificationPermissionContext.Provider 
          value={{ 
            requestNotificationPermission, 
            disableNotificationPermission,
            hasPermission: hasNotificationPermission 
          }}>
          <NotificationsProvider>
            <BottomSheetModalProvider>
              <CustomBottomModalSheet
                bottomSheetModalRef={bottomSheetModalRef}
                handleSheetChanges={() => {}}
                handleDismissModalPress={() => {}}>
                <View className="h-full items-center justify-center">
                  <Image
                    className="h-[200px] w-[200px]"
                    resizeMode="contain"
                    source={images.connection_lost}
                  />

                  <Text className="mt-4 font-psemibold text-xl">
                    حدث خطأ ما أثناء الاتصال بالانترنت
                  </Text>
                  <Text className="text-md mt-4 font-psemibold text-zinc-400">
                    يرجى التحقق من اتصالك بالانترنت
                  </Text>
                  <CustomButton
                    hasGradient={true}
                    colors={['#633e3d', '#774b46', '#8d5e52', '#a47764', '#bda28c']}
                    title={'إعادة الاتصال'}
                    containerStyles={'flex-grow'}
                    positionOfGradient={'leftToRight'}
                    textStyles={'text-white'}
                    buttonStyles={'h-[45px] mt-4'}
                    onPress={handleReconnect}
                    handleButtonPress={handleReconnect}
                    disabled={false}
                    loading={false}
                  />
                </View>
              </CustomBottomModalSheet>
              <CustomBottomModalSheet
                bottomSheetModalRef={updateVersionRef}
                handleSheetChanges={() => {}}
                handleDismissModalPress={() => {}}>
                <View className="h-full items-center justify-center">
                  <Image
                    className="h-[200px] w-[200px]"
                    resizeMode="contain"
                    source={images.update}
                  />

                  <Text className="mt-4 font-psemibold text-xl">يوجد تحديث جديد</Text>
                  <Text className="text-md mt-4 font-psemibold text-zinc-400">
                    يرجى التحديث لأحدث إصدار
                  </Text>
                  <View className={`${I18nManager.isRTL ? 'rtl-view' : 'ltr-view'} gap-4 px-4 pb-4`}>
                    <CustomButton
                      hasGradient={true}
                      colors={['#633e3d', '#774b46', '#8d5e52', '#a47764', '#bda28c']}
                      title={'تحديث الآن'}
                      containerStyles={'flex-grow'}
                      positionOfGradient={'leftToRight'}
                      textStyles={'text-white'}
                      buttonStyles={'h-[45px] mt-4'}
                      onPress={() =>
                        Linking.openURL(
                          'https://play.google.com/store/apps/details?id=akari.versetech.net'
                        )
                      }
                      handleButtonPress={() =>
                        Linking.openURL(
                          'https://play.google.com/store/apps/details?id=akari.versetech.net'
                        )
                      }
                      disabled={false}
                      loading={false}
                    />
                    <CustomButton
                      hasGradient={true}
                      colors={['#314158', '#62748E', '#90A1B9', '#90A1B9', '#90A1B9']}
                      title={'تحديث لاحقا'}
                      containerStyles={'flex-grow'}
                      positionOfGradient={'leftToRight'}
                      textStyles={'text-white'}
                      buttonStyles={'h-[45px] mt-4'}
                      onPress={() => {
                        if (updateVersionRef.current) {
                          updateVersionRef.current.dismiss();
                        }
                      }}
                      handleButtonPress={() => {
                        if (updateVersionRef.current) {
                          updateVersionRef.current.dismiss();
                        }
                      }}
                      disabled={false}
                      loading={false}
                    />
                  </View>
                </View>
              </CustomBottomModalSheet>

              <Stack initialRouteName={hasToken.current ? '(tabs)' : '(auth)'}>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="(tabs)"
                  options={{
                    headerShown: false,
                  }}
                />
                <Stack.Screen name="modal" options={{ title: 'Modal', presentation: 'modal' }} />
                <Stack.Screen name="notifications" options={{ headerShown: false }} />
                <Stack.Screen name="search" options={{ headerShown: false }} />
                <Stack.Screen name="posts" options={{ headerShown: false }} />
                <Stack.Screen name="(regions)/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="(shares)/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="(apartments)/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="(contact)/index" options={{ headerShown: false }} />
                <Stack.Screen name="(create)/shares" options={{ headerShown: false }} />
                <Stack.Screen name="(create)/apartments" options={{ headerShown: false }} />
                <Stack.Screen name="(edit)/share/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="(edit)/apartment/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="(more_screens)/features" options={{ headerShown: false }} />
                <Stack.Screen name="(more_screens)/support" options={{ headerShown: false }} />
                <Stack.Screen name="(more_screens)/profile" options={{ headerShown: false }} />
                <Stack.Screen name="(more_screens)/privacy" options={{ headerShown: false }} />
                <Stack.Screen name="(more_screens)/terms" options={{ headerShown: false }} />
                <Stack.Screen name="(more_screens)/premium" options={{ headerShown: false }} />
                <Stack.Screen name="(admin)/users_list" options={{ headerShown: false }} />
                <Stack.Screen name="(admin)/bulk_messages" options={{ headerShown: false }} />
                <Stack.Screen name="SearchResults" options={{ headerShown: false }} />
              </Stack>
              {/* FAB Group */}
              <FAB.Group
                open={fabOpen}
                visible={isAuthenticated && pathname == '/'} // Show FAB only when authenticated
                icon={fabOpen ? 'close' : 'plus'}
                color="#FFF"
                label={'إضافة عرض'}
                rippleColor={'#00000060'}
                actions={[
                  {
                    icon: 'home-plus-outline', // Or choose another appropriate icon
                    label: 'إضافة عقار',
                    onPress: () => router.push('/(create)/apartments'),
                    style: { backgroundColor: '#a47764' }, // Optional: Style the action button
                    labelTextColor: 'white', // Optional: Style the label
                    color: 'white', // Optional: Style the icon color
                  },
                  {
                    icon: 'home-outline', // Or choose another appropriate icon
                    label: 'إضافة سهم تنظيمي',
                    onPress: () => router.push('/(create)/shares'),
                    style: { backgroundColor: '#a47764' }, // Optional: Style the action button
                    labelTextColor: 'white', // Optional: Style the label
                    color: 'white', // Optional: Style the icon color
                  },
                ]}
                onStateChange={onStateChange}
                fabStyle={{
                  backgroundColor: '#a47764',
                  marginBottom: (insets.bottom || 0) + 90,
                  marginRight: I18nManager.isRTL ? undefined : 16,
                  marginLeft: I18nManager.isRTL ? 16 : undefined,
                  borderWidth: 4,
                  borderColor: '#a4776450',
                }}
                backdropColor="#00000080" // Kept transparent backdrop
                style={{}}
              />
            </BottomSheetModalProvider>
          </NotificationsProvider>
        </NotificationPermissionContext.Provider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
