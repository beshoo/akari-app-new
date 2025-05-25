import { router, useGlobalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Image,
  ScrollView,
  Share,
  I18nManager,
  Alert,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUnitsStore } from '../../store/units.store';
import CustomHeadWithBackButton from '../../components/CustomHeadWithBackButton';
import { AntDesign } from '@expo/vector-icons';
import CustomImageSlider from '@/components/CustomImageSlider';
import CustomButton from '@/components/CustomButton';
import icons from '../../constants/icons';
import { getSecureStoreNoAsync } from '@/composables/secure.store';
import CustomBottomSheet from '@/components/CustomBottomSheet';
import DeleteItem from '../../components/DeleteItem';
import CustomBottomModalSheet from '@/components/CustomBottomModalSheet';
import { useAdminStore } from '../../store/admin.store';
import AdminActionItem from '../../components/AdminActionItem';
import CustomLinear from '../../components/CustomLinear';

// Imports for Reaction Functionality
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useReactionStore } from '@/store/reaction.store';

// Animated Emoji Button Component
const EmojiButton = ({ emoji, onPress, isSelected }) => {
  const scale = useSharedValue(1);
  const backgroundColor = useSharedValue(isSelected ? '#e5e7eb' : '#f3f4f6');

  useEffect(() => {
    scale.value = withSpring(isSelected ? 1.2 : 1);
    backgroundColor.value = withTiming(isSelected ? '#d1d5db' : '#f3f4f6', { duration: 150 });
  }, [isSelected, scale, backgroundColor]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      backgroundColor: backgroundColor.value,
    };
  });

  return (
    <TouchableOpacity onPress={onPress}>
      <Animated.View className="rounded-full p-2" style={animatedStyle}>
        <Text className="text-xl">{emoji}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Available Reactions
const availableReactions = [
  { value: 'like', icon: '👍🏼', title: 'أعجبني' },
  { value: 'love', icon: '❤️', title: 'أحببته' },
  { value: 'wow', icon: '😮', title: 'أدهشني' },
  { value: 'sad', icon: '😢', title: 'احزنني' },
  { value: 'angry', icon: '😠', title: 'أغضبني' },
];

const UnitDetails = ({
  item,
  displayedReaction,
  showReactions,
  onLikePress,
  onLikeLongPress,
  onReactionSelect,
  onOpenReactionsModal,
  onDismissReactions,
}) => {
  const user = getSecureStoreNoAsync('user');

  return (
    <View className="px-4 py-4">
      {/* Reaction UI Integrated Here */}
      <View className="mb-4">
        {item?.reaction_counts?.total_count > 0 && (
          <TouchableOpacity onPress={onOpenReactionsModal} activeOpacity={0.7}>
            <View
              className={`${I18nManager.isRTL ? 'rtl-view' : 'ltr-view'} mb-2 items-center justify-between px-1 py-1`}>
              <View className={`${I18nManager.isRTL ? 'rtl-view' : 'ltr-view'} items-center gap-1`}>
                <View
                  className={`${I18nManager.isRTL ? 'rtl-view' : 'ltr-view'} items-center gap-1`}>
                  {item?.reaction_counts?.like_count > 0 && (
                    <Text>{item?.reaction_counts?.like_count > 0 ? '👍🏼' : ''}</Text>
                  )}
                  {item?.reaction_counts?.angry_count > 0 && (
                    <Text>{item?.reaction_counts?.angry_count > 0 ? '😠' : ''}</Text>
                  )}
                  {item?.reaction_counts?.love_count > 0 && (
                    <Text>{item?.reaction_counts?.love_count > 0 ? '❤️' : ''}</Text>
                  )}
                  {item?.reaction_counts?.sad_count > 0 && (
                    <Text>{item?.reaction_counts?.sad_count > 0 ? '😢' : ''}</Text>
                  )}
                  {item?.reaction_counts?.wow_count > 0 && (
                    <Text>{item?.reaction_counts?.wow_count > 0 ? '😮' : ''}</Text>
                  )}
                </View>
                <Text>{item?.reaction_counts?.total_count}</Text>
              </View>
              <View>
                <Text className="font-psemibold text-sm text-gray-600">{item?.views} مشاهدة</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {showReactions && (
          <>
            {/* Overlay to dismiss reactions when touching outside */}
            <Pressable
              className="absolute inset-0 z-10"
              style={{
                position: 'absolute',
                top: -1000,
                bottom: -1000,
                left: -1000,
                right: -1000,
              }}
              onPress={onDismissReactions}
            />
            <Animated.View
              className="absolute bottom-12 left-2 z-20 flex-row items-center gap-2 rounded-full border border-gray-300 bg-white p-1 shadow-lg drop-shadow-sm"
              style={{
                elevation: 5,
                transform: [{ translateX: I18nManager.isRTL ? -10 : 10 }],
                bottom: 50, // Adjust as needed
              }}>
              {availableReactions.map((reaction) => (
                <EmojiButton
                  key={reaction.value}
                  emoji={reaction.icon}
                  onPress={() => onReactionSelect(reaction.value)}
                />
              ))}
            </Animated.View>
          </>
        )}

        <TouchableOpacity
          onPress={onLikePress}
          onLongPress={onLikeLongPress}
          delayLongPress={200}
          className="relative my-2 flex-1 items-center justify-center rounded-md border border-gray-200 py-3 hover:bg-gray-100 active:bg-gray-200">
          {(() => {
            const reactionObj = availableReactions.find((r) => r.value === displayedReaction);
            if (reactionObj) {
              return (
                <View
                  className={`${I18nManager.isRTL ? 'rtl-view' : 'ltr-view'} flex flex-row items-center justify-center gap-2`}>
                  <Text className="text-lg">{reactionObj.icon}</Text>
                  <Text className="text-md font-psemibold capitalize text-gray-700">
                    {reactionObj.title}
                  </Text>
                </View>
              );
            }
            return (
              <View
                className={`${I18nManager.isRTL ? 'rtl-view' : 'ltr-view'} flex flex-row items-center justify-center gap-2`}>
                <AntDesign name="like2" size={18} color="#374151" />
                <Text className="text-md mt-1 font-psemibold text-gray-700">إعجاب</Text>
              </View>
            );
          })()}
        </TouchableOpacity>
      </View>

      <View className={`rounded-lg border border-toast-100 p-4`}>
        <Text className="font-psemibold text-lg text-black">تفاصيل العقار</Text>
        <Text className="font-pregular text-sm text-zinc-600">
          {item?.transaction_type === 'buy' ? (
            <Text className={'font-pregular text-base text-zinc-500'}>
              نرغب بشراء عقار في {item?.sector?.code?.view_code} بكمية {item?.equity} حصة سهمية بسعر{' '}
              {item?.price} ل.س  في منطقة {item?.region?.name}
            </Text>
          ) : (
            <Text className={'font-pregular text-base text-zinc-500'}>
              نرغب ببيع عقار في {item?.sector?.code?.view_code} بكمية {item?.equity} حصة سهمية بسعر{' '}
              {item?.price} ل.س  في منطقة {item?.region?.name}
            </Text>
          )}
        </Text>
      </View>
      <View className="mt-4 flex-row gap-2">
        <View className="flex-1 rounded-lg border border-toast-100 p-4">
          <Image source={icons.price} className="mb-1 h-7 w-7" tintColor="#a47764" />
          <Text className="font-pmedium text-base text-zinc-600">سعر العقار</Text>
          <Text
            className={`font-pregular text-sm text-zinc-600 ${I18nManager.isRTL ? 'text-left' : 'text-right'}`}>
            {item?.price} ل.س 
          </Text>
        </View>
        <View className="flex-1 rounded-lg border border-toast-100 p-4">
          <Image source={icons.quantity} className="mb-1 h-7 w-7" tintColor="#a47764" />
          <Text className="font-pmedium text-base text-zinc-600">اسهم العقار</Text>
          <Text
            className={`font-pregular text-sm text-zinc-600 ${I18nManager.isRTL ? 'text-left' : 'text-right'}`}>
            {item?.equity}
          </Text>
        </View>
      </View>
      <View className="mt-4 flex-row gap-2">
        <View className="flex-1 rounded-lg border border-toast-100 p-4">
          <Image source={icons.location} className="mb-1 h-7 w-7" tintColor="#a47764" />
          <Text className="font-pmedium text-base text-zinc-600">المنطقة</Text>
          <Text className="font-pregular text-sm text-zinc-600">{item?.region?.name}</Text>
        </View>
        <View className="flex-1 rounded-lg border border-toast-100 p-4">
          <Image source={icons.sector} className="mb-1 h-7 w-7" tintColor="#a47764" />
          <Text className="font-pmedium text-base text-zinc-600">القطاع</Text>
          <Text className="font-pregular text-sm text-zinc-600">{item?.sector?.code?.name}</Text>
        </View>
        <View className="flex-1 rounded-lg border border-toast-100 p-4">
          <Image source={icons.section_number} className="mb-1 h-7 w-7" tintColor="#a47764" />
          <Text className="font-pmedium text-base text-zinc-600">رقم المقسم</Text>
          <Text className="font-pregular text-sm text-zinc-600">
            {item?.sector?.code?.view_code}
          </Text>
        </View>
      </View>
      {/* apartment details */}
      <View className="mt-4 flex-row gap-2">
        <View className="flex-1 rounded-lg border border-toast-100 p-4">
          <Image source={icons.area} className="mb-1 h-7 w-7" tintColor="#a47764" />
          <Text className="font-pmedium text-base text-zinc-600">المساحة</Text>
          <Text
            className={`font-pregular text-sm text-zinc-600 ${I18nManager.isRTL ? 'text-left' : 'text-right'}`}>
            {item?.area} م2
          </Text>
        </View>
        <View className="flex-1 rounded-lg border border-toast-100 p-4">
          <Image source={icons.floor} className="mb-1 h-7 w-7" tintColor="#a47764" />
          <Text className="font-pmedium text-base text-zinc-600">الطابق</Text>
          <Text
            className={`font-pregular text-sm text-zinc-600 ${I18nManager.isRTL ? 'text-left' : 'text-right'}`}>
            {item?.floor}
          </Text>
        </View>
        <View className="flex-1 rounded-lg border border-toast-100 p-4">
          <Image source={icons.direction} className="mb-1 h-7 w-7" tintColor="#a47764" />
          <Text className="font-pmedium text-base text-zinc-600">اتجاه العقار</Text>
          <Text
            className={`font-pregular text-sm text-zinc-600 ${I18nManager.isRTL ? 'text-left' : 'text-right'}`}>
            {item?.direction?.name}
          </Text>
        </View>
      </View>
      {/* owner details */}
      {(user?.privilege == 'admin' || user?.user_id == item?.user?.id) && (
        <View className="mt-4 flex-row gap-2">
          <View className="flex-1 rounded-lg border border-toast-100 p-4">
            <Image source={icons.owner} className="mb-1 h-7 w-7" tintColor="#a47764" />
            <Text className="font-pmedium text-base text-zinc-600">الجهة العارضة</Text>
            <Text
              className={`font-pregular text-sm text-zinc-600 ${I18nManager.isRTL ? 'text-left' : 'text-right'}`}>
              {item?.owner_name}
            </Text>
          </View>
        </View>
      )}
      {/* extra details */}
      <View className="mt-4 gap-2 rounded-lg border border-toast-100 p-4 ">
        <View className=" mb-3">
          <Text className="font-psemibold text-lg text-black">تفاصيل إضافية</Text>
        </View>
        <View className="flex-row">
          <View className="flex-1 rounded-lg">
            <Image source={icons.rooms} className="mb-1 h-7 w-7" tintColor="#a47764" />
            <Text className="font-pmedium text-base text-zinc-600">عدد الغرف</Text>
            <Text
              className={`font-pregular text-sm text-zinc-600 ${I18nManager.isRTL ? 'text-left' : 'text-right'}`}>
              {item?.rooms_count || 'غير موجود'}
            </Text>
          </View>
          <View className="flex-1 rounded-lg">
            <Image source={icons.salons} className="mb-1 h-7 w-7" tintColor="#a47764" />
            <Text className="font-pmedium text-base text-zinc-600">عدد الصالونات</Text>
            <Text
              className={`font-pregular text-sm text-zinc-600 ${I18nManager.isRTL ? 'text-left' : 'text-right'}`}>
              {item?.salons_count || 'غير موجود'}
            </Text>
          </View>
        </View>
        <View className="flex-row gap-2">
          <View className="flex-1 rounded-lg">
            <Image source={icons.balcons} className="mb-1 h-7 w-7" tintColor="#a47764" />
            <Text className="font-pmedium text-base text-zinc-600">عدد البلكونات</Text>
            <Text
              className={`font-pregular text-sm text-zinc-600 ${I18nManager.isRTL ? 'text-left' : 'text-right'}`}>
              {item?.balcony_count || 'غير موجود'}
            </Text>
          </View>
          <View className="flex-1 rounded-lg">
            <Image source={icons.terrace} className="mb-1 h-7 w-7" tintColor="#a47764" />
            <Text className="font-pmedium text-base text-zinc-600">تراس</Text>
            <Text
              className={`font-pregular text-sm text-zinc-600 ${I18nManager.isRTL ? 'text-left' : 'text-right'}`}>
              {item?.is_taras == 1 ? 'موجود' : 'غير موجود'}
            </Text>
          </View>
        </View>
        <View className="flex-row gap-2">
          <View className="flex-1 rounded-lg">
            <Image source={icons.apartment_status} className="mb-1 h-7 w-7" tintColor="#a47764" />
            <Text className="font-pmedium text-base text-zinc-600">حالة العقار</Text>
            <Text
              className={`font-pregular text-sm text-zinc-600 ${I18nManager.isRTL ? 'text-left' : 'text-right'}`}>
              {item?.apartment_status?.name}
            </Text>
          </View>
          <View className="flex-1 rounded-lg">
            <Image source={icons.building_type} className="mb-1 h-7 w-7" tintColor="#a47764" />
            <Text className="font-pmedium text-base text-zinc-600">نوع العقار</Text>
            <Text
              className={`font-pregular text-sm text-zinc-600 ${I18nManager.isRTL ? 'text-left' : 'text-right'}`}>
              {item?.apartment_type?.name}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const ApartmentDetails = () => {
  // Get the id from the url
  const { id } = useGlobalSearchParams();

  // get Current User
  const user = getSecureStoreNoAsync('user');

  // init store
  const {
    getApartmentDetails,
    apartmentDetailsResponse,
    apartmentDetailsLoading,
    deleteApartment,
    deleteApartmentLoading,
  } = useUnitsStore();

  /*================== admin actions ==================*/
  const {
    approveUnitLoading,
    approveUnit,
    closeUnitLoading,
    closeUnit,
    deleteUnitLoading,
    deleteUnit,
  } = useAdminStore();

  /*================== Reaction Functionality ==================*/
  const { setReactions, removeReaction } = useReactionStore();
  const [showReactions, setShowReactions] = useState(false);
  const [displayedReaction, setDisplayedReaction] = useState(null);
  const reactionsBottomSheetModalRef = useRef(null); // For detailed reaction list

  useEffect(() => {
    if (apartmentDetailsResponse) {
      setDisplayedReaction(apartmentDetailsResponse.current_user_reaction);
    }
  }, [apartmentDetailsResponse?.current_user_reaction]);

  // Function to update reactions locally
  const updateLocalReactions = (reactionSummary) => {
    if (apartmentDetailsResponse && reactionSummary) {
      // Update the reaction counts without refetching the entire apartment
      const updatedApartment = {
        ...apartmentDetailsResponse,
        reaction_counts: reactionSummary,
      };
      // Update the store directly
      useUnitsStore.setState((state) => ({
        ...state,
        apartmentDetailsResponse: updatedApartment,
      }));
    }
  };

  const handleReactionSelect = async (reaction) => {
    const previousReaction = displayedReaction;
    setDisplayedReaction(reaction); // Optimistic update
    setShowReactions(false);

    const response = await setReactions({
      type: reaction,
      post_type: 'apartment',
      post_id: id,
    });

    if (response) {
      // Update local state with the reaction summary from the response
      updateLocalReactions(response.reaction_summary);
    } else {
      setDisplayedReaction(previousReaction); // Revert on error
    }
  };

  const handleLikePress = () => {
    if (showReactions) {
      handleReactionSelect('like');
      return;
    }

    if (displayedReaction) {
      const previousReaction = displayedReaction;
      setDisplayedReaction(null); // Optimistic update

      removeReaction({
        post_type: 'apartment',
        post_id: id,
      })
        .then((response) => {
          if (response) {
            // Update local state with the reaction summary from the response
            updateLocalReactions(response.reaction_summary);
          } else {
            setDisplayedReaction(previousReaction); // Revert
          }
        })
        .catch(() => {
          setDisplayedReaction(previousReaction); // Revert
        });
    } else {
      setDisplayedReaction('like'); // Optimistic update for 'like'

      setReactions({
        type: 'like',
        post_type: 'apartment',
        post_id: id,
      })
        .then((response) => {
          if (response) {
            // Update local state with the reaction summary from the response
            updateLocalReactions(response.reaction_summary);
          } else {
            setDisplayedReaction(null); // Revert
          }
        })
        .catch(() => {
          setDisplayedReaction(null); // Revert
        });
    }
  };

  const handleLikeLongPress = () => {
    setShowReactions(true);
  };

  const handleOpenReactionsModal = () => {
    reactionsBottomSheetModalRef.current?.present();
  };

  const handleShare = async (item) => {
    console.log(item);
    try {
      const result = await Share.share({
        message: item?.share_button ?? '',
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  const getApartmentDetailsHandler = async () => {
    if (!id) return;
    await getApartmentDetails(id);
  };

  const handleDeleteConfirm = async () => {
    const response = await deleteApartment(id);
    if (response?.success) {
      router.replace('/(tabs)');
      router.dismissAll();
    }
  };

  const bottomSheetModalRef = useRef(null);
  const closeUnitBottomSheetModalRef = useRef(null);
  const deleteUnitBottomSheetModalRef = useRef(null);
  const handleApproveUnit = async () => {
    bottomSheetModalRef.current.present();
  };

  const handleCloseUnit = async () => {
    closeUnitBottomSheetModalRef.current.present();
  };

  const handleApproveUnitConfirm = async () => {
    const response = await approveUnit('apartment', id);
    if (response?.success) {
      getApartmentDetailsHandler();
      bottomSheetModalRef.current.dismiss();
    }
  };

  const handleCloseUnitConfirm = async () => {
    const response = await closeUnit('apartment', id);
    if (response?.success) {
      getApartmentDetailsHandler();
      closeUnitBottomSheetModalRef.current.dismiss();
    }
  };

  const handleDeleteUnit = async () => {
    deleteUnitBottomSheetModalRef.current.present();
  };

  const handleDeleteUnitConfirm = async () => {
    const response = await deleteUnit('apartment', id);
    if (response?.success) {
      router.replace('/(tabs)');
      router.dismissAll();
    }
  };

  useEffect(() => {
    getApartmentDetailsHandler();
  }, [id]);

  return (
    <>
      <CustomBottomModalSheet
        backdropBehave="close"
        enablePanDownToClose={true}
        bottomSheetModalRef={bottomSheetModalRef}
        handleSheetChanges={() => {}}
        snapPoints={['30%']}
        handleDismissModalPress={() => {}}>
        <View className="h-full items-center justify-center">
          <AdminActionItem
            title="الموافقة على الطلب"
            description="هل أنت متاكد من الموافقة على الطلب؟"
            icon={icons.admin_approve}
            color="#3cab3d"
            confirm_color="bg-[#3cab3d]"
            onDeleteConfirm={handleApproveUnitConfirm}
            onClose={() => bottomSheetModalRef.current.dismiss()}
            confirmLoading={approveUnitLoading}
          />
        </View>
      </CustomBottomModalSheet>
      <CustomBottomModalSheet
        backdropBehave="close"
        enablePanDownToClose={true}
        bottomSheetModalRef={closeUnitBottomSheetModalRef}
        handleSheetChanges={() => {}}
        snapPoints={['30%']}
        handleDismissModalPress={() => {}}>
        <View className="h-full items-center justify-center">
          {apartmentDetailsResponse?.closed == 0 ? (
            <AdminActionItem
              title="إتمام الصفقة"
              description="هل أنت متاكد من إتمام الصفقة؟"
              icon={icons.admin_approve}
              color="#314158"
              confirm_color="bg-[#314158]"
              onDeleteConfirm={handleCloseUnitConfirm}
              onClose={() => closeUnitBottomSheetModalRef.current.dismiss()}
              confirmLoading={closeUnitLoading}
            />
          ) : (
            <View className="items-center justify-center">
              <Text className="font-psemibold text-lg text-black">الصفقة مغلقة بالفعل</Text>
            </View>
          )}
        </View>
      </CustomBottomModalSheet>
      <CustomBottomModalSheet
        backdropBehave="close"
        enablePanDownToClose={true}
        bottomSheetModalRef={deleteUnitBottomSheetModalRef}
        handleSheetChanges={() => {}}
        snapPoints={['30%']}
        handleDismissModalPress={() => {}}>
        <View className="h-full items-center justify-center">
          <AdminActionItem
            title="حذف الطلب"
            description="هل أنت متاكد من حذف الطلب؟"
            icon={icons.delete_icon}
            color="#82181A"
            confirm_color="bg-[#82181A]"
            onDeleteConfirm={handleDeleteUnitConfirm}
            onClose={() => deleteUnitBottomSheetModalRef.current.dismiss()}
            confirmLoading={deleteUnitLoading}
          />
        </View>
      </CustomBottomModalSheet>

      {/* Modal for Detailed Reaction Counts */}
      <CustomBottomModalSheet
        backdropBehave="close"
        enablePanDownToClose={true}
        bottomSheetModalRef={reactionsBottomSheetModalRef}
        handleSheetChanges={() => {}}
        snapPoints={['30%', '50%', '70%']}
        handleDismissModalPress={() => {}}>
        <View className="p-4">
          <Text className="mb-4 text-center font-psemibold text-lg">التفاعلات</Text>
          <View className={`flex ${I18nManager.isRTL ? 'rtl-view' : 'ltr-view'} flex-wrap gap-4`}>
            {availableReactions.map((reaction) => {
              const countKey = `${reaction.value}_count`;
              const count = apartmentDetailsResponse?.reaction_counts?.[countKey] || 0;
              if (count > 0) {
                return (
                  <View
                    key={reaction.value}
                    className={`flex ${I18nManager.isRTL ? 'rtl-view' : 'ltr-view'} items-center gap-2 rounded-lg bg-gray-100 p-2`}>
                    <Text className="text-2xl">{count}</Text>
                    <Text className="text-2xl">{reaction.icon}</Text>
                    <Text className="mt-1 font-pmedium text-sm text-gray-700">
                      {reaction.title}
                    </Text>
                  </View>
                );
              }
              return null;
            })}
            {(!apartmentDetailsResponse?.reaction_counts ||
              apartmentDetailsResponse?.reaction_counts?.total_count === 0) && (
              <Text className="w-full text-center font-pregular text-gray-500">
                لا يوجد تفاعلات بعد.
              </Text>
            )}
          </View>
        </View>
      </CustomBottomModalSheet>

      <SafeAreaView className="flex-1">
        {apartmentDetailsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="100" color="#a47764" />
          </View>
        ) : (
          <>
            <CustomHeadWithBackButton
              title="تفاصيل العقار"
              rightIcon={<AntDesign name="sharealt" size={24} color="black" />}
              rightIconPress={() => handleShare(apartmentDetailsResponse)}
              handleButtonPress={() => router.back()}
            />
            <View className={`${I18nManager.isRTL ? 'rtl-view' : 'ltr-view'} justify-between`}>
              <View className="px-4">
                <Text className="font-psemibold text-xl">
                  {apartmentDetailsResponse?.sector?.code?.name} -{' '}
                  {apartmentDetailsResponse?.sector?.code?.view_code}
                </Text>
                <Text className="font-pregular text-sm text-zinc-600">
                  {apartmentDetailsResponse?.region?.name} -{' '}
                  {apartmentDetailsResponse?.post_type == 'share' ? 'أسهم تنظيمية' : 'عقارات'}
                </Text>
                <Text className="font-pregular text-sm text-zinc-600">الرقم المرجعي : {apartmentDetailsResponse?.id}</Text>
              </View>
            </View>
            <ScrollView className="flex-1">
              <View className="flex-1 relative">
                {(user?.privilege == 'admin' || user?.user_id == apartmentDetailsResponse?.user?.id) && (
                  <View className="absolute z-10" style={{ top: 25, left: 20 }}>
                    {apartmentDetailsResponse?.approve == 0 && (
                      <CustomLinear
                        title={apartmentDetailsResponse?.approve == 1 ? 'متاح' : 'قيد المراجعة'}
                        colors={['#e3a001', '#b87005', '#95560b', '#7a460d', '#7a460d']}
                        positionOfGradient="leftToRight"
                        textStyles="text-white !text-xs mt-1"
                        buttonStyles="rounded-lg py-1 px-8"
                      />
                    )}
                  </View>
                )}
                {apartmentDetailsResponse && (
                  <CustomImageSlider
                    images={apartmentDetailsResponse?.photos}
                    height={300}
                    newImages={apartmentDetailsResponse}
                  />
                )}
                <View style={{ marginTop: 20 }}>
                  <UnitDetails
                    item={apartmentDetailsResponse}
                    displayedReaction={displayedReaction}
                    showReactions={showReactions}
                    onLikePress={handleLikePress}
                    onLikeLongPress={handleLikeLongPress}
                    onReactionSelect={handleReactionSelect}
                    onOpenReactionsModal={handleOpenReactionsModal}
                    onDismissReactions={() => setShowReactions(false)}
                  />
                </View>
              </View>
            </ScrollView>
            <View className="p-4">
              {user?.user_id == apartmentDetailsResponse?.user?.id &&
              user?.privilege !== 'admin' ? (
                <View className={`gap-2 ${I18nManager.isRTL ? 'rtl-view' : 'ltr-view'}`}>
                  <CustomBottomSheet
                    snapPoints={['25%']}
                    trigger={
                      <CustomButton
                        hasGradient={true}
                        colors={['#82181A', '#82181A', '#82181A', '#9F0712', '#C10007']}
                        title={'حذف الطلب'}
                        containerStyles={'flex-grow'}
                        positionOfGradient={'leftToRight'}
                        textStyles={'text-white'}
                        buttonStyles={'h-[45px]'}
                      />
                    }>
                    <DeleteItem
                      onDeleteConfirm={handleDeleteConfirm}
                      confirmLoading={deleteApartmentLoading}
                    />
                  </CustomBottomSheet>
                  <CustomButton
                    hasGradient={true}
                    colors={['#314158', '#62748E', '#90A1B9', '#90A1B9', '#90A1B9']}
                    title={'تعديل الطلب'}
                    containerStyles={'flex-grow'}
                    positionOfGradient={'leftToRight'}
                    textStyles={'text-white'}
                    buttonStyles={'h-[45px]'}
                    handleButtonPress={() => router.push(`/(edit)/apartment/${id}`)}
                  />
                </View>
              ) : (
                <>
                  {user?.privilege !== 'admin' && (
                    <CustomButton
                      hasGradient={true}
                      colors={['#633e3d', '#774b46', '#8d5e52', '#a47764', '#bda28c']}
                      title={'تواصل مع فريق عقاري'}
                      containerStyles={'flex-grow'}
                      positionOfGradient={'leftToRight'}
                      textStyles={'text-white'}
                      buttonStyles={'h-[45px]'}
                      handleButtonPress={() => router.push('/(contact)')}
                    />
                  )}

                  {user?.privilege == 'admin' && (
                    <>
                      {apartmentDetailsResponse?.approve == 0 && (
                        <View className={`gap-2 ${I18nManager.isRTL ? 'rtl-view' : 'ltr-view'}`}>
                          <CustomButton
                            hasGradient={true}
                            colors={['#3cab3d', '#2d8c2e', '#266f27', '#2d8c2e', '#3cab3d']}
                            title={'الموافقة على الطلب'}
                            containerStyles={'flex-grow'}
                            positionOfGradient={'leftToRight'}
                            textStyles={'text-white'}
                            buttonStyles={'h-[45px]'}
                            handleButtonPress={handleApproveUnit}
                          />
                        </View>
                      )}
                      <View className={`gap-2 ${I18nManager.isRTL ? 'rtl-view' : 'ltr-view'} mt-4`}>
                        <CustomButton
                          hasGradient={true}
                          colors={['#633e3d', '#774b46', '#8d5e52', '#a47764', '#bda28c']}
                          title={'تعديل الطلب'}
                          containerStyles={'flex-grow'}
                          positionOfGradient={'leftToRight'}
                          textStyles={'text-white'}
                          buttonStyles={'h-[45px]'}
                          handleButtonPress={() => router.push(`/(edit)/apartment/${id}`)}
                        />
                      </View>
                      <View className={`gap-2 ${I18nManager.isRTL ? 'rtl-view' : 'ltr-view'} mt-4`}>
                        <CustomButton
                          hasGradient={true}
                          colors={['#314158', '#62748E', '#90A1B9', '#90A1B9', '#90A1B9']}
                          title={'إتمام الصفقة'}
                          containerStyles={'flex-grow'}
                          positionOfGradient={'leftToRight'}
                          textStyles={'text-white'}
                          buttonStyles={'h-[45px]'}
                          handleButtonPress={handleCloseUnit}
                        />
                        <CustomButton
                          hasGradient={true}
                          colors={['#82181A', '#82181A', '#82181A', '#9F0712', '#C10007']}
                          title={'حذف الطلب'}
                          containerStyles={'flex-grow'}
                          positionOfGradient={'leftToRight'}
                          textStyles={'text-white'}
                          buttonStyles={'h-[45px]'}
                          handleButtonPress={handleDeleteUnit}
                        />
                      </View>
                    </>
                  )}
                </>
              )}
            </View>
          </>
        )}
      </SafeAreaView>
    </>
  );
};

export default ApartmentDetails;
