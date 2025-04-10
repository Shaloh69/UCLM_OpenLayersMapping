// import React, { useState, useEffect } from "react";
// import {
//   View,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   Alert,
//   Platform,
//   Share,
//   Modal,
//   Dimensions,
//   ActivityIndicator,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import QRCode from "react-native-qrcode-svg";
// import * as Crypto from "expo-crypto";
// import * as FileSystem from "expo-file-system";
// import * as Sharing from "expo-sharing";
// import MaterialIcons from "react-native-vector-icons/MaterialIcons";
// import DateTimePicker from "@react-native-community/datetimepicker";

// // Constants for storage
// const VALID_TOKENS_KEY = "map_editor_valid_tokens";
// const ADMIN_KEY_PHRASE = "map_editor_admin_key_phrase";

// interface AdminQRGeneratorProps {
//   onClose: () => void;
// }

// interface TokenInfo {
//   token: string;
//   label: string;
//   expires: number;
//   issuedTo?: string;
//   permissions?: string[];
// }

// const AdminQRGenerator: React.FC<AdminQRGeneratorProps> = ({ onClose }) => {
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [tokens, setTokens] = useState<TokenInfo[]>([]);
//   const [showAddTokenModal, setShowAddTokenModal] = useState<boolean>(false);
//   const [newTokenLabel, setNewTokenLabel] = useState<string>("");
//   const [newTokenUser, setNewTokenUser] = useState<string>("");
//   const [showQRModal, setShowQRModal] = useState<boolean>(false);
//   const [currentQRToken, setCurrentQRToken] = useState<string>("");
//   const [expiryDate, setExpiryDate] = useState<Date>(
//     new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
//   ); // Default 1 week
//   const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
//   const [advancedOptions, setAdvancedOptions] = useState<boolean>(false);
//   const [permissions, setPermissions] = useState<{ [key: string]: boolean }>({
//     create: true,
//     edit: true,
//     delete: false,
//     export: true,
//   });

//   // Load tokens on mount
//   useEffect(() => {
//     loadTokens();
//   }, []);

//   const loadTokens = async () => {
//     try {
//       setIsLoading(true);
//       const tokensJson = await AsyncStorage.getItem(VALID_TOKENS_KEY);

//       if (tokensJson) {
//         const tokensObj = JSON.parse(tokensJson);

//         // Convert object to array and filter out expired tokens
//         const now = Date.now();
//         const tokenArray = Object.entries(tokensObj)
//           .filter(([_, data]) => {
//             // Check if it's just an expiry time (old format) or a TokenInfo object
//             if (typeof data === "number") {
//               return data > now;
//             } else {
//               return data.expires > now;
//             }
//           })
//           .map(([token, data]) => {
//             // Convert old format to new if needed
//             if (typeof data === "number") {
//               return {
//                 token,
//                 label: `Access Token ${token.substring(0, 6)}...`,
//                 expires: data,
//                 permissions: ["create", "edit", "delete", "export"],
//               };
//             } else {
//               return {
//                 token,
//                 ...data,
//               };
//             }
//           })
//           .sort((a, b) => b.expires - a.expires); // Sort by expiry date (newest first)

//         setTokens(tokenArray);
//       }
//     } catch (error) {
//       console.error("Error loading tokens:", error);
//       Alert.alert("Error", "Failed to load access tokens");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const generateNewToken = async () => {
//     if (!newTokenLabel.trim()) {
//       Alert.alert("Error", "Please enter a label for this token");
//       return;
//     }

//     try {
//       setIsLoading(true);

//       // Generate a random token
//       const randomBytes = await Crypto.getRandomBytesAsync(16);
//       const token = Array.from(randomBytes)
//         .map((b) => b.toString(16).padStart(2, "0"))
//         .join("");

//       // Create token info object
//       const tokenInfo: TokenInfo = {
//         token,
//         label: newTokenLabel,
//         expires: expiryDate.getTime(),
//         issuedTo: newTokenUser.trim() || undefined,
//         permissions: Object.keys(permissions).filter((key) => permissions[key]),
//       };

//       // Save the token
//       await saveToken(tokenInfo);

