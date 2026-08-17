import { View, Text } from 'react-native'
import React from 'react'
import { Link, useLocalSearchParams } from 'expo-router'

const subscriptionDetails = () => {
    const {id} = useLocalSearchParams<{id:string}>()
  return (
    <View>
      <Text>subscriptionDetails: {id}</Text>
      <Link href='/'>Go Back</Link>
    </View>
  )
}

export default subscriptionDetails