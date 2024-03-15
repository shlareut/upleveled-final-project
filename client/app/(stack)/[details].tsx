import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import checkLoginStatus from '../../util/sessions';
import CustomButton from '../components/CustomButton';
import LoadingScreen from '../components/LoadingScreen';
import { nextHost } from '../constants';

export default function DetailsScreen() {
  // define local and state variables
  const local = useLocalSearchParams();
  const [listing, setListing] = useState({});
  const [options, setOptions] = useState([]);

  //// START LOGIN SESSION CHECKING

  // ensure login-status is checked before setting isLoaded to false
  const [isLoginStatusChecked, setIsLoginStatusChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // check login status on every screen load
  useFocusEffect(() => {
    checkLoginStatus().then((status) => {
      setIsLoggedIn(status.isLoggedIn);
      setUserId(status.userId);
      setIsLoginStatusChecked(true);
      console.log('LOGIN STATUS:', status.isLoggedIn);
    });
  });

  //// END LOGIN SESSION CHECKING

  // fetch details upon screen load
  useEffect(() => {
    if (isLoginStatusChecked) {
      const fetchDetails = async () => {
        // fetch details
        const listingsRequest = await fetch(
          `${nextHost}/api/listings/${local.listingId}`,
        );
        const listingResponse = await listingsRequest.json();
        // fetch options
        const optionsRequest = await fetch(
          `${nextHost}/api/listings/${local.listingId}/options`,
        );
        const optionsResponse = await optionsRequest.json();
        // set state variables
        setListing(listingResponse);
        setOptions(optionsResponse);
        setIsLoading(false);
      };
      fetchDetails().catch(console.error);
    }
  }, [local.listingId, isLoginStatusChecked]);

  // loading screen
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView>
        <Image
          className="w-screen h-60"
          source={{ uri: `${nextHost}/hero_images/${listing.id}.jpeg` }}
        />
        <View className="my-5 mx-3">
          <Text className="text-3xl font-bold">{listing.name}</Text>
          <Text className="mt-2 font-bold">{listing.type}</Text>
          <View className="flex-row mt-2 justify-between">
            <Text className="w-3/6">
              {listing.address_line_one},{' '}
              {listing.address_line_two ? `${listing.address_line_two}, ` : ''}
              {listing.city_district}, {listing.postal_code} {listing.city}
            </Text>
            <Pressable
              className="active:opacity-50"
              onPress={() => alert('Google map in progress!')}
            >
              <Text className="font-bold text-cyan-800">Open map</Text>
            </Pressable>
          </View>
          <View className="my-5 border-t border-gray-100"></View>
          <Text className="text-justify">{listing.description}</Text>
        </View>
        <View className="my-5 border-t-8 border-gray-100"></View>
        <View className="my-5 mx-3">
          {options.length > 0 ? (
            <View>
              <Text className="text-xl font-bold mb-10">Available roles</Text>
              {/* // option rendering */}
              {options.map((option) => (
                <View className="" key={option.id}>
                  <Text className="mb-5 text-lg font-semibold">
                    {option.name}
                  </Text>
                  <Text className="text-justify mb-5">
                    {option.description}
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <View className="items-end py-1">
                      <Text className="text-lg font-bold">
                        {option.price} {option.currency}
                      </Text>
                      <Text className="">per hour</Text>
                    </View>
                    {/* // conditional button rendering */}
                    {isLoggedIn ? (
                      <CustomButton
                        onPress={() =>
                          router.navigate({
                            pathname: '/booking',
                            params: {
                              entryPoint: '/[details]',
                              listingId: local.listingId,
                              listing: JSON.stringify(listing),
                              option: JSON.stringify(option),
                            },
                          })
                        }
                      >
                        Apply now
                      </CustomButton>
                    ) : (
                      <CustomButton
                        onPress={() =>
                          router.navigate({
                            pathname: '/identify',
                            params: {
                              entryPoint: '/[details]',
                              listingId: local.listingId,
                            },
                          })
                        }
                      >
                        Log in to apply
                      </CustomButton>
                    )}
                  </View>
                  <View className="my-10 border-t border-gray-200"></View>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-xl font-bold mb-10">No roles available</Text>
          )}
        </View>
      </ScrollView>
      {/* // deprecate sticky bar and make "apply" cta for each option! */}
      {/* <View className="h-28 border-t border-gray-200">
        <View className="self-end my-4 mx-3 align">
          {isLoggedIn ? (
            <CustomButton onPress={() => alert('WIP')}>Apply now</CustomButton>
          ) : (
            <CustomButton onPress={() => router.navigate('../(auth)/identify')}>
              Log in to apply
            </CustomButton>
          )}
        </View>
      </View> */}
    </View>
  );
}