//       // Show QR for the new token
//       setCurrentQRToken(token);
//       setShowQRModal(true);
//       setShowAddTokenModal(false);

//       // Reset form
//       setNewTokenLabel("");
//       setNewTokenUser("");
//       setExpiryDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
//       setAdvancedOptions(false);
//       setPermissions({
//         create: true,
//         edit: true,
//         delete: false,
//         export: true,
//       });

//       // Refresh token list
//       await loadTokens();
//     } catch (error) {
//       console.error("Error generating token:", error);
//       Alert.alert("Error", "Failed to generate access token");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const saveToken = async (tokenInfo: TokenInfo) => {
//     try {
//       const tokensJson = await AsyncStorage.getItem(VALID_TOKENS_KEY);
//       const tokens = tokensJson ? JSON.parse(tokensJson) : {};

//       // Add new token info
//       tokens[tokenInfo.token] = {
//         label: tokenInfo.label,
//         expires: tokenInfo.expires,
//         issuedTo: tokenInfo.issuedTo,
//         permissions: tokenInfo.permissions,
//       };

//       await AsyncStorage.setItem(VALID_TOKENS_KEY, JSON.stringify(tokens));
//     } catch (error) {
//       console.error("Failed to save token:", error);
//       throw new Error("Failed to save access token");
//     }
//   };

//   const revokeToken = async (token: string) => {
//     try {
//       const tokensJson = await AsyncStorage.getItem(VALID_TOKENS_KEY);
//       if (tokensJson) {
//         const tokens = JSON.parse(tokensJson);
//         delete tokens[token];
//         await AsyncStorage.setItem(VALID_TOKENS_KEY, JSON.stringify(tokens));

//         // Refresh the token list
//         await loadTokens();
//       }
//     } catch (error) {
//       console.error("Failed to revoke token:", error);
//       Alert.alert("Error", "Failed to revoke access token");
//     }
//   };

//   const revokeAllTokens = async () => {
//     Alert.alert(
//       "Revoke All Tokens",
//       "Are you sure you want to revoke all access tokens? This action cannot be undone.",
//       [
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//         {
//           text: "Revoke All",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               await AsyncStorage.setItem(VALID_TOKENS_KEY, JSON.stringify({}));
//               setTokens([]);
//               Alert.alert("Success", "All access tokens have been revoked");
//             } catch (error) {
//               console.error("Failed to revoke all tokens:", error);
//               Alert.alert("Error", "Failed to revoke access tokens");
//             }
//           },
//         },
//       ]
//     );
//   };

//   const shareQRCode = async () => {
//     try {
//       if (!currentQRToken) return;

//       let qrSVG: any = null;
//       const getDataURL = () => {
//         return new Promise((resolve) => {
//           qrSVG?.toDataURL(resolve);
//         });
//       };

//       const qrDataURL = await getDataURL();

//       if (Platform.OS === "android" || Platform.OS === "ios") {
//         const fileUri =
//           FileSystem.documentDirectory +
//           `mapeditor-access-${currentQRToken.substring(0, 6)}.png`;
//         await FileSystem.writeAsStringAsync(fileUri, qrDataURL, {
//           encoding: FileSystem.EncodingType.Base64,
//         });

//         if (await Sharing.isAvailableAsync()) {
//           await Sharing.shareAsync(fileUri);
//         } else {
//           Alert.alert("Error", "Sharing is not available on this device");
//         }
//       } else {
//         // Web platform
//         try {
//           await Share.share({
//             message: "Campus Map Editor Access QR Code",
//             url: qrDataURL,
//           });
//         } catch (error) {
//           console.error("Failed to share QR code:", error);
//         }
//       }
//     } catch (error) {
//       console.error("Error sharing QR code:", error);
//       Alert.alert("Error", "Failed to share QR code");
//     }
//   };

//   const handleDateChange = (event: any, selectedDate?: Date) => {
//     setShowDatePicker(false);

//     if (selectedDate) {
//       setExpiryDate(selectedDate);
//     }
//   };

//   const formatDate = (date: Date) => {
//     return (
//       date.toLocaleDateString() +
//       " " +
//       date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
//     );
//   };

