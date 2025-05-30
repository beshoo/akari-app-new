import { View, Text, ScrollView } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/CustomInput';
import CustomRadioButtons from '../../components/CustomRadioButtons';
import CustomHeadWithBackButton from '../../components/CustomHeadWithBackButton';
import CustomSelecteBox from '@/components/CustomSelecteBox.jsx';
import { router } from 'expo-router';
import { useEnumsStore } from '../../store/enums.store';
import CustomButton from '@/components/CustomButton.jsx';
import { useUnitsStore } from '../../store/units.store';

const CreateApartmentScreen = () => {
  const {
    getRegions,
    regionsSchema,
    getSectorsBasedOnRegion,
    sectorsBasedOnRegionSchema,
    getApartmentTypes,
    apartmentTypesSchema,
    getDirections,
    directionsSchema,
    getApartmentStatus,
    apartmentStatusSchema,
  } = useEnumsStore();

  const { createApartmentRequest, createApartmentRequestLoading } = useUnitsStore();
  const [currentType, setCurrentType] = useState('buy');
  const [form, setForm] = useState({
    owner_name: '',
    region_id: '',
    sector_id: '',
    equity: '',
    price: '',
    direction_id: '',
    area: '',
    floor: '',
    rooms_count: '',
    salons_count: '',
    balcony_count: '',
    apartment_type_id: '',
    is_taras: '0',
  });

  const [regions, setRegions] = useState([]);
  const [sectorsTypes, setSectorsTypes] = useState([]);
  const [mainSectors, setMainSectors] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [apartmentTypes, setApartmentTypes] = useState([]);
  const [directions, setDirections] = useState([]);
  const [apartmentStatus, setApartmentStatus] = useState([]);
  const [fieldsToShow, setFieldsToShow] = useState([]);
  const getEnumsList = async () => {
    const regionsResponse = await getRegions();
    const apartmentTypesResponse = await getApartmentTypes();
    const apartmentStatusResponse = await getApartmentStatus();
    const directionsResponse = await getDirections();
    setRegions(regionsResponse);
    setApartmentTypes(apartmentTypesResponse);
    setDirections(directionsResponse);
    setApartmentStatus(apartmentStatusResponse);
  };

  const [sectoreType, setSectoreType] = useState('');

  const handleSelectSectorType = async (value) => {
    setSectoreType(value);
    setSectors(mainSectors[value]?.code);
  };

  const handleChangeRegion = async (value) => {
    setForm({ ...form, region_id: value });
    const sectorsResponse = await getSectorsBasedOnRegion(value);
    setMainSectors(sectorsResponse);
    const sectorsTypesSelection = [];

    for (let sector in sectorsResponse) {
      if (sectorsResponse[sector] !== true) {
        sectorsTypesSelection.push({
          id: sector,
          name: sectorsResponse[sector]?.key,
        });
      }
    }
    setSectorsTypes(sectorsTypesSelection);
  };
  // Fetch regions on mount
  useEffect(() => {
    getEnumsList();
  }, []);

  const radioButtons = useMemo(
    () => [
      {
        id: 'buy',
        label: 'طلب شراء',
        value: 'buy',
        size: 20,
        color: '#a47764',
      },
      {
        id: 'sell',
        label: 'عرض بيع',
        value: 'sell',
        size: 20,
        color: '#a47764',
      },
    ],
    []
  );
  const tarasRadioButtons = useMemo(
    () => [
      {
        id: '1',
        label: 'يحتوي على تراس',
        value: 'true',
        size: 20,
        color: '#a47764',
      },
      {
        id: '0',
        label: 'لا يحتوي على تراس',
        value: 'false',
        size: 20,
        color: '#a47764',
      },
    ],
    []
  );

  const handleCreateApartmentRequest = async () => {
    const response = await createApartmentRequest(currentType, form);
    console.log(response, 'response');
    if (response?.success) {
      router.replace(`/(apartments)/${response.id}`);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <CustomHeadWithBackButton title="إضافة عقار" handleButtonPress={() => router.back()} />
      <ScrollView className="flex-1 px-4">
        <CustomRadioButtons
          radioButtons={radioButtons}
          handleChangeRadioButton={(value) => setCurrentType(value)}
          selectedId={currentType}
        />
        <View className="my-4">
          <CustomSelecteBox
            value={form.region_id}
            setValue={handleChangeRegion}
            arrayOfValues={regions}
            valueKey="id"
            placeholder=" المنطقة"
          />
        </View>
        <View className="my-4">
          <CustomSelecteBox
            value={sectoreType}
            setValue={handleSelectSectorType}
            arrayOfValues={sectorsTypes}
            disabled={sectorsBasedOnRegionSchema?.loading}
            valueKey="id"
            emptyMessage="يرجى اختيار المنطقة أولا"
            placeholder="نوع المقسم"
          />
        </View>
        <View className="my-4">
          <CustomSelecteBox
            value={form.sector_id}
            setValue={(value) => setForm({ ...form, sector_id: value })}
            arrayOfValues={sectors ?? []}
            disabled={sectorsBasedOnRegionSchema?.loading}
            valueKey="id"
            emptyMessage="يرجى اختيار نوع المقسم أولا"
            placeholder=" المقسم"
            keyName="code"
          />
        </View>
        <View className="my-4">
          <CustomSelecteBox
            value={form.direction_id}
            setValue={(value) => setForm({ ...form, direction_id: value })}
            arrayOfValues={directions ?? []}
            disabled={directionsSchema?.loading}
            valueKey="id"
            placeholder="اتجاه العقار"
          />
        </View>
        <View className="my-4">
          <CustomSelecteBox
            value={form.apartment_type_id}
            setValue={(value) => {
              setForm({ ...form, apartment_type_id: value });
              setFieldsToShow(apartmentTypes.find((item) => item.id === value)?.fields);
            }}
            arrayOfValues={apartmentTypes ?? []}
            disabled={apartmentTypesSchema?.loading}
            valueKey="id"
            placeholder="نوع العقار"
          />
        </View>
        <View className="my-4">
          <CustomSelecteBox
            value={form.apartment_status_id}
            setValue={(value) => setForm({ ...form, apartment_status_id: value })}
            arrayOfValues={apartmentStatus ?? []}
            disabled={apartmentStatusSchema?.loading}
            valueKey="id"
            placeholder="حالة العقار"
          />
        </View>
        <View className="my-4">
          <Input
            placeholder="المساحة"
            value={form.area}
            onChangeText={(text) => setForm({ ...form, area: text })}
            type="numeric"
          />
        </View>
        {fieldsToShow.length > 0 && fieldsToShow.includes('floor') && (
          <View className="my-4">
            <Input
              placeholder="الطابق"
              value={form.floor}
              onChangeText={(text) => setForm({ ...form, floor: text })}
              type="numeric"
            />
          </View>
        )}
        {fieldsToShow.length > 0 && fieldsToShow.includes('rooms_count') && (
          <View className="my-4">
            <Input
              placeholder="عدد الغرف"
              value={form.rooms_count}
              onChangeText={(text) => setForm({ ...form, rooms_count: text })}
              type="numeric"
            />
          </View>
        )}
        {fieldsToShow.length > 0 && fieldsToShow.includes('salons_count') && (
          <View className="my-4">
            <Input
              placeholder="عدد الصالونات"
              value={form.salons_count}
              onChangeText={(text) => setForm({ ...form, salons_count: text })}
              type="numeric"
            />
          </View>
        )}
        {fieldsToShow.length > 0 && fieldsToShow.includes('balcony_count') && (
          <View className="my-4">
            <Input
              placeholder="عدد البلكونات"
              value={form.balcony_count}
              onChangeText={(text) => setForm({ ...form, balcony_count: text })}
              type="numeric"
            />
          </View>
        )}

        <View className="my-4">
          <Input
            placeholder="صاحب العلاقة"
            value={form.owner_name}
            onChangeText={(text) => setForm({ ...form, owner_name: text })}
          />
        </View>
        <View className="my-4">
          <Input
            placeholder={`عدد الأسهم المتاحة (${currentType === 'buy' ? 'المطلوبة' : 'المعروضة'})`}
            value={form.equity}
            type="numeric"
            onChangeText={(text) => setForm({ ...form, equity: text })}
          />
        </View>
        <View className="my-4">
          <Input
            placeholder="سعر العقار (ليرة سورية)"
            value={form.price}
            type="numeric"
            onChangeText={(text) => setForm({ ...form, price: text })}
          />
        </View>
        {fieldsToShow.length > 0 && fieldsToShow.includes('is_taras') && (
          <View className="my-4">
            <CustomRadioButtons
              radioButtons={tarasRadioButtons}
              handleChangeRadioButton={(value) => setForm({ ...form, is_taras: value })}
              selectedId={form.is_taras}
            />
          </View>
        )}
      </ScrollView>
      <View className="p-4">
        <CustomButton
          hasGradient={true}
          colors={['#633e3d', '#774b46', '#8d5e52', '#a47764', '#bda28c']}
          title={`إضافة طلب ${currentType === 'buy' ? 'الشراء' : 'البيع'}`}
          containerStyles={'flex-grow'}
          positionOfGradient={'leftToRight'}
          textStyles={'text-white'}
          buttonStyles={'h-[45px]'}
          handleButtonPress={handleCreateApartmentRequest}
          loading={createApartmentRequestLoading}
        />
      </View>
    </SafeAreaView>
  );
};

export default CreateApartmentScreen;
