import { router, useGlobalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Image,
  Share,
  ScrollView,
  I18nManager,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUnitsStore } from '@/store/units.store';
import CustomHeadWithBackButton from '@/components/CustomHeadWithBackButton';
import { AntDesign } from '@expo/vector-icons';
import CustomImageSlider from '@/components/CustomImageSlider';
import CustomButton from '@/components/CustomButton';
import icons from '@/constants/icons';
import { getSecureStoreNoAsync } from '@/composables/secure.store';
import CustomBottomSheet from '@/components/CustomBottomSheet';
import DeleteItem from '@/components/DeleteItem';
import { useAdminStore } from '../../store/admin.store';

import CustomBottomModalSheet from '@/components/CustomBottomModalSheet';
import AdminActionItem from '../../components/AdminActionItem';
import CustomLinear from '../../components/CustomLinear';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useReactionStore } from '@/store/reaction.store';

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
}) => {
  const user = getSecureStoreNoAsync('user');

  return (
    <View className="px-4 py-4">
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
          <Animated.View
            className="absolute bottom-12 left-2 z-20 flex-row items-center gap-2 rounded-full border border-gray-300 bg-white p-1 shadow-lg drop-shadow-sm"
            style={{
              elevation: 5,
              transform: [{ translateX: I18nManager.isRTL ? -10 : 10 }],
              bottom: 50,
            }}>
            {availableReactions.map((reaction) => (
              <EmojiButton
                key={reaction.value}
                emoji={reaction.icon}
                onPress={() => onReactionSelect(reaction.value)}
              />
            ))}
          </Animated.View>
        )}

        <TouchableOpacity
          onPress={onLikePress}
          onLongPress={onLikeLongPress}
          delayLongPress={200}
          className="relative my-2 flex-1 items-center justify-center rounded-md border border-gray-200 py-3 hover:bg-gray-100 active:bg-gray-200">
          {(() => {
            const reactionObj = availableReactions.find(
              (reaction) => reaction.value === displayedReaction
            );

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
            } else {
              return (
                <View
                  className={`${I18nManager.isRTL ? 'rtl-view' : 'ltr-view'} flex flex-row items-center justify-center gap-2`}>
                  <AntDesign name="like2" size={18} color="#374151" />
                  <Text className="text-md mt-1 font-psemibold text-gray-700">إعجاب</Text>
                </View>
              );
            }
          })()}
        </TouchableOpacity>
      </View>
      <View className={`rounded-lg border border-toast-100 p-4`}>
        <Text className="font-psemibold text-lg text-black">تفاصيل الوحدة</Text>
        <Text className="font-pregular text-sm text-zinc-600">
          {item?.transaction_type === 'buy' ? (
            <Text className={'font-pregular text-zinc-500'}>
              نرغب بشراء اسهم تنظيمية في {item?.sector?.code?.view_code} بكمية {item?.quantity} سهم
              بسعر {item?.price} ل.س بالسهم في منطقة {item?.region?.name}
            </Text>
          ) : (
            <Text className={'font-pregular text-zinc-500'}>
              نرغب ببيع اسهم تنظيمية في {item?.sector?.code?.view_code} بكمية {item?.quantity} سهم
              بسعر {item?.price} ل.س بالسهم في منطقة {item?.region?.name}
            </Text>
          )}
        </Text>
      </View>
      <View className="mt-4 flex-row gap-2">
        <View className="flex-1 rounded-lg border border-toast-100 p-4">
          <Image source={icons.price} className="mb-1 h-7 w-7" tintColor="#a47764" />
          <Text className="font-pmedium text-base text-zinc-600">سعر السهم المطروح</Text>
          <Text
            className={`font-pregular text-sm text-zinc-600 ${I18nManager.isRTL ? 'text-left' : 'text-right'}`}>
            {item?.price}
          </Text>
        </View>
        <View className="flex-1 rounded-lg border border-toast-100 p-4">
          <Image source={icons.quantity} className="mb-1 h-7 w-7" tintColor="#a47764" />
          <Text className="font-pmedium text-base text-zinc-600">الأسهم المطروحة</Text>
          <Text
            className={`font-pregular text-sm text-zinc-600 ${I18nManager.isRTL ? 'text-left' : 'text-right'}`}>
            {item?.quantity}
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
    </View>
  );
};