//   const generateQRData = (token: string) => {
//     // Create a deep link to the app with the token
//     // Format: mapeditor://access/{token}
//     return `mapeditor://access/${token}`;
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Admin QR Code Generator</Text>
//         <TouchableOpacity style={styles.closeButton} onPress={onClose}>
//           <MaterialIcons name="close" size={24} color="#666" />
//         </TouchableOpacity>
//       </View>

//       <View style={styles.actions}>
//         <TouchableOpacity
//           style={styles.addButton}
//           onPress={() => setShowAddTokenModal(true)}
//         >
//           <MaterialIcons name="add" size={20} color="#FFFFFF" />
//           <Text style={styles.buttonText}>Generate New Access Token</Text>
//         </TouchableOpacity>

//         {tokens.length > 0 && (
//           <TouchableOpacity
//             style={styles.revokeAllButton}
//             onPress={revokeAllTokens}
//           >
//             <MaterialIcons name="delete-sweep" size={20} color="#FFFFFF" />
//             <Text style={styles.buttonText}>Revoke All Tokens</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       {isLoading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#4285F4" />
//           <Text style={styles.loadingText}>Loading tokens...</Text>
//         </View>
//       ) : tokens.length > 0 ? (
//         <ScrollView style={styles.tokensList}>
//           {tokens.map((token, index) => (
//             <View key={index} style={styles.tokenItem}>
//               <View style={styles.tokenInfo}>
//                 <Text style={styles.tokenLabel}>{token.label}</Text>

//                 {token.issuedTo && (
//                   <Text style={styles.tokenSubInfo}>
//                     Issued to: {token.issuedTo}
//                   </Text>
//                 )}

//                 <Text style={styles.tokenSubInfo}>
//                   Expires: {formatDate(new Date(token.expires))}
//                 </Text>

//                 {token.permissions && (
//                   <View style={styles.permissionTags}>
//                     {token.permissions.map((perm, i) => (
//                       <View key={i} style={styles.permissionTag}>
//                         <Text style={styles.permissionText}>{perm}</Text>
//                       </View>
//                     ))}
//                   </View>
//                 )}
//               </View>

//               <View style={styles.tokenActions}>
//                 <TouchableOpacity
//                   style={styles.tokenAction}
//                   onPress={() => {
//                     setCurrentQRToken(token.token);
//                     setShowQRModal(true);
//                   }}
//                 >
//                   <MaterialIcons name="qr-code" size={20} color="#4285F4" />
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={styles.tokenAction}
//                   onPress={() => revokeToken(token.token)}
//                 >
//                   <MaterialIcons name="delete" size={20} color="#EA4335" />
//                 </TouchableOpacity>
//               </View>
//             </View>
//           ))}
//         </ScrollView>
//       ) : (
//         <View style={styles.emptyContainer}>
//           <MaterialIcons name="qr-code" size={80} color="#E0E0E0" />
//           <Text style={styles.emptyText}>No active access tokens</Text>
//           <Text style={styles.emptySubtext}>
//             Generate a new token to allow users to access the map editor
//           </Text>
//         </View>
//       )}

//       {/* Add Token Modal */}
//       <Modal visible={showAddTokenModal} transparent animationType="fade">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Generate Access Token</Text>
//               <TouchableOpacity onPress={() => setShowAddTokenModal(false)}>
//                 <MaterialIcons name="close" size={24} color="#666" />
//               </TouchableOpacity>
//             </View>

//             <ScrollView style={styles.modalBody}>
//               <View style={styles.formGroup}>
//                 <Text style={styles.formLabel}>Token Label *</Text>
//                 <TextInput
//                   style={styles.textInput}
//                   value={newTokenLabel}
//                   onChangeText={setNewTokenLabel}
//                   placeholder="e.g., Campus Admin Access"
//                 />
//               </View>

//               <View style={styles.formGroup}>
//                 <Text style={styles.formLabel}>Issued To (Optional)</Text>
//                 <TextInput
//                   style={styles.textInput}
//                   value={newTokenUser}
//                   onChangeText={setNewTokenUser}
//                   placeholder="e.g., John Smith"
//                 />
//               </View>

//               <View style={styles.formGroup}>
//                 <Text style={styles.formLabel}>Expiry Date</Text>

