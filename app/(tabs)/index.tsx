import "@/global.css";
import { Link } from "expo-router";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import {styled} from "nativewind"


const SafeAreaView = styled(RNSafeAreaView)
export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-7xl font-sans-bold text-primary ">
        Home
      </Text>
      <Link href='/onboarding' className="mt-4 rounded bg-primary text-white p-4"> go to onboarding</Link>
      <Link href='/(auth)/sign-in' className="mt-4 rounded bg-primary text-white p-4"> go to SignIN</Link>
      <Link href='/(auth)/sign-up' className="mt-4 rounded bg-primary text-white p-4"> go to SignUp</Link>


    </SafeAreaView>
  );
}
