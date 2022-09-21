import { useCallback, useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import ImagePicker, { ImageOrVideo } from 'react-native-image-crop-picker';
import { Camera, CameraPermissionRequestResult, useCameraDevices } from 'react-native-vision-camera';
import TextRecognition from 'react-native-text-recognition';


export default function App() {
  const camera = useRef<Camera>(null);
  const devices = useCameraDevices();
  let device: any = devices.back;
  const [hasPermissions, setHasPermissions] = useState<boolean>(false);


  const [isProcessingText, setIsProcessingText] = useState<boolean>(false);  

  useEffect(() => {
    (async () => {
      const cameraPermission: CameraPermissionRequestResult =
        await Camera.requestCameraPermission();
      const microPhonePermission: CameraPermissionRequestResult =
        await Camera.requestMicrophonePermission();
      if (cameraPermission === 'denied') {
        Alert.alert(
          'Allow Permissions',
          'Please allow camera and microphone permission to access camera features',
          [
            {
              text: 'Go to Settings',
              onPress: () => Linking.openSettings(),
            },
            {
              text: 'Cancel',
            },
          ],
        );
        setHasPermissions(false);
      } else {
        setHasPermissions(true);
      }
    })();
  }, []);
  
  const pickAndRecognize: () => void = useCallback(async () => {
    ImagePicker.openPicker({
      cropping: false,
    })
      .then(async (res: ImageOrVideo) => {
        // console.log('res:', res);

        setIsProcessingText(true);
        const result: string[] = await TextRecognition.recognize(res?.path);
        setIsProcessingText(false);
        console.log(result)
      })
      .catch(err => {
        console.log('err:', err);
      });
  }, []);

  const captureAndRecognize = useCallback(async () => {
    try {
      const image = await camera.current?.takePhoto({
        qualityPrioritization: 'quality',
        enableAutoStabilization: true,
        flash: 'on',
        skipMetadata: true,
      });
      console.log('image:', image);
    } catch (err) {
      console.log('err:', err);
    }
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text>OCR teste!!!</Text>    

      <Pressable style={styles.galleryBtn} onPress={pickAndRecognize}>
        <Text style={styles.btnText}>Abrir galeria</Text>
      </Pressable>

      <Pressable
            style={styles.captureBtnContainer}
            // We will define this method later
            onPress={captureAndRecognize}>            
          </Pressable>

          {device && hasPermissions ? (
        <View>
          <Camera
            photo
            enableHighQualityPhotos
            ref={camera}
            style={styles.camera}
            isActive={true}
            device={device}
          />
          <Pressable
            style={styles.captureBtnContainer}
            // We will define this method later
            onPress={captureAndRecognize}>
              <Text>Camera</Text>
            {/* <Image source={Capture} /> */}
          </Pressable>
        </View>
      ) : (
        <Text>No Camera Found</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  galleryBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#000',
    borderRadius: 40,
    marginTop: 18,
  },

  camera: {
    marginVertical: 24,
    height: 240,
    width: 360,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#000',
  },
  captureBtnContainer: {
    position: 'absolute',
    bottom: 28,
    right: 10,
  },

  btnText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '400',
    letterSpacing: 0.4,
  },
});