//                 <TouchableOpacity
//                   style={styles.datePickerButton}
//                   onPress={() => setShowDatePicker(true)}
//                 >
//                   <Text>{formatDate(expiryDate)}</Text>
//                   <MaterialIcons name="event" size={20} color="#666" />
//                 </TouchableOpacity>

//                 {showDatePicker && (
//                   <DateTimePicker
//                     value={expiryDate}
//                     mode="datetime"
//                     display="default"
//                     onChange={handleDateChange}
//                     minimumDate={new Date()}
//                   />
//                 )}
//               </View>

//               <TouchableOpacity
//                 style={styles.advancedToggle}
//                 onPress={() => setAdvancedOptions(!advancedOptions)}
//               >
//                 <Text style={styles.advancedToggleText}>
//                   {advancedOptions
//                     ? "Hide Advanced Options"
//                     : "Show Advanced Options"}
//                 </Text>
//                 <MaterialIcons
//                   name={advancedOptions ? "expand-less" : "expand-more"}
//                   size={20}
//                   color="#4285F4"
//                 />
//               </TouchableOpacity>

//               {advancedOptions && (
//                 <View style={styles.permissionsContainer}>
//                   <Text style={styles.formLabel}>Permissions</Text>

//                   <View style={styles.permissionOptions}>
//                     {Object.keys(permissions).map((perm) => (
//                       <TouchableOpacity
//                         key={perm}
//                         style={[
//                           styles.permissionOption,
//                           permissions[perm] && styles.permissionOptionActive,
//                         ]}
//                         onPress={() =>
//                           setPermissions({
//                             ...permissions,
//                             [perm]: !permissions[perm],
//                           })
//                         }
//                       >
//                         <Text
//                           style={[
//                             styles.permissionOptionText,
//                             permissions[perm] &&
//                               styles.permissionOptionTextActive,
//                           ]}
//                         >
//                           {perm.charAt(0).toUpperCase() + perm.slice(1)}
//                         </Text>
//                       </TouchableOpacity>
//                     ))}
//                   </View>
//                 </View>
//               )}
//             </ScrollView>

//             <View style={styles.modalFooter}>
//               <TouchableOpacity
//                 style={styles.cancelButton}
//                 onPress={() => setShowAddTokenModal(false)}
//               >
//                 <Text style={styles.cancelButtonText}>Cancel</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[
//                   styles.generateButton,
//                   !newTokenLabel.trim() && styles.generateButtonDisabled,
//                 ]}
//                 onPress={generateNewToken}
//                 disabled={!newTokenLabel.trim()}
//               >
//                 <Text style={styles.generateButtonText}>Generate Token</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* QR Code Modal */}
//       <Modal visible={showQRModal} transparent animationType="fade">
//         <View style={styles.modalOverlay}>
//           <View style={styles.qrModalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Access QR Code</Text>
//               <TouchableOpacity onPress={() => setShowQRModal(false)}>
//                 <MaterialIcons name="close" size={24} color="#666" />
//               </TouchableOpacity>
//             </View>

//             <View style={styles.qrContainer}>
//               <QRCode
//                 value={generateQRData(currentQRToken)}
//                 size={250}
//                 getRef={(ref) => (qrSVG = ref)}
//                 backgroundColor="white"
//                 color="black"
//               />
//             </View>

//             <Text style={styles.qrInstructions}>
//               Scan this QR code with the Map Editor mobile app or share it with
//               authorized users.
//             </Text>

