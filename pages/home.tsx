import { useGlobalContext } from "@/contexts/Global";
import { useKeypairContext } from "@/contexts/KeypairContext";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen(props: { showQRscanner: () => void }) {
  const { setDrawer } = useGlobalContext();
  const { keypairs, selectedKeypairId } = useKeypairContext();

  return (
    <View>
      <View className="flex flex-col items-center justify-center pt-3">
        <Image
          className="h-[10vh] rounded-full aspect-square"
          src="https://assets.coingecko.com/coins/images/33747/large/ogbretttttttt.jpg?1703454425"
        />

        <TouchableOpacity
          onPress={() => {
            setDrawer(<SignersDrawer />);
          }}
        >
          {selectedKeypairId !== null && (
            <Text className="text-white text-center font-bold text-2xl pt-1">
              Key #{selectedKeypairId + 1}
              <Text className="text-white/50"> ⌵</Text>
            </Text>
          )}
        </TouchableOpacity>

        <Text className="text-sm text-white/50 mt-2">
          {selectedKeypairId !== null &&
            keypairs[selectedKeypairId].pubKey.serialize().slice(0, 20)}
          ...
        </Text>

        <View className="flex flex-row gap-x-5 mt-3">
          <TouchableOpacity
            className="flex gap-x-2 flex-row mt-3 bg-blue-600 px-7 py-2 rounded-full"
            onPress={props.showQRscanner}
          >
            <Image
              src="https://icons.veryicon.com/png/o/miscellaneous/excellent-residents/scan-qr-code-4.png"
              style={{ tintColor: "#fff" }}
              className="aspect-square w-5"
            />
            <Text className="text-white">Scan QR</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex gap-x-2 flex-row mt-3 bg-white px-7 py-2 rounded-full">
            <Image
              src="https://static-00.iconduck.com/assets.00/exit-icon-1821x2048-50xh00pv.png"
              style={{ tintColor: "#000" }}
              className="aspect-square w-5"
            />
            <Text className="text-black">Exit App</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function SignersDrawer() {
  const { setDrawer } = useGlobalContext();
  const { keypairs, createKeypair, setSelectedKeypairId } = useKeypairContext();

  return (
    <View className="flex flex-col gap-y-7 py-5">
      {keypairs.map((keypair, key) => (
        <TouchableOpacity
          key={key}
          onPress={() => {
            setSelectedKeypairId(key);
            setDrawer(null);
          }}
          className="flex flex-row"
        >
          <Image
            src={images[key % images.length]}
            className="w-[15vw] aspect-square rounded-full"
          />

          <View className="flex-1 flex-col w-[70vw] pl-3">
            <Text className="text-white text-lg font-semibold">
              Key #{key + 1}
            </Text>
            <Text className="text-white/60 text-xs">
              {keypair.pubKey.serialize()}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        className="self-center bg-blue-700 px-12 py-2 rounded-md mb-4"
        onPress={() => {
          createKeypair();
          setDrawer(null);
        }}
      >
        <Text className="text-white text-lg">
          <Text className="text-xl">+</Text>
          {"   "}New Signer
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const images = [
  "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=656,h=609,fit=crop/AwvrPX3GLpC9DWZ2/brett-x-logo-YD0pvDQWrpiK5oaq.jpg",
  "https://static.wikia.nocookie.net/boysclub/images/a/a9/Landwolf.jpg/revision/latest?cb=20240404061702",
  "https://static.wikia.nocookie.net/boysclub/images/8/80/Bird_Dog_Profile.jpg/revision/latest?cb=20240404013235",
  "https://www.midtowncomics.com/images/PRODUCT/XL/1667173_xl.jpg",
  "https://static.wikia.nocookie.net/boysclub/images/b/b7/Fofar_Profile.jpg/revision/latest/thumbnail/width/360/height/360?cb=20240404012103",
];

// const users = [
//   {
//     name: "Prima",
//     img: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=656,h=609,fit=crop/AwvrPX3GLpC9DWZ2/brett-x-logo-YD0pvDQWrpiK5oaq.jpg",
//     signer: "658e4a72cc660161525f5511d0803c26bc77cec53c41a01fe12d23b5a3a9dd7a",
//   },
//   {
//     name: "BabaKala",
//     img: "https://static.wikia.nocookie.net/boysclub/images/a/a9/Landwolf.jpg/revision/latest?cb=20240404061702",
//     signer: "4b7d05826c727aed77bf7d1765cc3e415b367d915ec9b898b017a7c77438f0d7",
//   },
//   {
//     name: "Pulpeshwar",
//     img: "https://static.wikia.nocookie.net/boysclub/images/8/80/Bird_Dog_Profile.jpg/revision/latest?cb=20240404013235",
//     signer: "9e63773c3cc824645e523c331b575883c501a5294b1ae31bd2aff454e3810a3c",
//   },
//   {
//     name: "Tossing Popcorn",
//     img: "https://www.midtowncomics.com/images/PRODUCT/XL/1667173_xl.jpg",
//     signer: "562a75ac317afe692e3f5ab9e30260b8ee54f3f1e2adbcb2339ec8bfb08b15db",
//   },
//   {
//     name: "nakliSooar",
//     img: "https://static.wikia.nocookie.net/boysclub/images/b/b7/Fofar_Profile.jpg/revision/latest/thumbnail/width/360/height/360?cb=20240404012103",
//     signer: "1937b6b24d5e4fbe73a3590233c45cf62607fbaaa8932be036fe09b0a1ac5ca7",
//   },
// ];
