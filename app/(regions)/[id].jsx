import React, { useEffect, useRef, useState } from 'react';
import { I18nManager, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomePageHeader from '@/components/HomePageHeader';
import { router, useGlobalSearchParams } from 'expo-router';
import CustomTopTabs from '../../components/CustomTopTabs';
import { useUnitsStore } from '../../store/units.store';
import CustomButton from '@/components/CustomButton';
import { FlashList } from '@shopify/flash-list';
import UnitShareCard from '../../components/UnitCardShare';
import UnitApartmentCard from '../../components/UnitCardApartment';
import EmptyScreen from '@/components/EmptyScreen';
import { ActivityIndicator } from 'react-native-web';
import { Feather } from '@expo/vector-icons';

// Top Tab Items
const topTabItems = [
  {
    id: 'shares',
    title: 'الأسهم التنظيمية',
  },
  {
    id: 'apartments',
    title: 'العقارات',
  },
];

// Region With Id
const RegionWithId = () => {
  // Get Region Id
  const { id } = useGlobalSearchParams();

  // Get All Shares and Apartments For Region
  const {
    getAllSharesForRegion,
    getAllApartmentsForRegion,
    sharesResponse,
    apartmentsResponse,
    sharesLoading,
    sharesRecords,
    apartmentsRecords,
    apartmentsLoading,
  } = useUnitsStore();

  // Get Shares Based On Region
  const filtersParams = useRef({
    page: 1,
  });
  const getSharesBasedOnRegion = async (firstLoad = false) => {
    const shares = await getAllSharesForRegion(id, filtersParams.current, firstLoad);
  };

  // Get Apartments Based On Region
  const getApartmentsBasedOnRegion = async (firstLoad = false) => {
    const apartments = await getAllApartmentsForRegion(id, filtersParams.current, firstLoad);
  };

  // Handle Tab Change
  const [tabId, setTabId] = useState('shares');
  const handleTabChange = (tabId) => {
    filtersParams.current.page = 1;
    setTabId(tabId);
  };

  // Handle End Reached
  const handleEndReached = () => {
    console.log(sharesResponse.next_page_url, 'sharesResponse');
    if (tabId == 'shares') {
      if (sharesResponse.next_page_url) {
        filtersParams.current.page++;
        getSharesBasedOnRegion();
      }
    } else {
      if (apartmentsResponse.next_page_url) {
        filtersParams.current.page++;
        getApartmentsBasedOnRegion();
      }
    }
  };

  // Handle Refresh
  const handleRefresh = () => {
    filtersParams.current.page = 1;
    if (tabId == 'shares') {
      getSharesBasedOnRegion(true);
    } else {
      getApartmentsBasedOnRegion(true);
    }
  };

  const topTabAction = useRef({
    title: tabId == 'share' ? 'إضافة سهم تنظيمي' : 'إضافة عقار',
  });

  // Get Shares and Apartments Based On Region UseEffect
  useEffect(() => {
    filtersParams.current.page = 1;
    getSharesBasedOnRegion(true);
    getApartmentsBasedOnRegion(true);
  }, [tabId]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <HomePageHeader hasActions={true} customActions={true}>
        <View className={`${I18nManager.isRTL ? 'rtl-view' : 'ltr-view'} items-center gap-2`}>
          <View className="mt-2">
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/search',
                })
              }
              className="flex-row items-center rounded-full p-2">
              <Feather name="search" size={20} color="#a47764" />
            </TouchableOpacity>
          </View>
          <CustomButton
            containerStyles={'mt-3'}
            hasGradient={true}
            colors={['#633e3d', '#774b46', '#8d5e52', '#a47764', '#bda28c']}
            title={tabId == 'shares' ? 'إضافة سهم تنظيمي' : 'إضافة عقار'}
            positionOfGradient={'leftToRight'}
            textStyles={'text-white text-sm'}
            handleButtonPress={() => {
              router.push(`/(create)/${tabId}`);
            }}
          />
        </View>
      </HomePageHeader>
      <View className="flex-1">
        <CustomTopTabs topTabItems={topTabItems} onTabChange={handleTabChange}>
          <View className="flex-1 px-4 pt-4">
            <FlashList
              data={tabId == 'shares' ? sharesRecords : apartmentsRecords}
              estimatedItemSize={350}
              refreshing={sharesLoading}
              onRefresh={handleRefresh}
              renderItem={({ item }) =>
                tabId == 'shares' ? (
                  <UnitShareCard item={item} />
                ) : (
                  <UnitApartmentCard item={item} />
                )
              }
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.5}
              ListEmptyComponent={() =>
                sharesLoading || apartmentsLoading ? (
                  <Text />
                ) : (
                  <EmptyScreen title="لا يوجد عروض للبيع أو للشراء" />
                )
              }
            />
          </View>
        </CustomTopTabs>
      </View>
    </SafeAreaView>
  );
};

export default RegionWithId;