//             <View style={styles.qrActions}>
//               <TouchableOpacity
//                 style={styles.shareButton}
//                 onPress={shareQRCode}
//               >
//                 <MaterialIcons name="share" size={20} color="#FFFFFF" />
//                 <Text style={styles.buttonText}>Share QR Code</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.closeQrButton}
//                 onPress={() => setShowQRModal(false)}
//               >
//                 <Text style={styles.closeQrButtonText}>Close</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F5F5F5",
//     padding: 15,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "bold",
//   },
//   closeButton: {
//     padding: 5,
//   },
//   actions: {
//     flexDirection: "row",
//     marginBottom: 15,
//   },
//   addButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#4285F4",
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderRadius: 5,
//     marginRight: 10,
//   },
//   revokeAllButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#EA4335",
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderRadius: 5,
//   },
//   buttonText: {
//     color: "#FFFFFF",
//     marginLeft: 5,
//     fontWeight: "bold",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     marginTop: 10,
//     color: "#666",
//   },
//   tokensList: {
//     flex: 1,
//   },
//   tokenItem: {
//     flexDirection: "row",
//     backgroundColor: "white",
//     borderRadius: 10,
//     padding: 15,
//     marginBottom: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   tokenInfo: {
//     flex: 1,
//   },
//   tokenLabel: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginBottom: 5,
//   },
//   tokenSubInfo: {
//     fontSize: 14,
//     color: "#666",
//     marginBottom: 3,
//   },
//   permissionTags: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     marginTop: 5,
//   },
//   permissionTag: {
//     backgroundColor: "#E1F5FE",
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 12,
//     marginRight: 5,
//     marginBottom: 5,
//   },
//   permissionText: {
//     fontSize: 12,
//     color: "#0277BD",
//   },
//   tokenActions: {
//     justifyContent: "space-around",
//   },
//   tokenAction: {
//     padding: 8,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   emptyText: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   emptySubtext: {
//     fontSize: 14,
//     color: "#666",
//     textAlign: "center",
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   modalContent: {
//     backgroundColor: "white",
//     borderRadius: 10,
//     width: "100%",
//     maxWidth: 500,
//     maxHeight: "80%",
//   },
//   qrModalContent: {
//     backgroundColor: "white",
//     borderRadius: 10,
//     width: "100%",
//     maxWidth: 350,
//     alignItems: "center",
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E0E0E0",
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   modalBody: {
//     padding: 15,
//     maxHeight: 400,
//   },
//   formGroup: {
//     marginBottom: 15,
//   },
//   formLabel: {
//     fontSize: 14,
//     fontWeight: "bold",
//     marginBottom: 5,
//     color: "#666",
//   },
//   textInput: {
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//     borderRadius: 5,
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//     fontSize: 16,
//   },
//   datePickerButton: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//     borderRadius: 5,
//     paddingHorizontal: 10,
//     paddingVertical: 10,
//   },
//   advancedToggle: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     marginVertical: 10,
//     padding: 5,
//   },
//   advancedToggleText: {
//     color: "#4285F4",
//     marginRight: 5,
//   },
//   permissionsContainer: {
//     marginTop: 10,
//   },
//   permissionOptions: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     marginTop: 5,
//   },
//   permissionOption: {
//     backgroundColor: "#F0F0F0",
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 20,
//     marginRight: 8,
//     marginBottom: 8,
//   },
//   permissionOptionActive: {
//     backgroundColor: "#4285F4",
//   },
//   permissionOptionText: {
//     fontSize: 14,
//     color: "#666",
//   },
//   permissionOptionTextActive: {
//     color: "#FFFFFF",
//     fontWeight: "bold",
//   },
//   modalFooter: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     padding: 15,
//     borderTopWidth: 1,
//     borderTopColor: "#E0E0E0",
//   },
//   cancelButton: {
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     marginRight: 10,
//   },
//   cancelButtonText: {
//     color: "#666",
//     fontWeight: "bold",
//   },
//   generateButton: {
//     backgroundColor: "#4285F4",
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//   },
//   generateButtonDisabled: {
//     backgroundColor: "#CCCCCC",
//   },
//   generateButtonText: {
//     color: "#FFFFFF",
//     fontWeight: "bold",
//   },
//   qrContainer: {
//     backgroundColor: "white",
//     padding: 20,
//     margin: 20,
//     borderRadius: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 3,
//   },
//   qrInstructions: {
//     textAlign: "center",
//     color: "#666",
//     paddingHorizontal: 20,
//     marginBottom: 20,
//   },
//   qrActions: {
//     width: "100%",
//     padding: 15,
//   },
//   shareButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#4285F4",
//     paddingVertical: 12,
//     borderRadius: 5,
//     marginBottom: 10,
//   },
//   closeQrButton: {
//     alignItems: "center",
//     paddingVertical: 12,
//   },
//   closeQrButtonText: {
//     color: "#666",
//     fontWeight: "bold",
//   },
// });

// export default AdminQRGenerator;