const SharesDetails = () => {
  const { id } = useGlobalSearchParams();

  const {
    getShareDetails,
    shareDetailsResponse,
    shareDetailsLoading,
    deleteShare,
    deleteShareLoading,
  } = useUnitsStore();

  const {
    approveUnitLoading,
    approveUnit,
    closeUnitLoading,
    closeUnit,
    deleteUnitLoading,
    deleteUnit,
  } = useAdminStore();

  const { setReactions, removeReaction } = useReactionStore();
  const [showReactions, setShowReactions] = useState(false);
  const [displayedReaction, setDisplayedReaction] = useState(null);
  const reactionsBottomSheetModalRef = useRef(null);

  useEffect(() => {
    if (shareDetailsResponse) {
      setDisplayedReaction(shareDetailsResponse.current_user_reaction);
    }
  }, [shareDetailsResponse?.current_user_reaction]);

  // Function to update reactions locally
  const updateLocalReactions = (reactionSummary) => {
    if (shareDetailsResponse && reactionSummary) {
      // Update the reaction counts without refetching the entire share
      const updatedShare = {
        ...shareDetailsResponse,
        reaction_counts: reactionSummary,
      };
      // Update the store directly
      useUnitsStore.setState((state) => ({
        ...state,
        shareDetailsResponse: updatedShare,
      }));
    }
  };

  const handleReactionSelect = async (reaction) => {
    const previousReaction = displayedReaction;
    setDisplayedReaction(reaction);
    setShowReactions(false);
    const response = await setReactions({
      type: reaction,
      post_type: 'share',
      post_id: id,
    });
    if (response) {
      // Update local state with the reaction summary from the response
      updateLocalReactions(response.reaction_summary);
    } else {
      setDisplayedReaction(previousReaction);
    }
  };

  const handleLikePress = () => {
    if (showReactions) {
      handleReactionSelect('like');
      return;
    }

    if (displayedReaction) {
      const previousReaction = displayedReaction;
      setDisplayedReaction(null);
      removeReaction({
        post_type: 'share',
        post_id: id,
      })
        .then((response) => {
          if (response) {
            // Update local state with the reaction summary from the response
            updateLocalReactions(response.reaction_summary);
          } else {
            setDisplayedReaction(previousReaction);
          }
        })
        .catch(() => {
          setDisplayedReaction(previousReaction);
        });
    } else {
      setDisplayedReaction('like');
      setReactions({
        type: 'like',
        post_type: 'share',
        post_id: id,
      })
        .then((response) => {
          if (response) {
            // Update local state with the reaction summary from the response
            updateLocalReactions(response.reaction_summary);
          } else {
            setDisplayedReaction(null);
          }
        })
        .catch(() => {
          setDisplayedReaction(null);
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

  const user = getSecureStoreNoAsync('user');

  const getShareDetailsHandler = async () => {
    if (!id) return;
    const response = await getShareDetails(id);
  };

  const handleDeleteConfirm = async () => {
    const response = await deleteShare(id);
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
    const response = await approveUnit('share', id);
    if (response?.success) {
      getShareDetailsHandler();
      bottomSheetModalRef.current.dismiss();
    }
  };

  const handleCloseUnitConfirm = async () => {
    const response = await closeUnit('share', id);
    if (response?.success) {
      getShareDetailsHandler();
      closeUnitBottomSheetModalRef.current.dismiss();
    }
  };

  const handleDeleteUnit = async () => {
    deleteUnitBottomSheetModalRef.current.present();
  };

  const handleDeleteUnitConfirm = async () => {
    const response = await deleteUnit('share', id);
    if (response?.success) {
      router.replace('/(tabs)');
      router.dismissAll();
    }
  };

  useEffect(() => {
    getShareDetailsHandler();
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
          {shareDetailsResponse?.closed == 0 ? (
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
      <CustomBottomModalSheet
        backdropBehave="close"
        enablePanDownToClose={true}
        bottomSheetModalRef={reactionsBottomSheetModalRef}
        handleSheetChanges={() => {}}
        snapPoints={['30%', '50%', '70%']}
        handleDismissModalPress={() => {}}>
        <View className="p-4">
          <Text className="mb-4 text-center font-psemibold text-lg">التفاعلات</Text>
          <View className={`flex ${I18nManager.isRTL ? 'rtl-view' : 'ltr-view'} gap-4`}>
            {availableReactions.map((reaction) => {
              const countKey = `${reaction.value}_count`;
              const count = shareDetailsResponse?.reaction_counts?.[countKey] || 0;
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
            {(!shareDetailsResponse?.reaction_counts ||
              shareDetailsResponse?.reaction_counts?.total_count === 0) && (
              <Text className="text-center font-pregular text-gray-500">لا يوجد تفاعلات بعد.</Text>
            )}
          </View>
        </View>
      </CustomBottomModalSheet>
      <SafeAreaView className="flex-1">
        {shareDetailsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="100" color="#a47764" />
          </View>
        ) : (
          <>
            <CustomHeadWithBackButton
              title="تفاصيل الوحدة"
              rightIcon={<AntDesign name="sharealt" size={24} color="black" />}
              rightIconPress={() => handleShare(shareDetailsResponse)}
              handleButtonPress={() => router.back()}
            />
            <View className={`${I18nManager.isRTL ? 'rtl-view' : 'ltr-view'} justify-between`}>
              <View className="px-4">
                <Text className="font-psemibold text-xl">
                  {shareDetailsResponse?.sector?.code?.name} -{' '}
                  {shareDetailsResponse?.sector?.code?.view_code}
                </Text>
                <Text className="font-pregular text-sm text-zinc-600">
                  {shareDetailsResponse?.region?.name} -{' '}
                  {shareDetailsResponse?.post_type == 'share' ? 'أسهم تنظيمية' : 'عقارات'}
                </Text>
              </View>
              {(user?.privilege == 'admin' || user?.user_id == shareDetailsResponse?.user?.id) && (
                <View className="mt-2 px-4">
                  {shareDetailsResponse?.approve == 0 && (
                    <CustomLinear
                      title={shareDetailsResponse?.approve == 1 ? 'متاح' : 'قيد المراجعة'}
                      colors={['#e3a001', '#b87005', '#95560b', '#7a460d', '#7a460d']}
                      positionOfGradient="leftToRight"
                      textStyles="text-white !text-xs mt-1"
                      buttonStyles="rounded-lg py-1 px-8"
                    />
                  )}
                </View>
              )}
            </View>
            <ScrollView>
              <View className="flex-1">
                {shareDetailsResponse && (
                  <CustomImageSlider
                    images={shareDetailsResponse?.photos}
                    height={300}
                    newImages={shareDetailsResponse}
                  />
                )}
                <View style={{ marginTop: 20 }}>
                  <UnitDetails
                    item={shareDetailsResponse}
                    displayedReaction={displayedReaction}
                    showReactions={showReactions}
                    onLikePress={handleLikePress}
                    onLikeLongPress={handleLikeLongPress}
                    onReactionSelect={handleReactionSelect}
                    onOpenReactionsModal={handleOpenReactionsModal}
                  />
                </View>
              </View>
            </ScrollView>
            <View className="p-4">
              {user?.user_id == shareDetailsResponse?.user?.id && user?.privilege !== 'admin' ? (
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
                      confirmLoading={deleteShareLoading}
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
                    handleButtonPress={() => router.push(`/(edit)/share/${id}`)}
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
                      {shareDetailsResponse?.approve == 0 && (
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
                          handleButtonPress={() => router.push(`/(edit)/share/${id}`)}
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

export default SharesDetails;
