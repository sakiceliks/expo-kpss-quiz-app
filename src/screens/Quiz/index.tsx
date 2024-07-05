import { useEffect, useState } from 'react';
import { Alert, BackHandler, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  interpolate,
  Easing,
  useAnimatedScrollHandler,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

import { styles } from './styles';
import { THEME } from '../../styles/theme';

import { QUIZ } from '../../data/quiz';
import { historyAdd } from '../../storage/quizHistoryStorage';

import { Loading } from '../../components/Loading';
import { Question } from '../../components/Question';
import { QuizHeader } from '../../components/QuizHeader';
import { ConfirmButton } from '../../components/ConfirmButton';
import { OutlineButton } from '../../components/OutlineButton';
import { ProgressBar } from '../../components/ProgressBar';
import { OverlayFeedback } from '../../components/OverlayFeedback';

interface Params {
  id: string;
}

type QuizProps = typeof QUIZ[0];

const CARD_INCLINATION = 10;
const CARD_SKIP_AREA = -200;

export function Quiz() {
  const [puan, setPuan] = useState(0);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [mevcutSoru, setMevcutSoru] = useState(0);
  const [quiz, setQuiz] = useState<QuizProps>({} as QuizProps);
  const [seciliAlternatif, setSeciliAlternatif] = useState<null | number>(null);
  const [cevapDurumu, setCevapDurumu] = useState(0);
  const [quizBitti, setQuizBitti] = useState(false);


  const shake = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const cardPosition = useSharedValue(0);

  const { navigate } = useNavigation();

  const route = useRoute();
  const { id } = route.params as Params;

  async function playSound(dogruMu: boolean) {
    const dosya = dogruMu
      ? require('../../assets/correct.mp3')
      : require('../../assets/wrong.mp3');

    try {
      const { sound } = await Audio.Sound.createAsync(dosya, { shouldPlay: true });

      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch (error) {
      console.error('Ses dosyası yüklenirken hata oluştu:', error);
    }
  }


  useEffect(() => {
    if (quizBitti) {
      handleFinished();
    }
  }, [quizBitti]);


  function handleSkipConfirm() {
    Alert.alert('Geç', 'Soruyu gerçekten geçmek istiyor musunuz?', [
      { text: 'Evet', onPress: () => handleNextQuestion() },
      { text: 'Hayır', onPress: () => { } }
    ]);
  }

  async function handleFinished() {
    await historyAdd({
      id: new Date().getTime().toString(),
      title: quiz.title,
      level: quiz.level,
      points: puan,
      questions: quiz.questions.length
    });

    navigate('finish', {
      points: puan.toString(),
      total: quiz.questions.length.toString(),
    });
  }
  function handleNextQuestion() {
    if (mevcutSoru < quiz.questions.length - 1) {
      setMevcutSoru(prevState => {
        console.log('Current question index before increment:', prevState);
        return prevState + 1;
      });
    } else {
      setQuizBitti(true);
    }
  }
  async function handleConfirm() {
    if (seciliAlternatif === null) {
      return handleSkipConfirm();
    }

    let isCorrect = quiz.questions[mevcutSoru].correct === seciliAlternatif;

    if (isCorrect) {
      setPuan(prevPuan => {
        console.log('Puan artırılıyor. Yeni puan:', prevPuan + 1);
        return prevPuan + 1;
      });
      await playSound(true);
      setCevapDurumu(1);
    } else {
      await playSound(false);
      setCevapDurumu(2);
      await shakeAnimation();
    }

    setSeciliAlternatif(null);

    // Son soru kontrolü
    if (mevcutSoru === quiz.questions.length - 1) {
      setTimeout(() => setQuizBitti(true), 1000); // Puanın güncellenmesi için kısa bir gecikme
    } else {
      handleNextQuestion();
    }
  }

  

  function handleStop() {
    Alert.alert('Durdur', 'Şimdi durdurmak istiyor musunuz?', [
      {
        text: 'Hayır',
        style: 'cancel',
      },
      {
        text: 'Evet',
        style: 'destructive',
        onPress: () => navigate('home')
      },
    ]);

    return true;
  }

  async function shakeAnimation() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  
    shake.value = withSequence(
      withTiming(3, { duration: 400, easing: Easing.bounce }),
      withTiming(0)
    );
  }

  const shakeStyleAnimated = useAnimatedStyle(() => ({
    transform: [{
      translateX: interpolate(
        shake.value,
        [0, 0.5, 1, 1.5, 2, 2.5, 3],
        [0, -15, 0, 15, 0, -15, 0],
      ),
    }]
  }));

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    }
  });

  const fixedProgressBarStyles = useAnimatedStyle(() => ({
    position: 'absolute',
    zIndex: 1,
    paddingTop: 50,
    backgroundColor: THEME.COLORS.GREY_500,
    width: '110%',
    left: '-5%',
    opacity: interpolate(scrollY.value, [50, 90], [0, 1], Extrapolate.CLAMP),
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [50, 100],
          [-40, 0],
          Extrapolate.CLAMP,
        )
      }
    ]
  }));

  const headerStyles = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [60, 90], [1, 0], Extrapolate.CLAMP),
  }));

  const onPan = Gesture
    .Pan()
    .activateAfterLongPress(200)
    .onUpdate(event => {
      const solaKaydir = event.translationX < 0;

      if (solaKaydir) {
        cardPosition.value = event.translationX;
      }
    })
    .onEnd(event => {
      if (event.translationX < CARD_SKIP_AREA) {
        runOnJS(handleSkipConfirm)();
      }

      cardPosition.value = withTiming(0);
    });

  const dragStyles = useAnimatedStyle(() => {
    const rotateZ = cardPosition.value / CARD_INCLINATION;

    return {
      transform: [
        { translateX: cardPosition.value },
        { rotateZ: `${rotateZ}deg` }
      ]
    }
  });

  useEffect(() => {
    const quizSelected = QUIZ.filter(item => item.id === id)[0];

    setQuiz(quizSelected);
    setYukleniyor(false);
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleStop,
    );

    return () => backHandler.remove();
  }, []);

  if (yukleniyor) {
    return <Loading />
  }

  return (
    <View style={styles.container}>
      <OverlayFeedback status={cevapDurumu} />

      <Animated.View style={fixedProgressBarStyles}>
        <Text style={styles.title}>{quiz.title}</Text>

        <ProgressBar
          total={quiz.questions.length}
          current={mevcutSoru + 1}
        />
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.question}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <Animated.View style={[styles.header, headerStyles]}>
          <QuizHeader
            title={quiz.title}
            currentQuestion={mevcutSoru + 1}
            totalOfQuestions={quiz.questions.length}
          />
        </Animated.View>

        <GestureDetector gesture={onPan}>
          <Animated.View style={[shakeStyleAnimated, dragStyles]}>
            <Question
              key={quiz.questions[mevcutSoru].title}
              question={quiz.questions[mevcutSoru]}
              alternativeSelected={seciliAlternatif}
              setAlternativeSelected={setSeciliAlternatif}
              onUnmount={() => setCevapDurumu(0)}
            />
          </Animated.View>
        </GestureDetector>

        <View style={styles.footer}>
          <OutlineButton title="Durdur" onPress={handleStop} />
          <ConfirmButton onPress={handleConfirm} />
        </View>
      </Animated.ScrollView>
    </View >
  );
}
