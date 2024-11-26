import firestore from '@react-native-firebase/firestore';

// Giả sử languages là một mảng đối tượng như sau
const languages = [
    { code: 'en', name: 'English' },
    { code: 'vi', name: 'Tiếng việt' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'bn', name: 'Bengali' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'jv', name: 'Javanese' },
    { code: 'tl', name: 'Tagalog' },
    { code: 'tr', name: 'Turkish' },
    { code: 'sw', name: 'Swahili' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'pl', name: 'Polish' },
    { code: 'nl', name: 'Dutch' },
    { code: 'ro', name: 'Romanian' },
    { code: 'th', name: 'Thai' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'mr', name: 'Marathi' },
    { code: 'cs', name: 'Czech' },
    { code: 'sk', name: 'Slovak' },
    { code: 'sr', name: 'Serbian' },
    { code: 'el', name: 'Greek' },
    { code: 'hu', name: 'Hungarian' },
    { code: 'he', name: 'Hebrew' },
    { code: 'id', name: 'Indonesian' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'fi', name: 'Finnish' },
    { code: 'no', name: 'Norwegian' },
    { code: 'sv', name: 'Swedish' },
    { code: 'da', name: 'Danish' },
    { code: 'pl', name: 'Polish' },
    { code: 'hu', name: 'Hungarian' },
    { code: 'bs', name: 'Bosnian' },
    { code: 'mk', name: 'Macedonian' },
    { code: 'hr', name: 'Croatian' },
    { code: 'sq', name: 'Albanian' },
    { code: 'cy', name: 'Welsh' },
    { code: 'lv', name: 'Latvian' },
    { code: 'lt', name: 'Lithuanian' },
    { code: 'et', name: 'Estonian' },
    { code: 'sq', name: 'Albanian' },
    { code: 'bs', name: 'Bosnian' },
    { code: 'is', name: 'Icelandic' },
    { code: 'mk', name: 'Macedonian' },
    { code: 'af', name: 'Afrikaans' },
    { code: 'km', name: 'Khmer' },
    { code: 'si', name: 'Sinhala' },
    { code: 'ne', name: 'Nepali' },
    { code: 'my', name: 'Burmese' },
    { code: 'lo', name: 'Lao' },
    { code: 'mn', name: 'Mongolian' },
    { code: 'hy', name: 'Armenian' },
    { code: 'ka', name: 'Georgian' },
    { code: 'sr', name: 'Serbian' },
    { code: 'ps', name: 'Pashto' },
    { code: 'ku', name: 'Kurdish' },
    { code: 'sq', name: 'Albanian' },
    { code: 'cy', name: 'Welsh' }
  ];
  

const pushLanguagesToFirestore = async () => {
  try {
    // Kiểm tra nếu languages là mảng hợp lệ
    console.log('languages',languages)
    if (!Array.isArray(languages)) {
      throw new Error('languages is not an array');
    }

    // Duyệt qua từng ngôn ngữ và push vào Firestore
    for (const lang of languages) {
      await firestore()
        .collection('languages')  // Tạo collection "languages"
        .add(lang);               // Thêm dữ liệu vào Firestore
    }

    console.log('All languages have been successfully pushed to Firestore!');
  } catch (error) {
    console.error('Error pushing languages to Firestore: ', error);
  }
};

export default pushLanguagesToFirestore;
